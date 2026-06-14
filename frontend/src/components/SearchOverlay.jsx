import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import styles from './SearchOverlay.module.scss';

const MOCK_DATA = {
  titles: [
    { id: 1, title: 'Людина-бензопила', type: 'Манґа', chapters: 150, desc: 'Денджі — бідний хлопець, який полює на демонів...', image: '/uploads/chainsaw_man.jpg' },
    { id: 3, title: 'Наруто', type: 'Манґа', chapters: 700, desc: 'Пригоди молодого ніндзя, який мріє стати Хокаґе...', image: '/uploads/naruto.jpg' },
    { id: 4, title: 'Ван Піс', type: 'Манґа', chapters: 1100, desc: 'Луффі та його команда шукають легендарний скарб...', image: '/uploads/one_piece.jpg' },
  ],
  manhwa: [
    { id: 2, title: 'Підняття рівня поодинці', type: 'Манхва', chapters: 80, desc: 'Історія про найсильнішого гравця у світі...', image: '/uploads/solo_leveling.jpg' },
    { id: 5, title: 'Вежа Бога', type: 'Манхва', chapters: 550, desc: 'Пригоди на шляху до вершини...', image: '/uploads/tower_of_god.jpg' },
  ],
  manhua: [
    { id: 6, title: 'Сказання про Демонів та Богів', type: 'Маньхуа', chapters: 450, desc: 'Не Сяо повертається у минуле...', image: '/uploads/novel.jpg' },
  ],
  fanfics: [
    { id: 7, title: 'Легенда про людину', type: 'Література/Фанфік', chapters: 12, desc: 'Альтернативна історія про світ магії...', image: '/uploads/novel.jpg' },
    { id: 8, title: 'Тінь Хокаґе', type: 'Література/Фанфік', chapters: 15, desc: 'Нова сила Наруто...', image: '/uploads/novel.jpg' },
  ]
};

const SearchOverlay = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('titles');
  const [query, setQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Handling animation and focus
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  // Handle Esc key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const handleResultClick = (id) => {
    onClose();
    navigate(`/manga/${id}`);
  };

  const getFilteredData = () => {
    const data = MOCK_DATA[activeTab] || [];
    if (!query) return data.slice(0, 5); // Show some defaults
    return data.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase())
    );
  };

  const results = getFilteredData();

  return (
    <div className={`${styles.overlay} ${isVisible ? styles.visible : ''}`} onClick={onClose}>
      <div className={styles.searchContainer} onClick={e => e.stopPropagation()}>
        <div className={styles.searchHeader}>
          <FiSearch size={20} className={styles.searchIcon} />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Що ви шукаєте сьогодні?" 
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className={styles.closeBtn} onClick={onClose}><FiX size={24} /></button>
        </div>

        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'titles' ? styles.active : ''}`}
            onClick={() => setActiveTab('titles')}
          >
            Тайтли
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'manhwa' ? styles.active : ''}`}
            onClick={() => setActiveTab('manhwa')}
          >
            Манхва
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'manhua' ? styles.active : ''}`}
            onClick={() => setActiveTab('manhua')}
          >
            Маньхуа
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'fanfics' ? styles.active : ''}`}
            onClick={() => setActiveTab('fanfics')}
          >
            Література/Фанфіки
          </button>
        </div>

        <div className={styles.resultsArea}>
          {results.length > 0 ? (
            <div className={styles.resultsGrid}>
              {results.map(item => (
                <div 
                  key={item.id} 
                  className={styles.resultItem}
                  onClick={() => handleResultClick(item.id)}
                >
                  <div className={styles.imageWrapper}>
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className={styles.itemInfo}>
                    <h4 className={styles.itemTitle}>{item.title}</h4>
                    <div className={styles.itemMeta}>
                      <span>{item.type}</span>
                      <span className={styles.dot}>•</span>
                      <span>{item.chapters} розділів</span>
                    </div>
                    <p className={styles.itemDesc}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              <FiSearch size={48} className={styles.noResultsIcon} />
              <p>Нічого не знайдено за запитом "{query}"</p>
            </div>
          )}
        </div>

        <div className={styles.searchFooter}>
          <p>Розширений пошук тайтлів знаходиться в <Link to="/catalog" onClick={onClose}>каталозі</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
