import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import styles from './MangaDetails.module.scss';

const MangaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('about');
  const [isSaved, setIsSaved] = useState(false);

  // Mock data for the specific manga
  const manga = {
    id: id,
    title: 'Blue Lock',
    originalTitle: 'ブルーロック',
    rating: 4.8,
    type: 'Манґа',
    year: 2018,
    status: 'Онґоінґ',
    authors: 'Мунеюкі Канешіро, Юсуке Номура',
    genres: ['Спорт', 'Драма', 'Сьонен'],
    description: 'Після поразки збірної Японії на Чемпіонаті світу 2018 року Японська футбольна асоціація вирішує найняти загадкового тренера Еґо Джінпачі, щоб той допоміг збірній виграти ЧС. Еґо вважає, що Японії не вистачає егоїстичного нападника, спраглого до перемог. Щоб знайти такого гравця, він створює проект "Блю Лок", де 300 найкращих нападників з середніх шкіл по всій країні змагаються між собою, а той, хто залишиться останнім, стане нападником збірної.',
    image: '/uploads/blue_lock.jpg',
    banner: null, // We'll use image with blur if banner is null
    chapters: 245 // For card consistency
  };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedMangas') || '[]');
    setIsSaved(saved.some(item => String(item.id) === String(id)));
  }, [id]);

  const handleToggleSave = () => {
    const saved = JSON.parse(localStorage.getItem('savedMangas') || '[]');
    let newSaved;
    
    if (isSaved) {
      newSaved = saved.filter(item => String(item.id) !== String(id));
      setIsSaved(false);
    } else {
      newSaved = [...saved, manga];
      setIsSaved(true);
    }
    
    localStorage.setItem('savedMangas', JSON.stringify(newSaved));
  };

  const chapters = [
    { id: 1, title: 'Том 1. Розділ 1 — Початок', date: '12.05.2024' },
    { id: 2, title: 'Том 1. Розділ 2 — Зустріч', date: '15.05.2024' },
    { id: 3, title: 'Том 1. Розділ 3 — Вибір', date: '18.05.2024' },
  ];

  const reviews = [
    { id: 1, user: 'AnimeFan', text: 'Це найкраща спортивна манґа, яку я коли-небудь читав!', rating: 5 },
    { id: 2, user: 'MangaReader', text: 'Дуже динамічно і цікаво.', rating: 4 },
  ];

  return (
    <div className={styles.detailsWrapper}>
      <Header />

      {/* Banner Section */}
      <div className={styles.bannerContainer}>
        <div 
          className={styles.bannerBackground} 
          style={{ backgroundImage: `url(${manga.banner || manga.image})` }}
        />
        <div className={styles.bannerOverlay} />
      </div>

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
                className={`${styles.favoriteBtn} ${isSaved ? styles.saved : ''}`}
                onClick={handleToggleSave}
              >
                {isSaved ? (
                  <><span>✔</span> У Збереженому</>
                ) : (
                  <><span>❤</span> Додати в Збережене</>
                )}
              </button>
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
                  <span className={styles.label}>Жанри</span>
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
