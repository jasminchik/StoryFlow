import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import styles from './Updates.module.scss';

const Updates = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const typeFilter = searchParams.get('type'); // 'manga', 'manhwa', 'fanfics'
  const [updates, setUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Map internal type names to display labels used in data
  const typeMap = {
    'manga': 'Манґа',
    'manhwa': 'Манхва',
    'fanfics': 'Комікс'
  };

  useEffect(() => {
    const fetchUpdates = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/manga');
        const data = await response.json();
        if (data.success) {
          setUpdates(data.data);
        }
      } catch (error) {
        console.error('Помилка завантаження оновлень:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpdates();
  }, []);

  const filteredUpdates = useMemo(() => {
    let data = [...updates];
    
    if (typeFilter && typeMap[typeFilter]) {
      data = data.filter(item => item.type === typeMap[typeFilter]);
    }
    
    return data; // Бекенд вже сортує за createdAt: -1
  }, [typeFilter, updates]);

  // Simple relative time formatter
  const formatRelativeTime = (dateString) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Щойно';
    if (minutes < 60) return `Оновлено ${minutes} хв. тому`;
    if (hours < 24) return `Оновлено ${hours} год. тому`;
    return `Оновлено ${days} дн. тому`;
  };

  return (
    <div className={styles.updatesPage}>
      <Header />
      
      <main className={styles.container}>
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>
            {typeFilter && typeMap[typeFilter] ? `Оновлення: ${typeMap[typeFilter]}` : 'Усі оновлення'}
          </h1>
          <p className={styles.subtitle}>Хронологія останніх розділів та глав</p>
        </header>

        <div className={styles.updatesList}>
          {!isLoading ? (
            filteredUpdates.length > 0 ? (
              filteredUpdates.map((update) => (
                <div 
                  key={update._id} 
                  className={styles.updateCard}
                  onClick={() => navigate(`/manga/${update._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.cardMain}>
                    <div className={styles.info}>
                      <h3 className={styles.mangaTitle}>{update.title}</h3>
                      <div className={styles.meta}>
                        <span className={styles.badge}>{update.type}</span>
                        <span className={styles.chapter}>{update.status}</span>
                      </div>
                    </div>
                    <div className={styles.timeInfo}>
                      <span className={styles.time}>{formatRelativeTime(update.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.empty}>Оновлень не знайдено</div>
            )
          ) : (
            <div className={styles.loading}>Завантаження...</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Updates;
