import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import styles from './MangaDetails.module.scss';

const MangaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('about');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  // Mock data for the specific manga
  const manga = {
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
    bannerImage: null, // Will test placeholder logic
    chapters: 245
  };

  const ratingStats = {
    10: { percent: 74, count: 1576 },
    9: { percent: 12.5, count: 261 },
    8: { percent: 8.7, count: 187 },
    7: { percent: 2.1, count: 45 },
    6: { percent: 1.2, count: 26 },
    5: { percent: 0.8, count: 17 },
    4: { percent: 0.3, count: 6 },
    3: { percent: 0.2, count: 4 },
    2: { percent: 0.1, count: 2 },
    1: { percent: 0.1, count: 2 },
  };

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.some(item => String(item.id) === String(id)));
  }, [id]);

  const handleToggleSave = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    let newFavorites;
    
    if (isFavorite) {
      newFavorites = favorites.filter(item => String(item.id) !== String(id));
      setIsFavorite(false);
    } else {
      newFavorites = [...favorites, manga];
      setIsFavorite(true);
    }
    
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const chapters = [
    { id: 1, title: 'Том 1. Розділ 1 — Початок', date: '12.05.2024' },
    { id: 2, title: 'Том 1. Розділ 2 — Зустріч', date: '15.05.2024' },
    { id: 3, title: 'Том 1. Розділ 3 — Вибір', date: '18.05.2024' },
  ];

  const reviews = [
    { id: 1, user: 'AnimeFan', text: 'Це найкраща спортивна манґа, яку я коли-небудь читав!', rating: 10 },
    { id: 2, user: 'MangaReader', text: 'Дуже динамічно і цікаво.', rating: 9 },
  ];

  const getBarColor = (rating) => {
    if (rating >= 8) return '#2ecc71'; // Green
    if (rating >= 6) return '#f1c40f'; // Yellow
    if (rating >= 4) return '#95a5a6'; // Grey
    return '#e67e22'; // Orange/Red
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
        <div className={styles.contentGrid}>
          {/* Left Column: Poster and Buttons */}
          <aside className={styles.leftColumn}>
            <div className={styles.posterWrapper}>
              <img src={manga.image} alt={manga.title} className={styles.poster} />
            </div>
            <div className={styles.actionButtons}>
              <button className={styles.readBtn}>Читати</button>
              <button 
                className={`${styles.favoriteBtn} ${isFavorite ? styles.active : ''}`}
                onClick={handleToggleSave}
              >
                {isFavorite ? (
                  <><span>✔</span> В Обраному</>
                ) : (
                  <><span>❤</span> Додати в Обране</>
                )}
              </button>
            </div>

            {/* Statistics Histogram */}
            <div className={styles.statsBlock}>
              <h3 className={styles.statsTitle}>Оцінки користувачів</h3>
              <div className={styles.histogram}>
                {Object.entries(ratingStats).reverse().map(([rate, stat]) => (
                  <div key={rate} className={styles.histoRow}>
                    <span className={styles.rateLabel}>{rate} ★</span>
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

          {/* Right Column: Info and Tabs */}
          <main className={styles.rightColumn}>
            <div className={styles.headerInfo}>
              <h1 className={styles.title}>{manga.title}</h1>
              <p className={styles.originalTitle}>{manga.originalTitle}</p>
              
              <div className={styles.statsRow}>
                <div className={styles.ratingBox}>
                  <span className={styles.star}>⭐</span>
                  <span className={styles.ratingValue}>{manga.rating}</span>
                </div>
                <div className={styles.rateActionWrapper}>
                  <button 
                    className={styles.rateBtn}
                    onClick={() => setIsRatingOpen(!isRatingOpen)}
                  >
                    ★ Оцінити
                  </button>
                  {isRatingOpen && (
                    <div className={styles.ratingPopup}>
                      {[1,2,3,4,5,6,7,8,9,10].map((star) => (
                        <span 
                          key={star}
                          className={`${styles.popupStar} ${(hoverRating || 0) >= star ? styles.hovered : ''}`}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => {
                            console.log(`Rated ${star}`);
                            setIsRatingOpen(false);
                          }}
                        >
                          ★
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
                    {manga.genres.map(genre => (
                      <span key={genre} className={styles.genreBadge}>{genre}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs System */}
            <div className={styles.tabsContainer}>
              <div className={styles.tabsHeader}>
                <button 
                  className={`${styles.tabBtn} ${activeTab === 'about' ? styles.active : ''}`}
                  onClick={() => setActiveTab('about')}
                >
                  Про тайтл
                </button>
                <button 
                  className={`${styles.tabBtn} ${activeTab === 'chapters' ? styles.active : ''}`}
                  onClick={() => setActiveTab('chapters')}
                >
                  Розділи ({chapters.length})
                </button>
                <button 
                  className={`${styles.tabBtn} ${activeTab === 'reviews' ? styles.active : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Відгуки
                </button>
              </div>

              <div className={styles.tabContent}>
                {activeTab === 'about' && (
                  <div className={styles.description}>
                    <p>{manga.description}</p>
                  </div>
                )}

                {activeTab === 'chapters' && (
                  <div className={styles.chaptersList}>
                    {chapters.map(chapter => (
                      <div key={chapter.id} className={styles.chapterItem}>
                        <span className={styles.chapterTitle}>{chapter.title}</span>
                        <span className={styles.chapterDate}>{chapter.date}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className={styles.reviewsList}>
                    {reviews.map(review => (
                      <div key={review.id} className={styles.reviewItem}>
                        <div className={styles.reviewHeader}>
                          <span className={styles.reviewUser}>{review.user}</span>
                          <span className={styles.reviewRating}>⭐ {review.rating}</span>
                        </div>
                        <p className={styles.reviewText}>{review.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MangaDetails;
