import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import Header from '../../components/Header';
import styles from './Notifications.module.scss';

const Notifications = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'updates'; // 'news' | 'updates'
  const [siteNews, setSiteNews] = useState([]);
  const [titleUpdates, setTitleUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');
  const canCreateNews = loggedInUser && loggedInUser.role === 'admin';

  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/news`);
        const data = await response.json();
        if (data.success) {
          setSiteNews(data.data);
        }
      } catch (err) {
        console.error('Помилка завантаження новин:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, []);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  return (
    <div className={styles.notificationsWrapper}>
      <Header />
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Повідомлення</h1>
        </div>
        
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'updates' ? styles.active : ''}`}
            onClick={() => handleTabChange('updates')}
          >
            Оновлення тайтлів
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'news' ? styles.active : ''}`}
            onClick={() => handleTabChange('news')}
          >
            Новини сайту
          </button>
        </div>

        <div className={styles.content}>
          {isLoading ? (
            <div className={styles.loading}>Завантаження...</div>
          ) : activeTab === 'updates' ? (
            <div className={styles.updatesGrid}>
              {titleUpdates.length > 0 ? (
                titleUpdates.map(update => (
                  <div key={update.id} className={styles.updateCard}>
                    <img src={update.image} alt={update.title} className={styles.updateImage} />
                    <div className={styles.updateInfo}>
                      <h3 className={styles.updateTitle}>{update.title}</h3>
                      <p className={styles.updateText}>{update.text}</p>
                      <span className={styles.updateDate}>{update.date}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>Немає нових оновлень тайтлів.</div>
              )}
            </div>
          ) : (
            <div className={styles.newsList}>
              {siteNews.length > 0 ? (
                siteNews.map(news => (
                  <div key={news._id || news.id} className={styles.newsCard}>
                    <div className={styles.newsHeader}>
                      <span className={`${styles.categoryBadge} ${
                        news.category === 'Важливе' ? styles.important : 
                        news.category === 'Системні' ? styles.system : 
                        news.category === 'Оновлення' ? styles.update : styles.other
                      }`}>
                        {news.category || 'Інше'}
                      </span>
                      <span className={styles.newsDate}>{new Date(news.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className={styles.newsTitle}>{news.title}</h3>
                    <p className={styles.newsText}>{news.content}</p>
                    <div className={styles.newsFooter}>
                      <span className={styles.newsAuthor}>Опублікував: <strong>Адміністрація</strong></span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>Новин поки що немає.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
