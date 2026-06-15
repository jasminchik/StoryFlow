import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiSearch, FiTrendingUp, FiHistory, FiBookOpen, FiUser } from 'react-icons/fi';
import styles from './SearchOverlay.module.scss';

const SearchOverlay = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('manga'); // 'manga', 'manhwa', 'authors'
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // В майбутньому тут буде логіка пошуку через API
  };

  const handleResultClick = (id, type) => {
    onClose();
    if (type === 'author') {
      navigate(`/profile/${id}`);
    } else {
      navigate(`/manga/${id}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.searchField}>
            <FiSearch className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Пошук манґи, авторів..." 
              value={searchQuery}
              onChange={handleSearch}
              autoFocus
            />
            {searchQuery && (
              <button className={styles.clearBtn} onClick={() => setSearchQuery('')}>
                <FiX />
              </button>
            )}
          </div>
          <button className={styles.closeBtn} onClick={onClose}>Закрити</button>
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
                      {activeTab === 'authors' ? <FiUser /> : <FiBookOpen />}
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
                  <p>За запитом "{searchQuery}" нічого не знайдено</p>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.suggestions}>
              <div className={styles.suggestionBlock}>
                <h3><FiTrendingUp className={styles.blockIcon} /> Популярні запити</h3>
                <div className={styles.tagList}>
                  {['Берсерк', 'Наруто', 'Ван Піс', 'Блю Лок', 'Магічна битва'].map(tag => (
                    <button key={tag} className={styles.tagBtn} onClick={() => setSearchQuery(tag)}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.suggestionBlock}>
                <h3><FiHistory className={styles.blockIcon} /> Недавній пошук</h3>
                <p className={styles.emptyHint}>Історія пошуку порожня</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
