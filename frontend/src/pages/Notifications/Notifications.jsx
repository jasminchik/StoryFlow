import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import Header from '../../components/Header';
import styles from './Notifications.module.scss';

const Notifications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'updates'; // 'news' | 'updates'
  const [siteNews, setSiteNews] = useState([]);
  const [titleUpdates, setTitleUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');
  const canCreateNews = loggedInUser && (loggedInUser.role === 'admin' || loggedInUser.role === 'author');

  useEffect(() => {
    // В майбутньому тут будуть запити до API для отримання новин та оновлень тайтлів
    // Promise.all([fetchNews(), fetchUpdates()])
    setIsLoading(false);
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
          {activeTab === 'news' && canCreateNews && (
            <button className={styles.createNewsBtn}><FiPlus size={18} /> Створити новину</button>
          )}
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
                  <div key={news.id} className={styles.newsCard}>
                    <div className={styles.newsHeader}>
                      <span className={`${styles.categoryBadge} ${styles[news.categoryType]}`}>
                        {news.category}
                      </span>
                      <span className={styles.newsDate}>{news.date}</span>
                    </div>
                    <h3 className={styles.newsTitle}>{news.title}</h3>
                    <p className={styles.newsText}>{news.text}</p>
                    <div className={styles.newsFooter}>
                      <span className={styles.newsAuthor}>Опублікував: <strong>{news.author}</strong></span>
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
