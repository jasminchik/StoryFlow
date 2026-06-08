import React, { useState } from 'react';
import Header from '../components/Header';
import styles from './Catalog.module.scss';

const MOCK_CATALOG = [
  { id: 1, title: 'Берсерк', type: 'Манґа', rating: 4.9, chapters: 375, image: 'https://via.placeholder.com/200x300?text=Berserk' },
  { id: 2, title: 'Атака Титанів', type: 'Манґа', rating: 4.8, chapters: 139, image: 'https://via.placeholder.com/200x300?text=AOT' },
  { id: 3, title: 'Легенда про меч', type: 'Фанфік', rating: 4.2, chapters: 42, image: 'https://via.placeholder.com/200x300?text=Fanfic' },
  { id: 4, title: 'Tokyo Ghoul', type: 'Манґа', rating: 4.5, chapters: 143, image: 'https://via.placeholder.com/200x300?text=Tokyo+Ghoul' },
  { id: 5, title: 'Tower of God', type: 'Манхва', rating: 4.8, chapters: 550, image: 'https://via.placeholder.com/200x300?text=TOG' },
  { id: 6, title: 'Світ без магії', type: 'Фанфік', rating: 3.9, chapters: 15, image: 'https://via.placeholder.com/200x300?text=Magicless' },
];

const Catalog = () => {
  const [activeFormat, setActiveFormat] = useState('Всі');
  
  return (
    <div className={styles.catalogWrapper}>
      <Header />
      
      <div className={styles.container}>
        {/* ЛІВА ЧАСТИНА: Сітка тайтлів (75%) */}
        <main className={styles.mainContent}>
          <div className={styles.catalogHeader}>
            <h1 className={styles.pageTitle}>Каталог творів</h1>
            <span className={styles.resultsCount}>Знайдено: {MOCK_CATALOG.length}</span>
          </div>

          <div className={styles.catalogGrid}>
            {MOCK_CATALOG.map((item) => (
              <div key={item.id} className={styles.mangaCard}>
                <div className={styles.imageWrapper}>
                  {item.type !== 'Фанфік' ? (
                    <img src={item.image} alt={item.title} />
                  ) : (
                    <div className={styles.textCover}>{item.title}</div>
                  )}
                  <div className={styles.rating}>⭐ {item.rating}</div>
                  <div className={styles.typeBadge}>{item.type}</div>
                </div>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <span className={styles.chapters}>{item.chapters} розділів</span>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* ПРАВА ЧАСТИНА: Фільтри (25%) */}
        <aside className={styles.sidebar}>
          <div className={styles.filterCard}>
            <h2 className={styles.filterTitle}>Фільтри</h2>
            
            {/* Фільтр: Формат */}
            <div className={styles.filterGroup}>
              <h3 className={styles.groupTitle}>Формат</h3>
              <div className={styles.btnGroup}>
                {['Всі', 'Манґа', 'Манхва', 'Фанфік'].map(format => (
                  <button 
                    key={format}
                    className={`${styles.filterBtn} ${activeFormat === format ? styles.active : ''}`}
                    onClick={() => setActiveFormat(format)}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>

            {/* Фільтр: Статус */}
            <div className={styles.filterGroup}>
              <h3 className={styles.groupTitle}>Статус</h3>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" /> Онґоінґ
                </label>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" /> Завершено
                </label>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" /> Анонс
                </label>
              </div>
            </div>

            <button className={styles.applyBtn}>Застосувати</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Catalog;
