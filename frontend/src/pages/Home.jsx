import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.scss';
import SidebarUpdates from '../components/SidebarUpdates';
import PopularAuthors from '../components/PopularAuthors';
import TagCategories from '../components/TagCategories';
import Header from '../components/Header';

// Mock data (для основної стрічки)
const MOCK_POPULAR = [
  { id: 1, title: 'Naruto', rating: 4.8, image: '/uploads/naruto.jpg' },
  { id: 2, title: 'Bleach', rating: 4.5, image: '/uploads/bleach.jpg' },
  { id: 3, title: 'One Piece', rating: 4.9, image: '/uploads/one_piece.jpg' },
  { id: 4, title: 'Solo Leveling', rating: 4.7, image: '/uploads/solo_leveling.jpg' },
  { id: 41, title: 'Chainsaw Man', rating: 4.8, image: '/uploads/chainsaw_man.jpg' },
  { id: 42, title: 'Jujutsu Kaisen', rating: 4.9, image: '/uploads/jujutsu_kaisen.jpg' },
  { id: 43, title: 'Black Clover', rating: 4.4, image: '/uploads/black_clover.jpg' },
  { id: 44, title: 'Blue Lock', rating: 4.6, image: '/uploads/blue_lock.jpg' },
];

const MOCK_READING = [
  { id: 101, title: 'Blue Lock', rating: 4.7, image: '/uploads/blue_lock.jpg' },
  { id: 102, title: 'Berserk', rating: 5.0, image: '/uploads/berserk.jpg' },
  { id: 103, title: 'Tokyo Ghoul', rating: 4.6, image: '/uploads/tokyo_ghoul.jpg' },
  { id: 104, title: 'Vinland Saga', rating: 4.9, image: '/uploads/vinland_saga.jpg' },
];

const MOCK_NEW = [
  { id: 5, title: 'My Hero Academia', image: '/uploads/my_hero_academia.jpg' },
  { id: 6, title: 'Black Clover', image: '/uploads/black_clover.jpg' },
  { id: 7, title: 'Jujutsu Kaisen', image: '/uploads/jujutsu_kaisen.jpg' },
  { id: 8, title: 'Chainsaw Man', image: '/uploads/chainsaw_man.jpg' },
  { id: 51, title: 'Demon Slayer', image: '/uploads/demon_slayer.jpg' },
  { id: 52, title: 'Hell\'s Paradise', image: '/uploads/hells_paradise.jpg' },
  { id: 53, title: 'Spy x Family', image: '/uploads/spy_x_family.jpg' },
  { id: 54, title: 'Oshi no Ko', image: '/uploads/oshi_no_ko.jpg' },
];

const Home = () => {
  const [popular, setPopular] = useState([]);
  const [readingNow, setReadingNow] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setPopular(MOCK_POPULAR);
    setReadingNow(MOCK_READING);
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
                <div 
                  key={item.id} 
                  className={styles.mangaCard}
                  onClick={() => navigate(`/manga/${item.id}`)}
                >
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
            <h2 className={styles.sectionTitle}>Читають зараз</h2>
            <div className={styles.popularGrid}>
              {readingNow.map((item) => (
                <div 
                  key={item.id} 
                  className={styles.mangaCard}
                  onClick={() => navigate(`/manga/${item.id}`)}
                >
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
                <div 
                  key={item.id} 
                  className={styles.compactCard}
                  onClick={() => navigate(`/manga/${item.id}`)}
                >
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
          <PopularAuthors />
          <TagCategories />
        </aside>
      </div>
    </div>
  );
};

export default Home;
