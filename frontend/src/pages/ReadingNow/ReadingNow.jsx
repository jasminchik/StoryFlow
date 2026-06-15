import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import Header from '../../components/Header';
import styles from './ReadingNow.module.scss';

const ReadingNow = () => {
  const navigate = useNavigate();
  const [readingList, setReadingList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    const fetchReadingNow = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/manga`);
        const data = await response.json();
        if (data.success) {
          // Поки що беремо всі тайтли як "зараз читають" для наповнення
          setReadingList(data.data);
        }
      } catch (err) {
        console.error('Помилка завантаження даних:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReadingNow();
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Зараз читають спільнотою StoryFlow</h1>
        {!isLoading ? (
          readingList.length > 0 ? (
            <div className={styles.grid}>
              {readingList.map(item => (
                <div 
                  key={item._id} 
                  className={styles.mangaCard}
                  onClick={() => navigate(`/manga/${item._id}`)}
                >
                  <div className={styles.imageWrapper}>
                    <img src={item.coverImage ? (item.coverImage.startsWith('http') ? item.coverImage : `${API_BASE}${item.coverImage}`) : ''} alt={item.title} />
                    <div className={styles.rating}>
                      <FiStar size={12} fill="currentColor" /> {item.rating ? item.rating.toFixed(1) : '0.0'}
                    </div>
                    <div className={styles.typeBadge}>{item.type}</div>
                  </div>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>Тут поки що порожньо.</div>
          )
        ) : (
          <div className={styles.loading}>Завантаження...</div>
        )}
      </div>
    </div>
  );
};

export default ReadingNow;
