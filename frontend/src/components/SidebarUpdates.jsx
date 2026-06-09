import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './SidebarUpdates.module.scss';

// Тимчасові дані для Манґи
const MOCK_MANGA = [
  { id: 1, title: 'Ван Піс', chapter: 'Розділ 1110', image: '/uploads/one_piece.jpg' },
  { id: 2, title: 'Берсерк', chapter: 'Розділ 375', image: '/uploads/berserk.jpg' },
  { id: 3, title: 'Наруто', chapter: 'Розділ 700', image: '/uploads/naruto.jpg' },
  { id: 4, title: 'Бліч', chapter: 'Розділ 686', image: '/uploads/bleach.jpg' },
];

// Тимчасові дані для Манхви
const MOCK_MANHWA = [
  { id: 1, title: 'Підняття рівня поодинці', chapter: 'Розділ 200', image: '/uploads/solo_leveling.jpg' },
  { id: 2, title: 'Вежа Бога', chapter: 'Розділ 550', image: '/uploads/tower_of_god.jpg' },
  { id: 3, title: 'Магічна битва', chapter: 'Розділ 250', image: '/uploads/jujutsu_kaisen.jpg' },
];

// Тимчасові дані для Фанфіків
const MOCK_FANFICS = [
  { id: 1, title: 'Тінь Хокаґе', chapter: 'Глава 15: Нова сила', image: '/uploads/novel.jpg' },
  { id: 2, title: 'Світ без магії', chapter: 'Глава 3: Зустріч', image: '/uploads/novel.jpg' },
  { id: 3, title: 'Легенда про меча', chapter: 'Глава 42: Фінал', image: '/uploads/novel.jpg' },
  { id: 4, title: 'Початок кінця', chapter: 'Глава 1: Пробудження', image: '/uploads/novel.jpg' },
];

const SidebarUpdates = () => {
  const [activeTab, setActiveTab] = useState('manga'); // 'manga', 'manhwa' або 'fanfics'

  const currentData = activeTab === 'manga' ? MOCK_MANGA : activeTab === 'manhwa' ? MOCK_MANHWA : MOCK_FANFICS;

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
          className={`${styles.tabBtn} ${activeTab === 'manhwa' ? styles.active : ''}`}
          onClick={() => setActiveTab('manhwa')}
        >
          Манхва
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
            {/* Аватари показуємо для Манґи та Манхви */}
            {activeTab !== 'fanfics' && (
              <img src={item.image} alt={item.title} className={styles.updateAvatar} />
            )}
            <div className={styles.updateInfo}>
              <span className={styles.updateName}>{item.title}</span>
              <div className={styles.updateMeta}>
                <span className={styles.updateType}>
                  {activeTab === 'manga' ? 'Манґа' : activeTab === 'manhwa' ? 'Манхва' : 'Література'}
                </span>
                <span className={styles.updateChapter}>{item.chapter}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link to="/updates" className={styles.moreBtn}>ДИВИТИСЬ ВСІ</Link>
    </div>
  );
};

export default SidebarUpdates;
