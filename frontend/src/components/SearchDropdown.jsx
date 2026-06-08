import React, { useState, useEffect, useRef } from 'react';
import styles from './SearchDropdown.module.scss';

const MOCK_DATA = {
  titles: [
    { id: 1, title: 'Людина-бензопила', type: 'Манґа', chapters: 150, desc: 'Денджі — бідний хлопець, який полює на демонів...', image: 'https://via.placeholder.com/40x60' },
    { id: 2, title: 'Людина-одинак', type: 'Манхва', chapters: 80, desc: 'Історія про найсильнішого гравця у світі...', image: 'https://via.placeholder.com/40x60' },
    { id: 3, title: 'Наруто', type: 'Манґа', chapters: 700, desc: 'Пригоди молодого ніндзя, який мріє стати Хокаґе...', image: 'https://via.placeholder.com/40x60' },
    { id: 4, title: 'One Piece', type: 'Манґа', chapters: 1100, desc: 'Луффі та його команда шукають легендарний скарб...', image: 'https://via.placeholder.com/40x60' },
  ],
  authors: [
    { id: 1, title: 'Тацукі Фуджімото', type: 'Автор', chapters: '12 робіт', desc: 'Автор Chainsaw Man, Fire Punch...', image: 'https://via.placeholder.com/40x60?text=Author' },
    { id: 2, title: 'Ейічіро Ода', type: 'Автор', chapters: '5 робіт', desc: 'Автор легендарного One Piece...', image: 'https://via.placeholder.com/40x60?text=Author' },
  ],
  fanfics: [
    { id: 1, title: 'Легенда про людину', type: 'Фанфік', chapters: 12, desc: 'Альтернативна історія про світ магії...', image: 'https://via.placeholder.com/40x60?text=Fanfic' },
  ]
};

const SearchDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTab, setSearchTab] = useState('titles'); // 'titles', 'authors', 'fanfics'
  const [query, setQuery] = useState('');
  const dropdownRef = useRef(null);

  // Закриття при кліку поза межами
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredData = MOCK_DATA[searchTab].filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className={styles.searchWrapper} ref={dropdownRef}>
      <div className={styles.searchBox}>
        <input 
          type="text" 
          placeholder="Пошук тайтлів..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        <button className={styles.searchBtn}>🔍</button>
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          {/* Таби категорій */}
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${searchTab === 'titles' ? styles.active : ''}`}
              onClick={() => setSearchTab('titles')}
            >
              Тайтли
            </button>
            <button 
              className={`${styles.tab} ${searchTab === 'authors' ? styles.active : ''}`}
              onClick={() => setSearchTab('authors')}
            >
              Автори
            </button>
            <button 
              className={`${styles.tab} ${searchTab === 'fanfics' ? styles.active : ''}`}
              onClick={() => setSearchTab('fanfics')}
            >
              Фанфіки
            </button>
          </div>

          {/* Лічильник та підказка */}
          <div className={styles.metaInfo}>
            {query.length > 0 ? (
              <span>Знайдено {filteredData.length} результатів у категорії</span>
            ) : (
              <span>Розширений пошук тайтлів знаходиться в каталозі</span>
            )}
          </div>

          {/* Результати (дві колонки) */}
          <div className={styles.resultsGrid}>
            {filteredData.length > 0 ? (
              filteredData.map(item => (
                <div key={item.id} className={styles.resultCard}>
                  <img src={item.image} alt={item.title} className={styles.cardImage} />
                  <div className={styles.cardContent}>
                    <h4 className={styles.cardTitle}>{item.title}</h4>
                    <div className={styles.cardMeta}>
                      <span className={styles.type}>{item.type}</span>
                      <span className={styles.chapters}>{item.chapters} розділів</span>
                    </div>
                    <p className={styles.desc}>{item.desc}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noResults}>Нічого не знайдено</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
