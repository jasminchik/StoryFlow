import React from 'react';
import Header from '../../components/Header';
import styles from './Authors.module.scss';

const MOCK_AUTHORS = [
  { id: 1, nickname: 'Майстер_Манґи', worksCount: 12, color: '#FF4757' },
  { id: 2, nickname: 'Кіт_Письменник', worksCount: 5, color: '#2ED573' },
  { id: 3, nickname: 'Легенда_UA', worksCount: 24, color: '#1E90FF' },
  { id: 4, nickname: 'Анімешник_З_Львова', worksCount: 8, color: '#FFA502' },
  { id: 5, nickname: 'Самурай_Пензля', worksCount: 3, color: '#9b59b6' },
  { id: 6, nickname: 'Читач_У_Тіні', worksCount: 15, color: '#e67e22' },
  { id: 7, nickname: 'Dark_Knight', worksCount: 7, color: '#34495e' },
  { id: 8, title: 'Тацукі Фуджімото', nickname: 'Тацукі Фуджімото', worksCount: 12, color: '#c0392b' },
];

const Authors = () => {
  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Автори платформи</h1>
        <div className={styles.authorsGrid}>
          {MOCK_AUTHORS.map(author => (
            <div key={author.id} className={styles.authorCard}>
              <div className={styles.avatar} style={{ backgroundColor: author.color }}>
                {author.nickname.charAt(0).toUpperCase()}
              </div>
              <div className={styles.info}>
                <h3 className={styles.nickname}>{author.nickname}</h3>
                <p className={styles.works}>{author.worksCount} творів</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Authors;
