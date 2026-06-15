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
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [mangaRes, announcementsRes, literatureRes] = await Promise.all([
          fetch('http://localhost:5000/api/manga'),
          fetch('http://localhost:5000/api/announcements'),
          fetch('http://localhost:5000/api/literature')
        ]);
        
        const mangaData = await mangaRes.json();
        const announcementsData = await announcementsRes.json();
        const literatureData = await literatureRes.json();
        
        let combinedUpdates = [];
        
        if (mangaData.success) {
          combinedUpdates = [...combinedUpdates, ...mangaData.data.map(m => ({ ...m, updateType: 'manga' }))];
        }
        
        if (announcementsData.success) {
          combinedUpdates = [...combinedUpdates, ...announcementsData.data.map(a => ({ ...a, updateType: 'announcement' }))];
        }

        if (literatureData.success) {
          combinedUpdates = [...combinedUpdates, ...literatureData.data.map(l => ({ ...l, updateType: 'literature' }))];
        }
        
        // Sort by creation date
        combinedUpdates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setUpdates(combinedUpdates);
      } catch (error) {
        console.error('Помилка завантаження оновлень:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const filteredUpdates = useMemo(() => {
    let data = [...updates];
    
    if (typeFilter) {
      if (typeFilter === 'announcements') {
        data = data.filter(item => item.updateType === 'announcement');
      } else if (typeFilter === 'fanfics') {
        data = data.filter(item => item.updateType === 'literature');
      } else if (typeMap[typeFilter]) {
        data = data.filter(item => {
          // Для новин та фанфіків беремо тип тайтлу, до якого вони належать
          const itemType = item.updateType === 'announcement' ? item.manga?.type : (item.updateType === 'literature' ? 'Комікс' : item.type);
          return itemType === typeMap[typeFilter];
        });
      }
    }
    
    return data;
  }, [typeFilter, updates]);

  // Handle click on update card
  const handleUpdateClick = (update) => {
    if (update.updateType === 'announcement') {
      if (update.manga) {
        navigate(`/manga/${update.manga._id || update.manga}`);
      }
    } else if (update.updateType === 'literature') {
      navigate(`/fanfic/${update._id}`);
    } else {
      navigate(`/manga/${update._id}`);
    }
  };

  return (
    <div className={styles.updatesPage}>
      <Header />
      
      <main className={styles.container}>
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>
            {typeFilter === 'announcements' ? 'Новини та анонси' : 
             typeFilter === 'fanfics' ? 'Фанфіки та література' :
             typeFilter && typeMap[typeFilter] ? `Оновлення: ${typeMap[typeFilter]}` : 'Усі оновлення'}
          </h1>
          <p className={styles.subtitle}>Хронологія останніх розділів, глав та новин</p>
        </header>

        <div className={styles.updatesList}>
          {!isLoading ? (
            filteredUpdates.length > 0 ? (
              filteredUpdates.map((update) => (
                <div 
                  key={update._id} 
                  className={`${styles.updateCard} ${update.updateType === 'announcement' ? styles.announcementCard : ''} ${update.updateType === 'literature' ? styles.literatureCard : ''}`}
                  onClick={() => handleUpdateClick(update)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.cardMain}>
                    <div className={styles.info}>
                      <div className={styles.titleRow}>
                        {update.updateType === 'announcement' && <span className={styles.newsBadge}>Новина</span>}
                        {update.updateType === 'literature' && <span className={styles.fanficBadge}>Фанфік</span>}
                        <h3 className={styles.mangaTitle}>
                          {update.title}
                        </h3>
                      </div>
                      
                      {update.updateType === 'announcement' ? (
                        <p className={styles.newsContent}>
                          {update.manga?.title ? `Тайтл: ${update.manga.title}` : update.content.substring(0, 100) + '...'}
                        </p>
                      ) : update.updateType === 'literature' ? (
                        <p className={styles.newsContent}>
                          Автор: {update.author?.username || 'Анонім'} • {update.status === 'completed' ? 'Завершено' : 'В процесі'}
                        </p>
                      ) : (
                        <div className={styles.meta}>
                          <span className={styles.badge}>{update.type}</span>
                          <span className={styles.chapter}>{update.status}</span>
                        </div>
                      )}
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
