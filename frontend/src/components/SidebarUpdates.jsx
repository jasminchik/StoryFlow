import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './SidebarUpdates.module.scss';

const SidebarUpdates = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('manga'); // 'manga', 'manhwa' або 'fanfics'
  const [data, setData] = useState({ manga: [], manhwa: [], fanfics: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/manga');
        const result = await response.json();
        
        if (result.success) {
          const manga = result.data.filter(m => m.type === 'Манґа').slice(0, 4);
          const manhwa = result.data.filter(m => m.type === 'Манхва').slice(0, 4);
          // Для літератури поки що теж можемо брати з Manga якщо там є такий тип, 
          // або в майбутньому додати окремий запит до /api/literature
          const fanfics = result.data.filter(m => m.type === 'Комікс').slice(0, 4); 

          setData({ manga, manhwa, fanfics });
        }
      } catch (err) {
        console.error('Помилка завантаження оновлень:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpdates();
  }, []);

  const currentData = activeTab === 'manga' ? data.manga : activeTab === 'manhwa' ? data.manhwa : data.fanfics;

  const getTypeLabel = (type) => {
    if (type === 'manga') return 'Манґа';
    if (type === 'manhwa') return 'Манхва';
    return 'Література';
  };

  return (
    <div className={styles.sidebarCard}>
      <h2 className={styles.sidebarTitle}>Останні оновлення</h2>

      <div className={styles.tabs}>
        {['manga', 'manhwa', 'fanfics'].map(tab => (
          <button 
            key={tab}
            className={`${styles.tabBtn} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {getTypeLabel(tab)}
          </button>
        ))}
      </div>

      <div className={styles.updatesList} key={activeTab}>
        {!isLoading ? (
          currentData.length > 0 ? (
            currentData.map((item) => (
              <div 
                key={item._id} 
                className={styles.updateItem}
                onClick={() => navigate(`/manga/${item._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <img src={item.coverImage.startsWith('http') ? item.coverImage : `http://localhost:5000${item.coverImage}`} alt={item.title} className={styles.updateAvatar} />
                <div className={styles.updateInfo}>
                  <span className={styles.updateName}>{item.title}</span>
                  <div className={styles.updateMeta}>
                    <span className={styles.updateType}>{item.type}</span>
                    <span className={styles.updateChapter}>{item.status}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.emptyText}>Оновлень немає</p>
          )
        ) : (
          <p className={styles.loadingText}>Завантаження...</p>
        )}
      </div>

      <Link to={`/updates?type=${activeTab}`} className={styles.moreBtn}>ДИВИТИСЬ ВСІ</Link>
    </div>
  );
};

export default SidebarUpdates;
