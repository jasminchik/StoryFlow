import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PopularAuthors.module.scss';

const PopularAuthors = () => {
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

  return (
    <div className={styles.popularAuthorsCard}>
      <h2 className={styles.sidebarTitle}>Наші автори</h2>
      <div className={styles.authorsList}>
        {!isLoading ? (
          authors.length > 0 ? (
            authors.map((author) => (
              <div 
                key={author._id} 
                className={styles.authorItem}
                onClick={() => navigate(`/profile/${author.username}`)}
              >
                <div className={styles.authorAvatar}>
                  {author.avatar ? (
                    <img src={author.avatar} alt={author.username} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>{author.username.charAt(0)}</div>
                  )}
                </div>
                <div className={styles.authorInfo}>
                  <span className={styles.authorName}>{author.username}</span>
                  <span className={styles.authorRole}>Автор проекту</span>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.emptyText}>Авторів поки немає</p>
          )
        ) : (
          <p className={styles.loadingText}>Завантаження...</p>
        )}
      </div>
      <button className={styles.moreBtn} onClick={() => navigate('/authors')}>ВСІ АВТОРИ</button>
    </div>
  );
};

export default PopularAuthors;
