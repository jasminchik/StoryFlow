import React, { useState, useEffect } from 'react';
import styles from './Home.module.scss';
import SidebarUpdates from '../components/SidebarUpdates';
import TagCategories from '../components/TagCategories';
import Header from '../components/Header';

// Mock data (для основної стрічки)
const MOCK_POPULAR = [
  { id: 1, title: 'Naruto', rating: 4.8, image: 'https://via.placeholder.com/200x300?text=Naruto' },
  { id: 2, title: 'Bleach', rating: 4.5, image: 'https://via.placeholder.com/200x300?text=Bleach' },
  { id: 3, title: 'One Piece', rating: 4.9, image: 'https://via.placeholder.com/200x300?text=One+Piece' },
  { id: 4, title: 'Solo Leveling', rating: 4.7, image: 'https://via.placeholder.com/200x300?text=Solo+Leveling' },
];

const MOCK_NEW = [
  { id: 5, title: 'My Hero Academia', image: 'https://via.placeholder.com/150x220?text=MHA' },
  { id: 6, title: 'Black Clover', image: 'https://via.placeholder.com/150x220?text=Black+Clover' },
  { id: 7, title: 'Jujutsu Kaisen', image: 'https://via.placeholder.com/150x220?text=JJK' },
  { id: 8, title: 'Chainsaw Man', image: 'https://via.placeholder.com/150x220?text=CSM' },
];

const Home = () => {
  const [popular, setPopular] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);

  useEffect(() => {
    setPopular(MOCK_POPULAR);
    setNewArrivals(MOCK_NEW);
  }, []);

  return (
    <div className={styles.homeWrapper}>
      <Header />

      {/* 2. ОСНОВНИЙ МАКЕТ */}
      <div className={styles.homeContainer}>
        <main className={styles.mainContent}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Найпопулярніші</h2>
            <div className={styles.popularGrid}>
              {popular.map((item) => (
                <div key={item.id} className={styles.mangaCard}>
                  <div className={styles.imageWrapper}>
                    <img src={item.image} alt={item.title} />
                    <div className={styles.rating}>{item.rating}</div>
                  </div>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Новинки</h2>
            <div className={styles.newGrid}>
              {newArrivals.map((item) => (
                <div key={item.id} className={styles.compactCard}>
                  <img src={item.image} alt={item.title} />
                  <h4 className={styles.compactTitle}>{item.title}</h4>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* ПРАВА ПАНЕЛЬ */}
        <aside className={styles.sidebar}>
          <SidebarUpdates />
          <TagCategories />
        </aside>
      </div>
    </div>
  );
};

export default Home;
