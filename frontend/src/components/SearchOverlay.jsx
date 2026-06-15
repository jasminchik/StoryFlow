import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiSearch, FiTrendingUp, FiClock, FiBookOpen, FiUser } from 'react-icons/fi';
import styles from './SearchOverlay.module.scss';

const SearchOverlay = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('manga'); // 'manga', 'manhwa', 'authors'
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }
      
      setIsLoading(true);
      try {
        let url = `http://localhost:5000/api/manga/search?q=${encodeURIComponent(searchQuery)}`;
        
        if (activeTab === 'manhwa') {
          url += '&type=manhwa';
        } else if (activeTab === 'manga') {
          url += '&type=manga';
        }

        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
          // Форматуємо результати під інтерфейс
          const formattedResults = data.data.map(item => ({
            id: item._id,
            title: item.title,
            type: item.type,
            image: item.coverImage
          }));
          setResults(formattedResults);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Простий debounce
    const timeoutId = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeTab]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleResultClick = (id, type) => {
    onClose();
    if (type === 'author') {
      navigate(`/profile/${id}`);
    } else {
      navigate(`/manga/${id}`);
    }
  };

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.visible : ''}`} onClick={onClose}>
      <div className={styles.searchContainer} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.searchHeader}>
          <div className={styles.inputWrapper}>
            <FiSearch className={styles.searchIcon} />
            <input 
              type="text" 
              className={styles.searchInput}
              placeholder="Пошук манґи, авторів..." 
              value={searchQuery}
              onChange={handleSearch}
              autoFocus
            />
            {searchQuery && (
              <button className={styles.clearBtn} onClick={() => setSearchQuery('')}>
                <FiX size={20} />
              </button>
            )}
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <FiX size={28} />
          </button>
        </div>

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
            className={`${styles.tabBtn} ${activeTab === 'authors' ? styles.active : ''}`}
            onClick={() => setActiveTab('authors')}
          >
            Автори
          </button>
        </div>

        <div className={styles.content}>
          {searchQuery ? (
            <div className={styles.resultsGrid}>
              {results.length > 0 ? (
                results.map((item) => (
                  <div 
                    key={item.id} 
                    className={styles.resultItem}
                    onClick={() => handleResultClick(item.id, activeTab === 'authors' ? 'author' : 'manga')}
                  >
                    <div className={styles.resultAvatar}>
                      {activeTab === 'authors' ? <FiUser /> : (item.image ? <img src={item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`} alt={item.title} className={styles.resultImg} /> : <FiBookOpen />)}
                    </div>
                    <div className={styles.resultInfo}>
                      <span className={styles.resultTitle}>{item.title || item.name}</span>
                      <span className={styles.resultMeta}>
                        {activeTab === 'authors' ? 'Автор' : item.type}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noResults}>
                  <p>Нічого не знайдено за цим запитом</p>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>Почніть вводити назву, щоб знайти тайтл або автора</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
