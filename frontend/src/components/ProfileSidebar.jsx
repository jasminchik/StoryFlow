import React, { useState } from 'react';
import styles from './ProfileSidebar.module.scss';

const ProfileSidebar = ({ 
  activeTab, 
  listFilter, setListFilter,
  commentType, setCommentType,
  commentLocation, setCommentLocation
}) => {
  // Стани для фільтрів вкладки "Тайтли"
  const [viewFilter, setViewFilter] = useState('grid');
  const [sortFilter, setSortFilter] = useState('name');

  // Універсальний компонент кастомної радіо-кнопки
  const RadioOption = ({ name, value, checkedValue, onChange, label }) => (
    <label className={styles.radioLabel}>
      <input 
        type="radio" 
        name={name} 
        value={value} 
        checked={checkedValue === value} 
        onChange={(e) => onChange(e.target.value)} 
        className={styles.hiddenRadio} 
      />
      <span className={styles.circle}></span>
      <span className={styles.text}>{label}</span>
    </label>
  );

  const renderFilters = () => {
    switch (activeTab) {
      case 'titles':
        return (
          <>
            <div className={styles.filterBlock}>
              <h4 className={styles.blockTitle}>Список</h4>
              <RadioOption name="list" value="all" checkedValue={listFilter} onChange={setListFilter} label="Всі" />
              <RadioOption name="list" value="reading" checkedValue={listFilter} onChange={setListFilter} label="Читаю" />
              <RadioOption name="list" value="planned" checkedValue={listFilter} onChange={setListFilter} label="В планах" />
              <RadioOption name="list" value="dropped" checkedValue={listFilter} onChange={setListFilter} label="Кинуто" />
              <RadioOption name="list" value="read" checkedValue={listFilter} onChange={setListFilter} label="Прочитано" />
              <RadioOption name="list" value="favorites" checkedValue={listFilter} onChange={setListFilter} label="Улюблене" />
            </div>
          </>
        );
      
      case 'comments':
        return (
          <>
            <div className={styles.filterBlock}>
              <h4 className={styles.blockTitle}>Тип</h4>
              <RadioOption name="type" value="all" checkedValue={commentType} onChange={setCommentType} label="Всі" />
              <RadioOption name="type" value="manga" checkedValue={commentType} onChange={setCommentType} label="Манґа" />
              <RadioOption name="type" value="fanfic" checkedValue={commentType} onChange={setCommentType} label="Література" />
              <RadioOption name="type" value="manhwa" checkedValue={commentType} onChange={setCommentType} label="Манхва" />
            </div>

            <div className={styles.filterBlock}>
              <h4 className={styles.blockTitle}>Розміщення</h4>
              <RadioOption name="location" value="all" checkedValue={commentLocation} onChange={setCommentLocation} label="Всі" />
              <RadioOption name="location" value="under_title" checkedValue={commentLocation} onChange={setCommentLocation} label="Під тайтлом" />
              <RadioOption name="location" value="under_chapters" checkedValue={commentLocation} onChange={setCommentLocation} label="Під розділами" />
            </div>
          </>
        );

      default:
        return (
          <div className={styles.emptyFilter}>
            <p>Фільтри для цієї вкладки недоступні.</p>
          </div>
        );
    }
  };

  return (
    <aside className={styles.sidebar}>
      {renderFilters()}
    </aside>
  );
};

export default ProfileSidebar;
