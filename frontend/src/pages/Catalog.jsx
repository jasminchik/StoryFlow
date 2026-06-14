import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiX, FiChevronDown, FiStar, FiArrowLeft, FiSliders } from 'react-icons/fi';
import Header from '../components/Header';
import styles from './Catalog.module.scss';

const MOCK_CATALOG = [
  { id: 1, title: 'Берсерк', type: 'Манґа', rating: 4.9, chapters: 375, status: 'Завершено', image: '/uploads/berserk.jpg' },
  { id: 2, title: 'Атака Титанів', type: 'Манґа', rating: 4.8, chapters: 139, status: 'Завершено', image: '/uploads/attack_on_titan.jpg' },
  { id: 3, title: 'Легенда про меч', type: 'Література/Фанфік', rating: 4.2, chapters: 42, status: 'Онґоінґ', image: '/uploads/novel.jpg' },
  { id: 4, title: 'Токійський ґуль', type: 'Манґа', rating: 4.5, chapters: 143, status: 'Завершено', image: '/uploads/tokyo_ghoul.jpg' },
  { id: 5, title: 'Вежа Бога', type: 'Манхва', rating: 4.8, chapters: 550, status: 'Онґоінґ', image: '/uploads/tower_of_god.jpg' },
  { id: 6, title: 'Світ без магії', type: 'Література/Фанфік', rating: 3.9, chapters: 15, status: 'Анонс', image: '/uploads/novel.jpg' },
];

const TYPE_MAP = {
  'manga': 'Манґа',
  'manhwa': 'Манхва',
  'manhua': 'Маньхуа',
  'comics': 'Комікс',
  'fanfic': 'Література/Фанфік'
};

const REVERSE_TYPE_MAP = {
  'Манґа': 'manga',
  'Манхва': 'manhwa',
  'Маньхуа': 'manhua',
  'Комікс': 'comics',
  'Література/Фанфік': 'fanfic'
};

const GENRES = ['Екшн', 'Комедія', 'Драма', 'Романтика', 'Фентезі', 'Психологія', 'Жахи', 'Пригоди', 'Спорт'];

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFormat, setActiveFormat] = useState('Всі');
  const [activeStatuses, setActiveStatuses] = useState([]);
  const [activeGenres, setActiveGenres] = useState([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const navigate = useNavigate();

  // Синхронізація стейту з URL-параметрами
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam && TYPE_MAP[typeParam]) {
      setActiveFormat(TYPE_MAP[typeParam]);
    } else {
      setActiveFormat('Всі');
    }
  }, [searchParams]);

  const handleFormatChange = (format) => {
    setActiveFormat(format);
    if (format === 'Всі') {
      searchParams.delete('type');
    } else {
      searchParams.set('type', REVERSE_TYPE_MAP[format]);
    }
    setSearchParams(searchParams);
  };

  const handleStatusChange = (status) => {
    if (activeStatuses.includes(status)) {
      setActiveStatuses(activeStatuses.filter(s => s !== status));
    } else {
      setActiveStatuses([...activeStatuses, status]);
    }
  };

  const handleGenreToggle = (genre) => {
    if (activeGenres.includes(genre)) {
      setActiveGenres(activeGenres.filter(g => g !== genre));
    } else {
      setActiveGenres([...activeGenres, genre]);
    }
  };

  const resetFilters = () => {
    setActiveFormat('Всі');
    setActiveStatuses([]);
    setActiveGenres([]);
    setSearchParams({});
  };

  const applyMobileFilters = () => {
    setIsMobileFiltersOpen(false);
  };

  // Фільтрація каталогу
  const filteredCatalog = MOCK_CATALOG.filter(item => {
    const matchesFormat = activeFormat === 'Всі' || item.type === activeFormat;
    const matchesStatus = activeStatuses.length === 0 || activeStatuses.includes(item.status);
    return matchesFormat && matchesStatus;
  });
  
  return (
    <div className={`${styles.catalogWrapper} ${isMobileFiltersOpen ? styles.noScroll : ''}`}>
      <Header />
      
      <div className={styles.container}>
        {/* КАТАЛОГ HEADER (Тільки для мобільних) */}
        <div className={styles.mobileActions}>
          <button className={styles.backBtn} onClick={() => navigate('/')}>
            <FiArrowLeft size={24} />
          </button>
          <div className={styles.mobileTitle}>Каталог</div>
          <button 
            className={styles.mobileFilterToggle} 
            onClick={() => setIsMobileFiltersOpen(true)}
          >
            <FiSliders size={20} />
          </button>
        </div>

        {/* ЛІВА ЧАСТИНА: Сітка тайтлів (75%) */}
        <main className={styles.mainContent}>
          <div className={styles.catalogHeader}>
            <h1 className={`${styles.pageTitle} ${styles.desktopOnly}`}>Каталог творів</h1>
            <span className={styles.resultsCount}>Знайдено: {filteredCatalog.length}</span>
          </div>

          <div className={styles.catalogGrid}>
            {filteredCatalog.map((item) => (
              <div 
                key={item.id} 
                className={styles.mangaCard}
                onClick={() => navigate(`/manga/${item.id}`)}
              >
                <div className={styles.imageWrapper}>
                  {item.type !== 'Література/Фанфік' ? (
                    <img src={item.image} alt={item.title} />
                  ) : (
                    <div className={styles.textCover}>{item.title}</div>
                  )}
                  <div className={styles.rating}><FiStar size={12} fill="currentColor" /> {item.rating}</div>
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


        {/* ПРАВА ЧАСТИНА: Фільтри (Off-canvas на мобільних) */}
        <aside className={`${styles.sidebar} ${isMobileFiltersOpen ? styles.mobileOpen : ''}`}>
          {/* Overlay для мобілок */}
          <div className={styles.overlay} onClick={() => setIsMobileFiltersOpen(false)}></div>
          
          <div className={styles.filterPanel}>
            {/* Header для мобільної панелі */}
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Фільтри</h2>
              <button className={styles.closeBtn} onClick={() => setIsMobileFiltersOpen(false)}>
                <FiX size={24} />
              </button>
            </div>

            <div className={styles.panelContent}>
              <h2 className={`${styles.filterTitle} ${styles.desktopOnly}`}>Фільтри</h2>
              
              {/* Фільтр: Формат */}
              <div className={styles.filterGroup}>
                <h3 className={styles.groupTitle}>Формат</h3>
                <div className={styles.btnGroup}>
                  {['Всі', 'Манґа', 'Манхва', 'Маньхуа', 'Комікс', 'Література/Фанфік'].map(format => (
                    <button 
                      key={format}
                      className={`${styles.filterBtn} ${activeFormat === format ? styles.active : ''}`}
                      onClick={() => handleFormatChange(format)}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              {/* Фільтр: Жанри */}
              <div className={styles.filterGroup}>
                <h3 className={styles.groupTitle}>Жанри</h3>
                <div className={styles.genreGrid}>
                  {GENRES.map(genre => (
                    <button 
                      key={genre}
                      className={`${styles.genreBtn} ${activeGenres.includes(genre) ? styles.active : ''}`}
                      onClick={() => handleGenreToggle(genre)}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Фільтр: Статус */}
              <div className={styles.filterGroup}>
                <h3 className={styles.groupTitle}>Статус</h3>
                <div className={styles.checkboxGroup}>
                  {['Онґоінґ', 'Завершено', 'Анонс'].map(status => (
                    <label key={status} className={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={activeStatuses.includes(status)}
                        onChange={() => handleStatusChange(status)}
                      /> {status}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer для мобільної панелі (Sticky/Fixed) */}
            <div className={styles.panelFooter}>
              <button className={styles.resetBtn} onClick={resetFilters}>Скинути</button>
              <button className={styles.applyBtn} onClick={applyMobileFilters}>Застосувати</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Catalog;
