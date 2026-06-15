import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './SidebarUpdates.module.scss';

const SidebarUpdates = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('manga'); // 'manga', 'manhwa' або 'fanfic'
  const [updates, setUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/manga/sidebar-updates?type=${activeTab}`);
        const result = await response.json();
        
        if (result.success && Array.isArray(result.data)) {
          setUpdates(result.data);
        } else {
          setUpdates([]);
        }
      } catch (err) {
        console.error('Помилка завантаження оновлень:', err);
        setUpdates([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpdates();
  }, [activeTab]);

  const getTypeLabel = (type) => {
    if (type === 'manga') return 'Манґа';
    if (type === 'manhwa') return 'Манхва';
    if (type === 'fanfic') return 'Література';
    return type;
  };

  const handleItemClick = (item) => {
    if (activeTab === 'fanfic') {
      navigate(`/fanfic/${item._id}`);
    } else {
      navigate(`/manga/${item._id}`);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 60000);
    if (diff < 1) return 'щойно';
    if (diff < 60) return `${diff} хв. тому`;
    if (diff < 1440) return `${Math.floor(diff / 60)} год. тому`;
    return new Date(date).toLocaleDateString('uk-UA');
  };

  return (
    <div className={styles.sidebarCard}>
      <h2 className={styles.sidebarTitle}>Останні оновлення</h2>

      <div className={styles.tabs}>
        {['manga', 'manhwa', 'fanfic'].map(tab => (
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
          updates.length > 0 ? (
            updates.map((item) => (
              <div 
                key={item._id} 
                className={styles.updateItem}
                onClick={() => handleItemClick(item)}
                style={{ cursor: 'pointer' }}
              >
                <img 
                  src={item.coverImage ? (item.coverImage.startsWith('http') ? item.coverImage : `http://localhost:5000${item.coverImage}`) : 'http://localhost:5000/uploads/no-photo.jpg'} 
                  alt={item.title} 
                  className={styles.updateAvatar} 
                />
                <div className={styles.updateInfo}>
                  <span className={styles.updateName}>{item.title}</span>
                  <div className={styles.updateMeta}>
                    <span className={styles.updateType}>
                      {activeTab === 'fanfic' ? 'Фанфік' : item.type}
                    </span>
                    <span className={styles.updateTime}>
                      {formatTime(item.updatedAt || item.createdAt)}
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
