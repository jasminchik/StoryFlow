import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEye, FiStar, FiMessageSquare, FiChevronDown, FiCheck } from 'react-icons/fi';
import Header from '../../components/Header';
import styles from './MangaDetails.module.scss';

const MangaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // States
  const [activeTab, setActiveTab] = useState('about');
  const [isListsOpen, setIsListsOpen] = useState(false);
  const [userList, setUserList] = useState(null);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [userRating, setUserRating] = useState(0);

  // Constants & Static Data
  const listLabels = useMemo(() => ({
    reading: 'Читаю',
    planned: 'В планах',
    dropped: 'Кинуто',
    read: 'Прочитано',
    favorites: 'В Обраному'
  }), []);

  const initialRatingStats = useMemo(() => ({
    10: 1576,
    9: 261,
    8: 187,
    7: 45,
    6: 26,
    5: 17,
    4: 6,
    3: 4,
    2: 2,
    1: 2,
  }), []);

  const [stats, setStats] = useState(initialRatingStats);

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

  const manga = useMemo(() => ({
    id: id,
    title: 'Блю Лок',
    originalTitle: 'ブルーロック',
    rating: 9.32,
    type: 'Манґа',
    year: 2018,
    status: 'Онґоінґ',
    authors: 'Мунеюкі Канешіро, Юсуке Номура',
    genres: ['Спорт', 'Драма', 'Сьонен'],
    description: 'Після нищівної поразки збірної Японії на Чемпіонаті світу 2018 року, Японська футбольна асоціація вирішує піти на радикальні заходи. Щоб нарешті здобути кубок, вони наймають ексцентричного та загадкового тренера Еґо Джінпачі. Його план шокує: він створює "Блю Лок" — спеціальну в\'язницю-тренувальний табір, де 300 найкращих нападників середніх шкіл змагатимуться за право стати єдиним, "найбільш егоїстичним" форвардом країни. Той, хто програє, назавжди втратить шанс грати за збірну. Головний герой, Йоічі Ісаґі, вирішує кинути виклик системі та власним страхам, щоб стане найкращим у світі.',
    image: '/uploads/blue_lock.jpg',
    bannerImage: null,
    chapters: 245
  }), [id]);

  const tabs = [
    { id: 'about', label: 'Про тайтл' },
    { id: 'chapters', label: 'Розділи' },
    { id: 'discussions', label: 'Обговорення' },
    { id: 'comments', label: 'Коментарі' },
    { id: 'reviews', label: 'Відгуки' },
    { id: 'fanfics', label: 'Література/Фанфік' }
  ];

  const chapters = [
    { id: 1, title: 'Том 1. Розділ 3 — Вибір', date: '18.05.2024', views: '12.4K' },
    { id: 2, title: 'Том 1. Розділ 2 — Зустріч', date: '15.05.2024', views: '14.1K' },
    { id: 3, title: 'Том 1. Розділ 1 — Початок', date: '12.05.2024', views: '18.2K' },
  ];

  const similarManga = [
    { id: 'haikyuu', title: 'Волейбол!!', image: '/uploads/novel.jpg' },
    { id: 'ao_ashi', title: 'Ао Аші', image: '/uploads/blue_lock.jpg' },
    { id: 'kuroko', title: 'Баскетбол Куроко', image: '/uploads/naruto.jpg' },
  ];

  const fanfics = [
    { id: 1, title: 'Епізод Наґі: Шлях до геніальності', isOfficial: true, author: 'Кота Саномія' },
    { id: 2, title: 'Ісаґі: Тінь егоїзму', isOfficial: false, author: 'FanWriter99' },
  ];

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
              <p>{manga.description}</p>
            </div>
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
          </div>
        );
      case 'chapters':
        return (
          <div className={styles.chaptersList}>
            {chapters.map(chapter => (
              <div key={chapter.id} className={styles.chapterItem}>
                <div className={styles.chapterMain}>
                  <span className={styles.chapterTitle}>{chapter.title}</span>
                  <div className={styles.chapterMeta}>
                    <span className={styles.views}><FiEye size={14} className={styles.eyeIcon} /> {chapter.views}</span>
                    <span className={styles.date}>{chapter.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'fanfics':
        return (
          <div className={styles.fanficsList}>
            {fanfics.map(fic => (
              <div key={fic.id} className={styles.fanficItem}>
                <div className={styles.fanficHeader}>
                  <span className={styles.fanficTitle}>{fic.title}</span>
                  {fic.isOfficial && <span className={styles.officialBadge}>Офіційний Література/Фанфік</span>}
                </div>
                <span className={styles.fanficAuthor}>Автор: {fic.author}</span>
              </div>
            ))}
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

  return (
    <div className={styles.detailsWrapper}>
      <Header />

      <section className={styles.heroSection}>
        <div className={styles.bannerContainer}>
          {manga.bannerImage ? (
            <img src={manga.bannerImage} className={styles.banner} alt="Banner" />
          ) : (
            <div className={styles.bannerPlaceholder} />
          )}
        </div>
      </section>

      <div className={styles.mainContainer}>
        <div className={styles.mangaHeader}>
          <div className={styles.posterWrapper}>
            <img src={manga.image} alt={manga.title} className={styles.poster} />
          </div>
          
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>{manga.title}</h1>
              <p className={styles.originalTitle}>{manga.originalTitle}</p>
            </div>

            <div className={styles.mainStats}>
              <div className={styles.ratingBox}>
                <FiStar size={18} className={styles.star} fill="currentColor" />
                <span className={styles.ratingValue}>{manga.rating}</span>
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
                <span className={styles.value}>{manga.year}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Статус</span>
                <span className={styles.value}>{manga.status}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Автори</span>
                <span className={styles.value}>{manga.authors}</span>
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
