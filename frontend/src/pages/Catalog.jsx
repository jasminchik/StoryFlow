import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import styles from './Catalog.module.scss';

const MOCK_CATALOG = [
  { id: 1, title: 'Берсерк', type: 'Манґа', rating: 4.9, chapters: 375, status: 'Завершено', image: '/uploads/berserk.jpg' },
  { id: 2, title: 'Атака Титанів', type: 'Манґа', rating: 4.8, chapters: 139, status: 'Завершено', image: '/uploads/attack_on_titan.jpg' },
  { id: 3, title: 'Легенда про меч', type: 'Фанфік', rating: 4.2, chapters: 42, status: 'Онґоінґ', image: '/uploads/novel.jpg' },
  { id: 4, title: 'Токійський ґуль', type: 'Манґа', rating: 4.5, chapters: 143, status: 'Завершено', image: '/uploads/tokyo_ghoul.jpg' },
  { id: 5, title: 'Вежа Бога', type: 'Манхва', rating: 4.8, chapters: 550, status: 'Онґоінґ', image: '/uploads/tower_of_god.jpg' },
  { id: 6, title: 'Світ без магії', type: 'Фанфік', rating: 3.9, chapters: 15, status: 'Анонс', image: '/uploads/novel.jpg' },
];

const TYPE_MAP = {
  'manga': 'Манґа',
  'manhwa': 'Манхва',
  'manhua': 'Маньхуа',
  'comics': 'Комікс',
  'fanfic': 'Фанфік'
};

const REVERSE_TYPE_MAP = {
  'Манґа': 'manga',
  'Манхва': 'manhwa',
  'Маньхуа': 'manhua',
  'Комікс': 'comics',
  'Фанфік': 'fanfic'
};

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFormat, setActiveFormat] = useState('Всі');
  const [activeStatuses, setActiveStatuses] = useState([]);
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

  const resetFilters = () => {
    setActiveFormat('Всі');
    setActiveStatuses([]);
    setSearchParams({});
  };

  // Фільтрація каталогу
  const filteredCatalog = MOCK_CATALOG.filter(item => {
    const matchesFormat = activeFormat === 'Всі' || item.type === activeFormat;
    const matchesStatus = activeStatuses.length === 0 || activeStatuses.includes(item.status);
    return matchesFormat && matchesStatus;
  });
  
  return (
    <div className={styles.catalogWrapper}>
      <Header />
      
      <div className={styles.container}>
        {/* Кнопка для мобільних */}
        <button 
          className={styles.mobileToggleBtn} 
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
        >
          {isMobileFiltersOpen ? 'Сховати фільтри ✖' : 'Фільтри 🔽'}
        </button>

        {/* ЛІВА ЧАСТИНА: Сітка тайтлів (75%) */}
        <main className={styles.mainContent}>
          <div className={styles.catalogHeader}>
            <h1 className={styles.pageTitle}>Каталог творів</h1>
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
        <aside className={`${styles.sidebar} ${isMobileFiltersOpen ? styles.mobileOpen : ''}`}>
          <div className={styles.filterCard}>
            <h2 className={styles.filterTitle}>Фільтри</h2>
            
            {/* Фільтр: Формат */}
            <div className={styles.filterGroup}>
              <h3 className={styles.groupTitle}>Формат</h3>
              <div className={styles.btnGroup}>
                {['Всі', 'Манґа', 'Манхва', 'Маньхуа', 'Комікс', 'Фанфік'].map(format => (
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

            <button 
              className={styles.applyBtn}
              onClick={resetFilters}
            >
              Скинути фільтри
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Catalog;
