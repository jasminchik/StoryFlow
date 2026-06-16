import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import styles from './Home.module.scss';
import SidebarUpdates from '../components/SidebarUpdates';
import PopularAuthors from '../components/PopularAuthors';
import TagCategories from '../components/TagCategories';
import Header from '../components/Header';

const Home = () => {
  const [popular, setPopular] = useState([]);
  const [readingNow, setReadingNow] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeGenre, setActiveGenre] = useState(null);
  const [activeFormat, setActiveFormat] = useState(null);
  const [activeStatus, setActiveStatus] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMangaData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/manga/home');
        const data = await response.json();
        
        if (data.success) {
          const formatManga = (m) => ({
            id: m._id,
            title: m.title,
            image: m.coverImage ? (m.coverImage.startsWith('http') ? m.coverImage : `http://localhost:5000${m.coverImage}`) : '',
            rating: m.averageRating || 0,
            genres: m.genres || [],
            type: m.type || '',
            status: m.status || ''
          });

          setNewArrivals(data.data.newArrivals.map(formatManga));
          setPopular(data.data.topRated.map(formatManga));
          setReadingNow(data.data.readingNow ? data.data.readingNow.map(formatManga) : []); 
          setBooks(data.data.books ? data.data.books.map(formatManga) : []);
        }
      } catch (err) {
        console.error('Помилка завантаження даних:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMangaData();
  }, []);

  const filterManga = (list) => {
    return list
      .filter(item => !activeGenre || item.genres?.includes(activeGenre))
      .filter(item => {
        if (!activeFormat) return true;
        const type = item.type?.toLowerCase();
        if (activeFormat === 'Манґа') return type === 'манга' || type === 'манґа' || type === 'manga';
        if (activeFormat === 'Манхва') return type === 'манхва' || type === 'manhwa';
        if (activeFormat === 'Маньхуа') return type === 'маньхуа' || type === 'manhua';
        if (activeFormat === 'Література/Фанфік') return type === 'література' || type === 'фанфік';
        return type === activeFormat.toLowerCase();
      })
      .filter(item => {
        if (!activeStatus) return true;
        const status = item.status;
        if (activeStatus === 'Онґоінґ') return status === 'В процесі' || status === 'in_progress';
        return status === activeStatus;
      });
  };

  const filteredPopular = filterManga(popular);
  const filteredNew = filterManga(newArrivals);
  const filteredReadingNow = filterManga(readingNow);
  const filteredBooks = filterManga(books);

  return (
    <div className={styles.homeWrapper}>
      <Header />

      <div className={styles.homeContainer}>
        <main className={styles.mainContent}>
          {filteredPopular.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Найпопулярніші</h2>
              <div className={styles.popularGrid}>
                {filteredPopular.map((item) => (
                  <div 
                    key={item.id} 
                    className={styles.mangaCard}
                    onClick={() => navigate(`/manga/${item.id}`)}
                  >
                    <div className={styles.imageWrapper}>
                      <img src={item.image} alt={item.title} />
                      <div className={styles.rating}>
                        <FiStar size={12} fill="currentColor" /> {item.rating ? item.rating.toFixed(1) : '0.0'}
                      </div>
                    </div>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                  </div>
                ))}
              </div>
            </section>
          )}

          {filteredReadingNow.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Читають зараз</h2>
              <div className={styles.popularGrid}>
                {filteredReadingNow.map((item) => (
                  <div 
                    key={item.id} 
                    className={styles.mangaCard}
                    onClick={() => navigate(`/manga/${item.id}`)}
                  >
                    <div className={styles.imageWrapper}>
                      <img src={item.image} alt={item.title} />
                      <div className={styles.rating}>
                        <FiStar size={12} fill="currentColor" /> {item.rating ? item.rating.toFixed(1) : '0.0'}
                      </div>
                    </div>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                  </div>
                ))}
              </div>
            </section>
          )}

          {filteredBooks.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Навчальні книги</h2>
              <div className={styles.popularGrid}>
                {filteredBooks.map((item) => (
                  <div 
                    key={item.id} 
                    className={styles.mangaCard}
                    onClick={() => navigate(`/manga/${item.id}`)}
                  >
                    <div className={styles.imageWrapper}>
                      <img src={item.image} alt={item.title} />
                      <div className={styles.rating}>
                        <FiStar size={12} fill="currentColor" /> {item.rating ? item.rating.toFixed(1) : '0.0'}
                      </div>
                    </div>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Новинки</h2>
            {filteredNew.length > 0 ? (
              <div className={styles.newGrid}>
                {filteredNew.map((item) => (
                  <div 
                    key={item.id} 
                    className={styles.compactCard}
                    onClick={() => navigate(`/manga/${item.id}`)}
                  >
                    <img src={item.image} alt={item.title} />
                    <h4 className={styles.compactTitle}>{item.title}</h4>
                  </div>
                ))}
              </div>
            ) : (
              !isLoading && <p className={styles.emptyText}>За вашим запитом нічого не знайдено.</p>
            )}
          </section>
        </main>

        <aside className={styles.sidebar}>
          <SidebarUpdates />
          <PopularAuthors />
          <TagCategories 
            activeGenre={activeGenre} setActiveGenre={setActiveGenre}
            activeFormat={activeFormat} setActiveFormat={setActiveFormat}
            activeStatus={activeStatus} setActiveStatus={setActiveStatus}
          />
        </aside>
      </div>
    </div>
  );
};

export default Home;
