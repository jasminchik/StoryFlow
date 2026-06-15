import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiX, FiChevronDown, FiStar, FiArrowLeft, FiSliders } from 'react-icons/fi';
import Header from '../components/Header';
import styles from './Catalog.module.scss';

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

const GENRES = ['Бойовик', 'Пригоди', 'Комедія', 'Драма', 'Фентезі', 'Жахи', 'Містика', 'Романтика', 'Психологія', 'Наукова фантастика', 'Повсякденність', 'Трагедія', 'Надприродне', 'Екшн', 'Військове'];

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [catalog, setCatalog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFormat, setActiveFormat] = useState('Всі');
  const [activeStatuses, setActiveStatuses] = useState([]);
  const [activeGenres, setActiveGenres] = useState([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCatalog = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/manga');
        const data = await response.json();
        if (data.success) {
          setCatalog(data.data);
        }
      } catch (error) {
        console.error('Помилка завантаження каталогу:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalog();
  }, []);

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

  // Фільтрація каталогу (клієнтська сторона для цього етапу)
  const filteredCatalog = catalog.filter(item => {
    const matchesFormat = activeFormat === 'Всі' || item.type === activeFormat;
    
    // Статуси в базі: 'Анонс', 'В процесі', 'Завершено', 'Призупинено'
    // Статуси в фільтрі: 'Онґоінґ' (== 'В процесі'), 'Завершено', 'Анонс'
    const statusMap = {
      'Онґоінґ': 'В процесі',
      'Завершено': 'Завершено',
      'Анонс': 'Анонс'
    };
    const matchesStatus = activeStatuses.length === 0 || activeStatuses.some(s => item.status === statusMap[s]);
    
    const matchesGenres = activeGenres.length === 0 || activeGenres.every(g => item.genres.includes(g));
    
    return matchesFormat && matchesStatus && matchesGenres;
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
            <span className={styles.resultsCount}>
              {isLoading ? 'Завантаження...' : `Знайдено: ${filteredCatalog.length}`}
            </span>
          </div>

          <div className={styles.catalogGrid}>
            {filteredCatalog.map((item) => (
              <div 
                key={item._id} 
                className={styles.mangaCard}
                onClick={() => navigate(`/manga/${item._id}`)}
              >
                <div className={styles.imageWrapper}>
                  <img src={item.coverImage.startsWith('http') ? item.coverImage : `http://localhost:5000${item.coverImage}`} alt={item.title} />
                  <div className={styles.rating}><FiStar size={12} fill="currentColor" /> {item.rating ? item.rating.toFixed(1) : '0.0'}</div>
                  <div className={styles.typeBadge}>{item.type}</div>
                </div>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <span className={styles.chapters}>{item.releaseYear} • {item.status}</span>
                </div>
              </div>
            ))}
          </div>

          {!isLoading && filteredCatalog.length === 0 && (
            <div className={styles.emptyState}>
              <p>За вашим запитом нічого не знайдено.</p>
              <button onClick={resetFilters} className={styles.resetBtn}>Скинути фільтри</button>
            </div>
          )}
        </main>

        {/* ПРАВА ЧАСТИНА: Фільтри */}
        <aside className={`${styles.sidebar} ${isMobileFiltersOpen ? styles.mobileOpen : ''}`}>
          <div className={styles.overlay} onClick={() => setIsMobileFiltersOpen(false)}></div>
          
          <div className={styles.filterPanel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Фільтри</h2>
              <button className={styles.closeBtn} onClick={() => setIsMobileFiltersOpen(false)}>
                <FiX size={24} />
              </button>
            </div>

            <div className={styles.panelContent}>
              <h2 className={`${styles.filterTitle} ${styles.desktopOnly}`}>Фільтри</h2>
              
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
