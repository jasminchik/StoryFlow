import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEye, FiStar, FiMessageSquare, FiChevronDown, FiCheck, FiArrowLeft } from 'react-icons/fi';
import Header from '../../components/Header';
import styles from './MangaDetails.module.scss';

const MangaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // States
  const [manga, setManga] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [isListsOpen, setIsListsOpen] = useState(false);
  const [userList, setUserList] = useState(null);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [userRating, setUserRating] = useState(0);

  const API_BASE = 'http://localhost:5000';

  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE}${path}`;
  };

  const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');
  const isAuthor = manga && loggedInUser && (manga.author?._id === loggedInUser.id || manga.author === loggedInUser.id || manga.author?._id === loggedInUser._id || manga.author === loggedInUser._id);

  // Constants & Static Data
  const listLabels = useMemo(() => ({
    reading: 'Читаю',
    planned: 'В планах',
    dropped: 'Кинуто',
    read: 'Прочитано',
    favorites: 'В Обраному'
  }), []);

  const [stats, setStats] = useState({
    10: 0, 9: 0, 8: 0, 7: 0, 6: 0, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0,
  });

  useEffect(() => {
    const fetchMangaDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/manga/${id}`);
        const result = await response.json();
        if (result.success) {
          setManga(result.data);
        } else {
          console.error('Помилка:', result.error);
        }
      } catch (err) {
        console.error('Помилка завантаження тайтлу:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchMangaDetails();
    }
  }, [id]);

  // Derived stats for rendering
  const processedStats = useMemo(() => {
    const totalVotes = Object.values(stats).reduce((sum, count) => sum + count, 0);
    const result = {};
    Object.keys(stats).forEach(key => {
      result[key] = {
        count: stats[key],
        percent: totalVotes > 0 ? parseFloat(((stats[key] / totalVotes) * 100).toFixed(2)) : 0
      };
    });
    return result;
  }, [stats]);

  const tabs = [
    { id: 'about', label: 'Про тайтл' },
    { id: 'chapters', label: 'Розділи' },
    { id: 'discussions', label: 'Обговорення' },
    { id: 'comments', label: 'Коментарі' },
    { id: 'reviews', label: 'Відгуки' },
    { 
      id: 'fanfics', 
      label: window.innerWidth <= 768 ? 'Література' : 'Література/Фанфік' 
    }
  ];

  // Placeholder chapters until backend is ready
  const chapters = [];

  const similarManga = [];

  const fanfics = [];

  // Helper Functions
  const updateStatsDynamically = (newScore, oldScore) => {
    setStats(prevStats => {
      const newStats = { ...prevStats };
      if (oldScore > 0 && newStats[oldScore] !== undefined) {
        newStats[oldScore] = Math.max(0, newStats[oldScore] - 1);
      }
      if (newScore > 0 && newStats[newScore] !== undefined) {
        newStats[newScore] = newStats[newScore] + 1;
      }
      return newStats;
    });
  };

  const handleRate = (score) => {
    if (score === userRating) return;
    updateStatsDynamically(score, userRating);
    setUserRating(score);
    localStorage.setItem(`manga_${id}_rating`, score);
    setIsRatingOpen(false);
  };

  const handleSelectList = (listName) => {
    const lists = JSON.parse(localStorage.getItem('user_manga_lists') || '{}');
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    let newFavorites = [...favorites];
    
    const removeFromGlobalFavorites = () => {
      newFavorites = newFavorites.filter(item => String(item.id) !== String(id));
    };

    const addToGlobalFavorites = () => {
      if (!newFavorites.some(item => String(item.id) === String(id))) {
        newFavorites.push(manga);
      }
    };

    if (userList === listName) {
      delete lists[id];
      setUserList(null);
      if (listName === 'favorites') removeFromGlobalFavorites();
    } else {
      const oldList = userList;
      lists[id] = listName;
      setUserList(listName);
      if (oldList === 'favorites') removeFromGlobalFavorites();
      if (listName === 'favorites') addToGlobalFavorites();
    }
    
    localStorage.setItem('user_manga_lists', JSON.stringify(lists));
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setIsListsOpen(false);
  };

  const getBarColor = (rating) => {
    if (rating >= 8) return '#2ecc71';
    if (rating >= 6) return '#f1c40f';
    if (rating >= 4) return '#95a5a6';
    return '#e67e22';
  };

  // Effects
  useEffect(() => {
    const lists = JSON.parse(localStorage.getItem('user_manga_lists') || '{}');
    if (lists[id]) setUserList(lists[id]);

    const savedRating = localStorage.getItem(`manga_${id}_rating`);
    if (savedRating) {
      const score = parseInt(savedRating);
      setUserRating(score);
      updateStatsDynamically(score, 0);
    }
  }, [id]);

  // Render content function
  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <div className={styles.aboutTab}>
            <div className={styles.description}>
              <p>{manga?.description}</p>
            </div>
            {similarManga.length > 0 && (
              <div className={styles.similarSection}>
                <h3 className={styles.sectionTitle}>Схоже</h3>
                <div className={styles.similarGrid}>
                  {similarManga.map(item => (
                    <div key={item.id} className={styles.similarCard}>
                      <img src={item.image} alt={item.title} />
                      <span className={styles.similarTitle}>{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'chapters':
        return (
          <div className={styles.chaptersList}>
            {chapters.length > 0 ? (
              chapters.map(chapter => (
                <div key={chapter.id} className={styles.chapterItem}>
                  <div className={styles.chapterMain}>
                    <span className={styles.chapterTitle}>{chapter.title}</span>
                    <div className={styles.chapterMeta}>
                      <span className={styles.views}><FiEye size={14} className={styles.eyeIcon} /> {chapter.views}</span>
                      <span className={styles.date}>{chapter.date}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.placeholderTab}>
                <p>Розділів ще немає.</p>
              </div>
            )}
          </div>
        );
      case 'fanfics':
        return (
          <div className={styles.fanficsList}>
            {fanfics.length > 0 ? (
              fanfics.map(fic => (
                <div key={fic.id} className={styles.fanficItem}>
                  <div className={styles.fanficHeader}>
                    <span className={styles.fanficTitle}>{fic.title}</span>
                    {fic.isOfficial && <span className={styles.officialBadge}>Офіційний Література/Фанфік</span>}
                  </div>
                  <span className={styles.fanficAuthor}>Автор: {fic.author}</span>
                </div>
              ))
            ) : (
              <div className={styles.placeholderTab}>
                <p>Літератури/Фанфіків ще немає.</p>
              </div>
            )}
          </div>
        );
      default:
        const currentTabLabel = tabs.find(t => t.id === activeTab)?.label || 'Контент';
        return (
          <div className={styles.placeholderTab}>
            <div className={styles.placeholderIcon}><FiMessageSquare size={48} /></div>
            <p>Тут з'являться {currentTabLabel.toLowerCase()} користувачів. Функціонал у розробці!</p>
          </div>
        );
    }
  };

  if (isLoading) return <div className={styles.loading}>Завантаження...</div>;
  if (!manga) return (
    <div className={styles.errorContainer}>
      <h2>Тайтл не знайдено</h2>
      <button onClick={() => navigate('/catalog')}><FiArrowLeft /> До каталогу</button>
    </div>
  );

  return (
    <div className={styles.detailsWrapper}>
      <Header />

      <section className={styles.heroSection}>
        <div className={styles.bannerContainer}>
          {manga.bannerImage ? (
            <img src={getFullUrl(manga.bannerImage)} className={styles.banner} alt="Banner" />
          ) : (
            <div className={styles.bannerPlaceholder} />
          )}
        </div>
      </section>

      <div className={styles.mainContainer}>
        <div className={styles.mangaHeader}>
          <div className={styles.posterWrapper}>
            <img src={getFullUrl(manga.coverImage)} alt={manga.title} className={styles.poster} />
          </div>
          
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>{manga.title}</h1>
              {manga.alternativeTitle && <p className={styles.originalTitle}>{manga.alternativeTitle}</p>}
            </div>

            <div className={styles.mainStats}>
              <div className={styles.ratingBox}>
                <FiStar size={18} className={styles.star} fill="currentColor" />
                <span className={styles.ratingValue}>{manga.rating || '0.0'}</span>
              </div>
              <div className={styles.mobileMeta}>
                <span className={styles.type}>{manga.type}</span>
                <span className={styles.dot}>•</span>
                <span className={styles.status}>{manga.status}</span>
              </div>
            </div>
          </div>

          <div className={styles.actionButtons}>
            <button className={styles.readBtn}>Читати</button>
            {isAuthor && (
              <button 
                className={styles.editBtn} 
                onClick={() => navigate(`/edit-manga/${manga._id}`)}
              >
                Редагувати
              </button>
            )}
            <div className={styles.listsContainer}>
              <button 
                className={`${styles.listsBtn} ${userList ? styles.active : ''}`}
                onClick={() => setIsListsOpen(!isListsOpen)}
              >
                {userList ? listLabels[userList] : 'Додати в плани'}
                <FiChevronDown size={18} className={`${styles.arrow} ${isListsOpen ? styles.open : ''}`} />
              </button>
              {isListsOpen && (
                <div className={styles.listsDropdown}>
                  {Object.entries(listLabels).map(([key, label]) => (
                    <div 
                      key={key} 
                      className={`${styles.listItem} ${userList === key ? styles.selected : ''}`}
                      onClick={() => handleSelectList(key)}
                    >
                      {label}
                      {userList === key && <FiCheck size={16} className={styles.check} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.contentGrid}>
          <aside className={styles.leftColumn}>
            <div className={styles.statsBlock}>
              <h3 className={styles.statsTitle}>Оцінки користувачів</h3>
              <div className={styles.histogram}>
                {Object.entries(processedStats).reverse().map(([rate, stat]) => (
                  <div key={rate} className={styles.histoRow}>
                    <span className={styles.rateLabel}>{rate} <FiStar size={12} fill="currentColor" /></span>
                    <div className={styles.barContainer}>
                      <div 
                        className={styles.barFill} 
                        style={{ 
                          width: `${stat.percent}%`,
                          backgroundColor: getBarColor(parseInt(rate))
                        }} 
                      />
                    </div>
                    <span className={styles.rateStats}>
                      {stat.percent}% <span className={styles.rateCount}>({stat.count})</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main className={styles.rightColumn}>
            <div className={styles.rateActionArea}>
              <div className={styles.rateActionWrapper}>
                <button 
                  className={styles.rateBtn}
                  onClick={() => setIsRatingOpen(!isRatingOpen)}
                >
                  {userRating > 0 ? <><FiStar size={16} fill="currentColor" /> Ваша оцінка: {userRating}</> : <><FiStar size={16} /> Оцінити</>}
                </button>
                {isRatingOpen && (
                  <div className={styles.ratingPopup}>
                    {[1,2,3,4,5,6,7,8,9,10].map((star) => (
                      <span 
                        key={star}
                        className={`${styles.popupStar} ${(hoverRating || userRating) >= star ? styles.hovered : ''}`}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => handleRate(star)}
                      >
                        <FiStar size={20} fill={(hoverRating || userRating) >= star ? "currentColor" : "none"} />
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.infoBlock}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Тип</span>
                <span className={styles.value}>{manga.type}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Рік</span>
                <span className={styles.value}>{manga.releaseYear}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Статус</span>
                <span className={styles.value}>{manga.status}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Автор</span>
                <span className={styles.value}>{manga.author?.username || 'Невідомо'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Жанри / Теги</span>
                <div className={styles.genresList}>
                  {manga.genres && manga.genres.map(genre => (
                    <span key={genre} className={styles.genreBadge}>{genre}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.tabsContainer}>
              <div className={styles.tabsMenu}>
                {tabs.map(tab => (
                  <button 
                    key={tab.id}
                    className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className={styles.tabContent}>
                {renderTabContent()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MangaDetails;
