import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import styles from './ReadingNow.module.scss';

const MOCK_READING = [
  { id: 101, title: 'Блю Лок', rating: 4.7, image: '/uploads/blue_lock.jpg', type: 'Манґа' },
  { id: 102, title: 'Берсерк', rating: 5.0, image: '/uploads/berserk.jpg', type: 'Манґа' },
  { id: 103, title: 'Токійський ґуль', rating: 4.6, image: '/uploads/tokyo_ghoul.jpg', type: 'Манґа' },
  { id: 104, title: 'Сага про Вінланд', rating: 4.9, image: '/uploads/vinland_saga.jpg', type: 'Манґа' },
  { id: 4, title: 'Підняття рівня поодинці', rating: 4.7, image: '/uploads/solo_leveling.jpg', type: 'Манхва' },
  { id: 42, title: 'Магічна битва', rating: 4.9, image: '/uploads/jujutsu_kaisen.jpg', type: 'Манґа' },
];

const ReadingNow = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Зараз читають спільнотою StoryFlow</h1>
        <div className={styles.grid}>
          {MOCK_READING.map(item => (
            <div 
              key={item.id} 
              className={styles.mangaCard}
              onClick={() => navigate(`/manga/${item.id}`)}
            >
              <div className={styles.imageWrapper}>
                <img src={item.image} alt={item.title} />
                <div className={styles.rating}>⭐ {item.rating}</div>
                <div className={styles.typeBadge}>{item.type}</div>
              </div>
              <h3 className={styles.cardTitle}>{item.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReadingNow;
