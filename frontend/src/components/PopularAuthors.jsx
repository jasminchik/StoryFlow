import React from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiBookOpen } from 'react-icons/fi';
import styles from './PopularAuthors.module.scss';

const MOCK_AUTHORS = [
  { id: 1, nickname: 'Майстер_Манґи', worksCount: 12, color: '#FF4757' },
  { id: 2, nickname: 'Кіт_Письменник', worksCount: 5, color: '#2ED573' },
  { id: 3, nickname: 'Легенда_UA', worksCount: 24, color: '#1E90FF' },
  { id: 4, nickname: 'Анімешник_З_Львова', worksCount: 8, color: '#FFA502' },
];

const PopularAuthors = () => {
  // Функція для правильного відмінювання слова "твір"
  const getWorksText = (count) => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return 'творів';
    }
    if (lastDigit === 1) {
      return 'твір';
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
      return 'твори';
    }
    return 'творів';
  };

  return (
    <div className={styles.authorsCard}>
      <h2 className={styles.cardTitle}>
        <FiUsers size={20} className={styles.titleIcon} /> Популярні автори
      </h2>
      
      <div className={styles.authorsList}>
        {MOCK_AUTHORS.map((author) => (
          <div key={author.id} className={styles.authorItem}>
            <div 
              className={styles.avatar} 
              style={{ backgroundColor: author.color }}
            >
              {author.nickname.charAt(0).toUpperCase()}
            </div>
            <div className={styles.authorInfo}>
              <span className={styles.nickname}>{author.nickname}</span>
              <span className={styles.worksCount}>
                <FiBookOpen size={14} className={styles.countIcon} /> {author.worksCount} {getWorksText(author.worksCount)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Link to="/authors" className={styles.moreBtn}>ДИВИТИСЬ ВСІ</Link>
    </div>
  );
};

export default PopularAuthors;
