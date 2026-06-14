import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import Header from '../../components/Header';
import styles from './Notifications.module.scss';

const Notifications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'updates'; // 'news' | 'updates'

  const siteNews = [
    { 
      id: 1, 
      title: 'Велике оновлення сайту!', 
      text: 'Ми додали нову систему сповіщень та покращили профіль. Тепер ви можете бачити оновлення ваших улюблених тайтлів в реальному часі! Також виправлено помилки в мобільній версії.', 
      date: '12.06.2026',
      author: 'Admin_StoryFlow',
      category: 'Системне',
      categoryType: 'system'
    },
    { 
      id: 2, 
      title: 'Розклад виходу глав на літо', 
      text: 'Ознайомтеся з оновленим розкладом виходу популярних онґоїнгів. Деякі тайтли йдуть на двотижневу перерву через свята в Японії.', 
      date: '10.06.2026',
      author: 'Editor_Team',
      category: 'Розклад',
      categoryType: 'schedule'
    },
    { 
      id: 3, 
      title: 'Анонс: Новий конкурс для авторів', 
      text: 'Готуйте свої пера! Незабаром ми оголосимо тему нового літературного конкурсу з цінними призами та можливістю публікації в друкованому збірнику.', 
      date: '08.06.2026',
      author: 'Creative_Manager',
      category: 'Анонс',
      categoryType: 'announcement'
    }
  ];

  const titleUpdates = [
    { id: 1, title: 'Блю Лок', chapter: 265, text: 'Манґа Блю Лок оновилася! Додано Розділ 265.', date: '3 години тому', image: '/uploads/blue_lock.jpg' },
    { id: 2, title: 'Ван Піс', chapter: 1115, text: 'Манґа Ван Піс оновилася! Додано Розділ 1115.', date: '5 годин тому', image: '/uploads/one_piece.jpg' },
    { id: 3, title: 'Наруто: Спадкоємець', chapter: 12, text: 'Література/Фанфік Наруто: Спадкоємець оновився! Додано Розділ 12.', date: 'Вчора', image: '/uploads/naruto.jpg' }
  ];

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  return (
    <div className={styles.notificationsWrapper}>
      <Header />
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Повідомлення</h1>
          {activeTab === 'news' && (
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
          {activeTab === 'updates' ? (
            <div className={styles.updatesGrid}>
              {titleUpdates.map(update => (
                <div key={update.id} className={styles.updateCard}>
                  <img src={update.image} alt={update.title} className={styles.updateImage} />
                  <div className={styles.updateInfo}>
                    <h3 className={styles.updateTitle}>{update.title}</h3>
                    <p className={styles.updateText}>{update.text}</p>
                    <span className={styles.updateDate}>{update.date}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.newsList}>
              {siteNews.map(news => (
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
