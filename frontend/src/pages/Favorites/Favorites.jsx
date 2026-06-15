import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import Header from '../../components/Header';
import styles from './Favorites.module.scss';

const Favorites = () => {
  const [favoriteMangas, setFavoriteMangas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE}/api/user-list/favorites`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
          setFavoriteMangas(data.data);
        }
      } catch (err) {
        console.error('Помилка завантаження обраного:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleCardClick = (item) => {
    // Якщо тип Фанфік/Література - ведемо на /fanfic, інакше на /manga
    const isLit = item.type === 'Фанфік' || item.type === 'Література';
    navigate(isLit ? `/fanfic/${item._id}` : `/manga/${item._id}`);
  };

  return (
    <div className={styles.favoritesWrapper}>
      <Header />
      
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Обране</h1>
          <span className={styles.resultsCount}>Знайдено: {favoriteMangas.length}</span>
        </div>

        {isLoading ? (
          <div className={styles.loading}>Завантаження...</div>
        ) : favoriteMangas.length > 0 ? (
          <div className={styles.favoritesGrid}>
            {favoriteMangas.map((item) => (
              <div 
                key={item._id} 
                className={styles.mangaCard}
                onClick={() => handleCardClick(item)}
              >
                <div className={styles.imageWrapper}>
                  <img 
                    src={item.coverImage ? (item.coverImage.startsWith('http') ? item.coverImage : `${API_BASE}${item.coverImage}`) : ''} 
                    alt={item.title} 
                  />
                  <div className={styles.rating}>
                    <FiStar size={12} fill="currentColor" /> {item.rating?.average ? item.rating.average.toFixed(1) : '0.0'}
                  </div>
                  <div className={styles.typeBadge}>{item.type || 'Манґа'}</div>
                </div>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <span className={styles.chapters}>{item.chaptersCount || 0} розділів</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>❤</div>
            <h2>Тут поки порожньо</h2>
            <p>Додайте тайтли до Обраного, щоб вони з'явилися тут!</p>
            <button className={styles.catalogBtn} onClick={() => navigate('/catalog')}>
              Перейти в каталог
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
