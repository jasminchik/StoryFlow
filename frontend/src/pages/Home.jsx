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
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMangaData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/manga');
        const data = await response.json();
        
        if (data.success) {
          // Для новинок беремо перші 8 тайтлів (вони вже відсортовані за датою створення на бекенді)
          const latest = data.data.slice(0, 8).map(m => ({
            id: m._id,
            title: m.title,
            image: m.coverImage ? (m.coverImage.startsWith('http') ? m.coverImage : `http://localhost:5000${m.coverImage}`) : '',
            rating: m.rating || 0
          }));
          setNewArrivals(latest);

          // Для популярних поки що теж візьмемо зі списку (можна буде додати логіку сортування за рейтингом)
          setPopular(latest.slice(0, 4));
          
          // Читають зараз - можна буде реалізувати через історію переглядів, поки пустий масив або заглушка
          setReadingNow([]);
        }
      } catch (err) {
        console.error('Помилка завантаження даних:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMangaData();
  }, []);

  return (
    <div className={styles.homeWrapper}>
      <Header />

      <div className={styles.homeContainer}>
        <main className={styles.mainContent}>
          {newArrivals.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Найпопулярніші</h2>
              <div className={styles.popularGrid}>
                {popular.map((item) => (
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

          {readingNow.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Читають зараз</h2>
              <div className={styles.popularGrid}>
                {readingNow.map((item) => (
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
            {newArrivals.length > 0 ? (
              <div className={styles.newGrid}>
                {newArrivals.map((item) => (
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
              !isLoading && <p className={styles.emptyText}>Тайтлів ще не додано.</p>
            )}
          </section>
        </main>

        <aside className={styles.sidebar}>
          <SidebarUpdates />
          <PopularAuthors />
          <TagCategories />
        </aside>
      </div>
    </div>
  );
};

export default Home;
