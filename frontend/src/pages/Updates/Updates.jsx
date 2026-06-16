import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import styles from './Updates.module.scss';

const Updates = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const typeFilter = searchParams.get('type'); // 'manga', 'manhwa', 'fanfic'
  const [updates, setUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const typeMap = {
    'manga': 'Манґа',
    'manhwa': 'Манхва',
    'book': 'Книги',
    'fanfic': 'Книги',
    'literature': 'Книги'
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/manga/latest?type=${typeFilter}&limit=50`);
        const result = await response.json();
        
        if (result.success) {
          setUpdates(result.data);
        }
      } catch (error) {
        console.error('Помилка завантаження оновлень:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [typeFilter]);

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Щойно';
    if (minutes < 60) return `Оновлено ${minutes} хв. тому`;
    if (hours < 24) return `Оновлено ${hours} год. тому`;
    return `Оновлено ${days} дн. тому`;
  };

  const handleUpdateClick = (update) => {
    if (typeFilter === 'fanfic' || typeFilter === 'literature') {
      navigate(`/fanfic/${update._id}`);
    } else {
      navigate(`/manga/${update._id}`);
    }
  };

  const formatStatus = (status) => {
    const statusMap = {
      'in_progress': 'В процесі',
      'completed': 'Завершено',
      'Анонс': 'Анонс',
      'В процесі': 'В процесі',
      'Завершено': 'Завершено',
      'Призупинено': 'Призупинено'
    };
    return statusMap[status] || status;
  };

  return (
    <div className={styles.updatesPage}>
      <Header />
      
      <main className={styles.container}>
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>
            {typeFilter && typeMap[typeFilter] ? `Оновлення: ${typeMap[typeFilter]}` : 'Усі оновлення'}
          </h1>
          <p className={styles.subtitle}>Хронологія останніх розділів та тайтлів</p>
        </header>

        <div className={styles.updatesList}>
          {!isLoading ? (
            updates.length > 0 ? (
              updates.map((update) => (
                <div 
                  key={update._id} 
                  className={`${styles.updateCard} ${typeFilter === 'fanfic' ? styles.literatureCard : ''}`}
                  onClick={() => handleUpdateClick(update)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.cardMain}>
                    <div className={styles.info}>
                      <div className={styles.titleRow}>
                        {(typeFilter === 'fanfic' || typeFilter === 'literature') && <span className={styles.fanficBadge}>Література</span>}
                        <h3 className={styles.mangaTitle}>
                          {update.title}
                        </h3>
                      </div>
                      
                      <div className={styles.meta}>
                        <span className={styles.badge}>
                          {update.type}
                        </span>
                        <span className={styles.chapter}>
                          {formatStatus(update.status) || 'Додано'}
                        </span>
                      </div>
                    </div>
                    <div className={styles.timeInfo}>
                      <span className={styles.time}>{formatRelativeTime(update.updatedAt || update.createdAt)}</span>
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
