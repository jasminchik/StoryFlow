import React, { useMemo } from 'react';
import Header from '../../components/Header';
import styles from './Updates.module.scss';

// Mock data with timestamps
const MOCK_UPDATES = [
  { id: 1, title: 'Ван Піс', chapter: '1110', type: 'Манґа', updatedAt: Date.now() - 1000 * 60 * 30 }, // 30 mins ago
  { id: 2, title: 'Підняття рівня поодинці', chapter: '200', type: 'Манґа', updatedAt: Date.now() - 1000 * 60 * 60 * 2 }, // 2 hours ago
  { id: 3, title: 'Тінь Хокаґе', chapter: '15', type: 'Література', updatedAt: Date.now() - 1000 * 60 * 60 * 24 }, // 1 day ago
  { id: 4, title: 'Наруто: Наступне покоління', chapter: '80', type: 'Манґа', updatedAt: Date.now() - 1000 * 60 * 15 }, // 15 mins ago
  { id: 5, title: 'Світ без магії', chapter: '3', type: 'Література', updatedAt: Date.now() - 1000 * 60 * 60 * 5 }, // 5 hours ago
  { id: 6, title: 'Людина-бензопила', chapter: '160', type: 'Манґа', updatedAt: Date.now() - 1000 * 60 * 60 * 12 }, // 12 hours ago
  { id: 7, title: 'Легенда про меча', chapter: '42', type: 'Література', updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2 }, // 2 days ago
  { id: 8, title: 'Зоряне дитя', chapter: '145', type: 'Манґа', updatedAt: Date.now() - 1000 * 60 * 5 }, // 5 mins ago
];

const Updates = () => {
  // Sort updates by date (descending)
  const sortedUpdates = useMemo(() => {
    return [...MOCK_UPDATES].sort((a, b) => b.updatedAt - a.updatedAt);
  }, []);

  // Simple relative time formatter
  const formatRelativeTime = (timestamp) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `Оновлено ${minutes} хв. тому`;
    if (hours < 24) return `Оновлено ${hours} год. тому`;
    return `Оновлено ${days} дн. тому`;
  };

  return (
    <div className={styles.updatesPage}>
      <Header />
      
      <main className={styles.container}>
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>Усі оновлення</h1>
          <p className={styles.subtitle}>Хронологія останніх розділів та глав</p>
        </header>

        <div className={styles.updatesList}>
          {sortedUpdates.map((update) => (
            <div key={update.id} className={styles.updateCard}>
              <div className={styles.cardMain}>
                <div className={styles.info}>
                  <h3 className={styles.mangaTitle}>{update.title}</h3>
                  <div className={styles.meta}>
                    <span className={styles.badge}>{update.type}</span>
                    <span className={styles.chapter}>Розділ {update.chapter}</span>
                  </div>
                </div>
                <div className={styles.timeInfo}>
                  <span className={styles.time}>{formatRelativeTime(update.updatedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Updates;
