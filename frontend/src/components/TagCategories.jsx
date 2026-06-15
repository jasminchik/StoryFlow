import React, { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import styles from './TagCategories.module.scss';

const CATEGORIES_DATA = [
  { id: 'genres', name: 'Жанри', tags: ['Екшн', 'Комедія', 'Драма', 'Романтика', 'Фентезі', 'Психологія', 'Жахи', 'Пригоди', 'Спорт'] },
  { id: 'formats', name: 'Формат', tags: ['Манґа', 'Манхва'] },
  { id: 'status', name: 'Статус', tags: ['Онґоінґ', 'Завершено', 'Анонс'] }
];

const TagCategories = ({ 
  activeGenre, setActiveGenre, 
  activeFormat, setActiveFormat, 
  activeStatus, setActiveStatus 
}) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const toggleCategory = (id) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  const handleTagClick = (categoryId, tag) => {
    if (categoryId === 'genres') {
      setActiveGenre(activeGenre === tag ? null : tag);
    } else if (categoryId === 'formats') {
      setActiveFormat(activeFormat === tag ? null : tag);
    } else if (categoryId === 'status') {
      setActiveStatus(activeStatus === tag ? null : tag);
    }
  };

  const isTagActive = (categoryId, tag) => {
    if (categoryId === 'genres') return activeGenre === tag;
    if (categoryId === 'formats') return activeFormat === tag;
    if (categoryId === 'status') return activeStatus === tag;
    return false;
  };

  return (
    <div className={styles.tagCard}>
      <h2 className={styles.cardTitle}>Категорії тегів</h2>
      
      <div className={styles.categoriesList}>
        {CATEGORIES_DATA.map((cat) => (
          <div key={cat.id} className={styles.categoryItem}>
            <button 
              className={`${styles.categoryHeader} ${expandedCategory === cat.id ? styles.active : ''}`}
              onClick={() => toggleCategory(cat.id)}
            >
              <span>{cat.name}</span>
              <FiChevronDown 
                size={18} 
                className={`${styles.arrow} ${expandedCategory === cat.id ? styles.rotated : ''}`} 
              />
            </button>
            
            <div className={`${styles.tagCloud} ${expandedCategory === cat.id ? styles.expanded : ''}`}>
              {cat.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className={`${styles.tag} ${isTagActive(cat.id, tag) ? styles.active : ''}`}
                  onClick={() => handleTagClick(cat.id, tag)}
                >
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
