import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import styles from './Authors.module.scss';

const Authors = () => {
  const navigate = useNavigate();
  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/authors');
        const data = await response.json();
        if (data.success) {
          setAuthors(data.data);
        }
      } catch (err) {
        console.error('Помилка завантаження авторів:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuthors();
  }, []);

  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Давно';
    const diff = Date.now() - new Date(dateString).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 1) return 'Сьогодні';
    if (days < 30) return `${days} дн. тому`;
    return new Date(dateString).toLocaleDateString('uk-UA');
  };

  return (
    <div className={styles.authorsPage}>
      <Header />
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>Наші автори</h1>
          <p className={styles.subtitle}>Творці неймовірних історій у спільноті StoryFlow</p>
        </header>

        <div className={styles.authorsList}>
          {!isLoading ? (
            authors.length > 0 ? (
              authors.map(author => (
                <div 
                  key={author._id} 
                  className={styles.authorCard}
                  onClick={() => navigate(`/profile/${author.username}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.cardMain}>
                    <div className={styles.avatarWrapper}>
                      {author.avatar ? (
                        <img src={author.avatar} alt={author.username} className={styles.avatar} />
                      ) : (
                        <div className={styles.avatarPlaceholder}>{author.username.charAt(0)}</div>
                      )}
                    </div>
                    
                    <div className={styles.info}>
                      <div className={styles.titleRow}>
                        <h3 className={styles.authorName}>{author.username}</h3>
                      </div>
                      
                      <div className={styles.meta}>
                        <span className={styles.badge}>Автор</span>
                        <span className={styles.stats}>
                          {author.titlesCount} тайтлів
                        </span>
                      </div>
                    </div>
                    
                    <div className={styles.timeInfo}>
                      <span className={styles.time}>На сайті з {new Date(author.createdAt).toLocaleDateString('uk-UA')}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.empty}>Список авторів порожній.</div>
            )
          ) : (
            <div className={styles.loading}>Завантаження...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Authors;
