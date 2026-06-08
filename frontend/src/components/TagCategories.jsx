import React, { useState } from 'react';
import styles from './TagCategories.module.scss';

const CATEGORIES_DATA = [
  { id: 'genres', name: 'Жанри', tags: ['Екшн', 'Комедія', 'Драма', 'Романтика', 'Фентезі', 'Психологія', 'Жахи', 'Пригоди', 'Спорт'] },
  { id: 'formats', name: 'Формат', tags: ['Манґа', 'Манхва', 'Маньхуа', 'Фанфік', 'Ранобе', 'Комікс'] },
  { id: 'status', name: 'Статус', tags: ['Онґоінґ', 'Завершено', 'Анонс'] }
];

const TagCategories = () => {
  const [activeCategory, setActiveCategory] = useState(null);

  const toggleCategory = (id) => {
    setActiveCategory(activeCategory === id ? null : id);
  };

  return (
    <div className={styles.tagCard}>
      <h2 className={styles.cardTitle}>Категорії тегів</h2>
      
      <div className={styles.categoriesList}>
        {CATEGORIES_DATA.map((cat) => (
          <div key={cat.id} className={styles.categoryItem}>
            <button 
              className={`${styles.categoryHeader} ${activeCategory === cat.id ? styles.active : ''}`}
              onClick={() => toggleCategory(cat.id)}
            >
              <span>{cat.name}</span>
              <span className={styles.arrow}>{activeCategory === cat.id ? '▼' : '▶'}</span>
            </button>
            
            <div className={`${styles.tagCloud} ${activeCategory === cat.id ? styles.expanded : ''}`}>
              {cat.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagCategories;
