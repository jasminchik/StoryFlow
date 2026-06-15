import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import styles from './Authors.module.scss';

const Authors = () => {
  const navigate = useNavigate();
  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // В майбутньому тут буде запит до API для отримання списку авторів
    // Поки що залишаємо пустим для чистоти проекту
    setIsLoading(false);
  }, []);

  return (
    <div className={styles.authorsPage}>
      <Header />
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>Наші автори</h1>
          <p className={styles.subtitle}>Творці неймовірних історій у спільноті StoryFlow</p>
        </header>

        {!isLoading ? (
          authors.length > 0 ? (
            <div className={styles.authorsGrid}>
              {authors.map(author => (
                <div 
                  key={author.id} 
                  className={styles.authorCard}
                  onClick={() => navigate(`/profile/${author.username}`)}
                >
                  <div className={styles.avatarWrapper}>
                    {author.avatar ? (
                      <img src={author.avatar} alt={author.username} />
                    ) : (
                      <div className={styles.avatarPlaceholder}>{author.username.charAt(0)}</div>
                    )}
                  </div>
                  <h3 className={styles.authorName}>{author.username}</h3>
                  <div className={styles.authorStats}>
                    <span>{author.titlesCount} тайтлів</span>
                    <span>•</span>
                    <span>{author.subscribersCount} підписників</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>Список авторів порожній.</div>
          )
        ) : (
          <div className={styles.loading}>Завантаження...</div>
        )}
      </div>
    </div>
  );
};

export default Authors;
