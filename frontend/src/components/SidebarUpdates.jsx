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
        const [mangaRes, announcementsRes, literatureRes] = await Promise.all([
          fetch('http://localhost:5000/api/manga'),
          fetch('http://localhost:5000/api/announcements'),
          fetch('http://localhost:5000/api/literature')
        ]);
        
        const mangaResult = await mangaRes.json();
        const announcementsResult = await announcementsRes.json();
        const literatureResult = await literatureRes.json();
        
        if (mangaResult.success) {
          let allUpdates = mangaResult.data.map(m => ({ ...m, updateType: 'manga' }));
          
          if (announcementsResult.success) {
            allUpdates = [...allUpdates, ...announcementsResult.data.map(a => ({ ...a, updateType: 'announcement' }))];
          }

          if (literatureResult.success) {
            allUpdates = [...allUpdates, ...literatureResult.data.map(l => ({ ...l, updateType: 'literature' }))];
          }
          
          // Сортуємо все за часом створення
          allUpdates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          const manga = allUpdates.filter(m => (m.updateType === 'announcement' ? m.manga?.type : m.type) === 'Манґа').slice(0, 4);
          const manhwa = allUpdates.filter(m => (m.updateType === 'announcement' ? m.manga?.type : m.type) === 'Манхва').slice(0, 4);
          const fanfics = allUpdates.filter(m => m.updateType === 'literature' || (m.updateType === 'announcement' && m.manga?.type === 'Комікс')).slice(0, 4); 

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

  const handleItemClick = (item) => {
    if (item.updateType === 'announcement') {
      navigate(`/manga/${item.manga?._id || item.manga}`);
    } else if (item.updateType === 'literature') {
      navigate(`/fanfic/${item._id}`);
    } else {
      navigate(`/manga/${item._id}`);
    }
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
                className={`${styles.updateItem} ${item.updateType === 'announcement' ? styles.announcementItem : ''} ${item.updateType === 'literature' ? styles.literatureItem : ''}`}
                onClick={() => handleItemClick(item)}
                style={{ cursor: 'pointer' }}
              >
                {item.updateType !== 'literature' && (
                  <img 
                    src={item.updateType === 'announcement' 
                      ? (item.manga?.coverImage ? `http://localhost:5000${item.manga.coverImage}` : '')
                      : (item.coverImage ? (item.coverImage.startsWith('http') ? item.coverImage : `http://localhost:5000${item.coverImage}`) : '')
                    } 
                    alt={item.title} 
                    className={styles.updateAvatar} 
                  />
                )}
                <div className={styles.updateInfo}>
                  <span className={styles.updateName}>
                    {item.updateType === 'announcement' && <span className={styles.newsTag}>Новина: </span>}
                    {item.title}
                  </span>
                  <div className={styles.updateMeta}>
                    <span className={styles.updateType}>
                      {item.updateType === 'announcement' ? item.manga?.type : item.updateType === 'literature' ? 'Фанфік' : item.type}
                    </span>
                    <span className={styles.updateChapter}>
                      {item.updateType === 'announcement' ? 'Анонс' : item.updateType === 'literature' ? (item.status === 'completed' ? 'Завершено' : 'В процесі') : item.status}
                    </span>
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
