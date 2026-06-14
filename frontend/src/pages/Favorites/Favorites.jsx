import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import styles from './Favorites.module.scss';

const Favorites = () => {
  const [favoriteMangas, setFavoriteMangas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavoriteMangas(favorites);
  }, []);

  return (
    <div className={styles.favoritesWrapper}>
      <Header />
      
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Обране</h1>
          <span className={styles.resultsCount}>Знайдено: {favoriteMangas.length}</span>
        </div>

        {favoriteMangas.length > 0 ? (
          <div className={styles.favoritesGrid}>
            {favoriteMangas.map((item) => (
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
                  <div className={styles.rating}>⭐ {item.rating}</div>
                  <div className={styles.typeBadge}>{item.type}</div>
                </div>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <span className={styles.chapters}>{item.chapters || 0} розділів</span>
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
