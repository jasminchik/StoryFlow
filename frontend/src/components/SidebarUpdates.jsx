import React, { useState } from 'react';
import styles from './SidebarUpdates.module.scss';

// Тимчасові дані для Манґи
const MOCK_MANGA = [
  { id: 1, title: 'One Piece', chapter: 'Розділ 1110', image: 'https://via.placeholder.com/50' },
  { id: 2, title: 'Solo Leveling', chapter: 'Розділ 200', image: 'https://via.placeholder.com/50' },
  { id: 3, title: 'Naruto', chapter: 'Розділ 700', image: 'https://via.placeholder.com/50' },
  { id: 4, title: 'Bleach', chapter: 'Розділ 686', image: 'https://via.placeholder.com/50' },
];

// Тимчасові дані для Фанфіків
const MOCK_FANFICS = [
  { id: 1, title: 'Тінь Хокаґе', chapter: 'Глава 15: Нова сила', image: 'https://via.placeholder.com/50?text=F1' },
  { id: 2, title: 'Світ без магії', chapter: 'Глава 3: Зустріч', image: 'https://via.placeholder.com/50?text=F2' },
  { id: 3, title: 'Легенда про меча', chapter: 'Глава 42: Фінал', image: 'https://via.placeholder.com/50?text=F3' },
  { id: 4, title: 'Початок кінця', chapter: 'Глава 1: Пробудження', image: 'https://via.placeholder.com/50?text=F4' },
];

const SidebarUpdates = () => {
  const [activeTab, setActiveTab] = useState('manga'); // 'manga' або 'fanfics'

  const currentData = activeTab === 'manga' ? MOCK_MANGA : MOCK_FANFICS;

  return (
    <div className={styles.sidebarCard}>
      <h2 className={styles.sidebarTitle}>Останні оновлення</h2>

      {/* Перемикачі (Таби) */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'manga' ? styles.active : ''}`}
          onClick={() => setActiveTab('manga')}
        >
          Манґа
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'fanfics' ? styles.active : ''}`}
          onClick={() => setActiveTab('fanfics')}
        >
          Фанфіки
        </button>
      </div>

      {/* Список контенту з анімацією появи */}
      <div className={styles.updatesList} key={activeTab}>
        {currentData.map((item) => (
          <div key={item.id} className={styles.updateItem}>
            {/* УМОВНИЙ РЕНДЕРИНГ: Прибираємо картинку для фанфіків */}
            {activeTab === 'manga' && (
              <img src={item.image} alt={item.title} className={styles.updateAvatar} />
            )}
            <div className={styles.updateInfo}>
              <span className={styles.updateName}>{item.title}</span>
              <div className={styles.updateMeta}>
                <span className={styles.updateType}>
                  {activeTab === 'manga' ? 'Манґа' : 'Література'}
                </span>
                <span className={styles.updateChapter}>{item.chapter}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className={styles.moreBtn}>ДИВИТИСЬ ВСІ</button>
    </div>
  );
};

export default SidebarUpdates;
