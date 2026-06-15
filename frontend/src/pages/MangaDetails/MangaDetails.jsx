import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiEye, FiStar, FiMessageSquare, FiChevronDown, FiCheck, FiArrowLeft, FiEdit2, FiHeart } from 'react-icons/fi';
import Header from '../../components/Header';
import InteractionSection from '../../components/InteractionSection';
import styles from './MangaDetails.module.scss';

// Статичні дані виносимо за межі компонента для стабільності
const TABS = [
  { id: 'about', label: 'Про тайтл' },
  { id: 'chapters', label: 'Розділи' },
  { id: 'discussions', label: 'Обговорення' },
  { id: 'comments', label: 'Коментарі' },
  { id: 'reviews', label: 'Відгуки' },
  { id: 'fanfics', label: 'Література/Фанфік' }
];

const LIST_LABELS = {
  reading: 'Читаю',
  planned: 'В планах',
  dropped: 'Кинуто',
  read: 'Прочитано',
  favorites: 'В Обраному'
};

const API_BASE = 'http://localhost:5000';

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
  const [fanfics, setFanfics] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');
  
  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE}${path}`;
  };

  const isAuthor = useMemo(() => {
    if (!manga || !loggedInUser) return false;
    const authorId = manga.author?._id || manga.author;
    const userId = loggedInUser.id || loggedInUser._id;
    return String(authorId) === String(userId);
  }, [manga, loggedInUser]);

  const fetchMangaDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/manga/${id}`);
      const result = await response.json();
      if (result.success) {
        const mangaData = result.data;
        setManga(mangaData);
        setLikeCount(mangaData.likes?.length || 0);
        
        if (loggedInUser) {
          const userId = loggedInUser.id || loggedInUser._id;
          setIsLiked(mangaData.likes?.some(uid => String(uid) === String(userId)));

          try {
            const rateRes = await fetch(`${API_BASE}/api/manga/${id}/my-rate`, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const rateData = await rateRes.json();
            if (rateData.success) {
              setUserRating(rateData.data || 0);
            }
          } catch (rErr) {
            console.error('Помилка завантаження оцінки:', rErr);
          }
        }
        
        try {
          const fanficsRes = await fetch(`${API_BASE}/api/literature/manga/${id}`);
          const fanficsData = await fanficsRes.json();
          if (fanficsData.success) {
            setFanfics(Array.isArray(fanficsData.data) ? fanficsData.data : []);
          }
        } catch (fErr) {
          console.error('Помилка завантаження фанфіків:', fErr);
        }
      }
    } catch (err) {
      console.error('Помилка завантаження тайтлу:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchMangaDetails();
  }, [id]);

  const handleLike = async () => {
    if (!loggedInUser) {
      alert('Будь ласка, увійдіть, щоб ставити лайки');
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/api/manga/${id}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setIsLiked(data.isLiked);
        setLikeCount(data.data.length);
      }
    } catch (err) {
      console.error('Помилка лайку:', err);
    }
  };

  const handleRate = async (score) => {
    if (!loggedInUser) {
      alert('Будь ласка, увійдіть, щоб ставити оцінки');
      return;
    }
    if (score === userRating) return;
    try {
      const response = await fetch(`${API_BASE}/api/manga/${id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ score })
      });
      const result = await response.json();
      if (result.success) {
        setUserRating(result.data.score);
        setManga(prev => ({
          ...prev,
          averageRating: result.data.averageRating,
          ratingCount: result.data.ratingCount,
          ratingStats: result.data.ratingStats
        }));
        setIsRatingOpen(false);
      }
    } catch (err) {
      console.error('Помилка при виставленні оцінки:', err);
    }
  };

  const handleSelectList = (listName) => {
    const lists = JSON.parse(localStorage.getItem('user_manga_lists') || '{}');
    if (userList === listName) {
      delete lists[id];
      setUserList(null);
    } else {
      lists[id] = listName;
      setUserList(listName);
    }
    localStorage.setItem('user_manga_lists', JSON.stringify(lists));
    setIsListsOpen(false);
  };

  const getBarColor = (rating) => {
    if (rating >= 8) return '#2ecc71';
    if (rating >= 6) return '#f1c40f';
    if (rating >= 4) return '#95a5a6';
    return '#e67e22';
  };

  useEffect(() => {
    const lists = JSON.parse(localStorage.getItem('user_manga_lists') || '{}');
    if (lists[id]) setUserList(lists[id]);
  }, [id]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <div className={styles.aboutTab}>
            <div className={styles.description}>
              <p>{manga?.description || 'Опис відсутній.'}</p>
            </div>
          </div>
        );
      case 'chapters':
        return <div className={styles.placeholderTab}><p>Розділів ще немає.</p></div>;
      case 'comments':
        return <InteractionSection type="comment" targetId={id} resourceType="Manga" />;
      case 'reviews':
        return <InteractionSection type="review" targetId={id} resourceType="Manga" />;
      case 'discussions':
        return <InteractionSection type="discussion" targetId={id} resourceType="Manga" />;
      case 'fanfics':
        return (
          <div className={styles.fanficsList}>
            {loggedInUser && (
              <button className={styles.writeFanficBtn} onClick={() => navigate(`/create-fanfic?mangaId=${id}`)}>
                <FiEdit2 /> <span>Написати свій фанфік</span>
              </button>
            )}
            {Array.isArray(fanfics) && fanfics.length > 0 ? (
              fanfics.map(fic => (
                <div key={fic._id} className={styles.fanficItem} onClick={() => navigate(`/fanfic/${fic._id}`)}>
                  <div className={styles.fanficHeader}>
                    <div className={styles.fanficTitleRow}>
                      <span className={styles.fanficTitle}>{fic.title}</span>
                      {fic.isOfficial && <span className={styles.officialBadge}>Від автора</span>}
                    </div>
                    <span className={styles.fanficAuthor}>Автор: {fic.author?.username || 'Невідомо'}</span>
                  </div>
                  <p className={styles.fanficSnippet}>
                    {fic.description ? (fic.description.length > 150 ? fic.description.substring(0, 150) + '...' : fic.description) : 'Опис відсутній...'}
                  </p>
                </div>
              ))
            ) : (
              <div className={styles.placeholderTab}><p>Літератури/Фанфіків ще немає.</p></div>
            )}
          </div>
        );
      default:
        return null;
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
          {manga.bannerImage ? <img src={getFullUrl(manga.bannerImage)} className={styles.banner} alt="Banner" /> : <div className={styles.bannerPlaceholder} />}
        </div>
      </section>

      <div className={styles.mainContainer}>
        <div className={styles.mangaHeader}>
          <div className={styles.posterWrapper}>
            <img src={manga.coverImage ? getFullUrl(manga.coverImage) : ''} alt={manga.title} className={styles.poster} />
          </div>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>{manga.title}</h1>
              {manga.alternativeTitle && <p className={styles.originalTitle}>{manga.alternativeTitle}</p>}
            </div>
            <div className={styles.mainStats}>
              <div className={styles.ratingBox}>
                <FiStar size={18} className={styles.star} fill="currentColor" />
                <span className={styles.ratingValue}>{manga.averageRating?.toFixed(1) || '0.0'}</span>
              </div>
            </div>
          </div>
          <div className={styles.actionButtons}>
            <button className={styles.readBtn}>Читати</button>
            {isAuthor && <button className={styles.editBtn} onClick={() => navigate(`/edit-manga/${manga._id}`)}>Редагувати</button>}
            <div className={styles.listsContainer}>
              <button className={`${styles.listsBtn} ${userList ? styles.active : ''}`} onClick={() => setIsListsOpen(!isListsOpen)}>
                {userList ? LIST_LABELS[userList] : 'Додати в плани'}
                <FiChevronDown size={18} className={`${styles.arrow} ${isListsOpen ? styles.open : ''}`} />
              </button>
              {isListsOpen && (
                <div className={styles.listsDropdown}>
                  {Object.entries(LIST_LABELS).map(([key, label]) => (
                    <div key={key} className={`${styles.listItem} ${userList === key ? styles.selected : ''}`} onClick={() => handleSelectList(key)}>
                      {label} {userList === key && <FiCheck size={16} />}
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
                {[10,9,8,7,6,5,4,3,2,1].map((rate) => {
                  const stat = manga.ratingStats?.[rate] || { count: 0, percentage: 0 };
                  return (
                    <div key={rate} className={styles.histoRow}>
                      <span className={styles.rateLabel}>{rate} <FiStar size={12} fill="currentColor" /></span>
                      <div className={styles.barContainer}>
                        <div className={styles.barFill} style={{ width: `${stat.percentage}%`, backgroundColor: getBarColor(rate) }} />
                      </div>
                      <span className={styles.rateStats}>{stat.percentage}% <span className={styles.rateCount}>({stat.count})</span></span>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          <main className={styles.rightColumn}>
            <div className={styles.rateActionArea}>
              <div className={styles.rateActionWrapper}>
                <button className={styles.rateBtn} onClick={() => setIsRatingOpen(!isRatingOpen)}>
                  {userRating > 0 ? <><FiStar size={16} fill="currentColor" /> Ваша оцінка: {userRating}</> : <><FiStar size={16} /> Оцінити</>}
                </button>
                {isRatingOpen && (
                  <div className={styles.ratingPopup}>
                    {[1,2,3,4,5,6,7,8,9,10].map((star) => (
                      <span key={star} className={`${styles.popupStar} ${(hoverRating || userRating) >= star ? styles.hovered : ''}`}
                        onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => handleRate(star)}>
                        <FiStar size={20} fill={(hoverRating || userRating) >= star ? "currentColor" : "none"} />
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.infoBlock}>
              <div className={styles.infoItem}><span className={styles.label}>Тип</span><span className={styles.value}>{manga.type}</span></div>
              <div className={styles.infoItem}><span className={styles.label}>Рік</span><span className={styles.value}>{manga.releaseYear}</span></div>
              <div className={styles.infoItem}><span className={styles.label}>Статус</span><span className={styles.value}>{manga.status}</span></div>
              <div className={styles.infoItem}><span className={styles.label}>Автор</span><span className={styles.value}>{manga.author?.username || 'Невідомо'}</span></div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Характеристики</span>
                <div className={styles.mangaSpecs}>
                   <div className={`${styles.specLike} ${isLiked ? styles.liked : ''}`} onClick={handleLike}>
                      <FiHeart size={16} fill={isLiked ? "#ff4d00" : "none"} />
                      <span>{likeCount} вподобань</span>
                   </div>
                </div>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Жанри</span>
                <div className={styles.genresList}>
                  {manga.genres && manga.genres.map(genre => <span key={genre} className={styles.genreBadge}>{genre}</span>)}
                </div>
              </div>
            </div>

            <div className={styles.tabsContainer}>
              <div className={styles.tabsMenu}>
                {TABS.map(tab => (
                  <button key={tab.id} className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
                ))}
              </div>
              <div className={styles.tabContent}>{renderTabContent()}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MangaDetails;
