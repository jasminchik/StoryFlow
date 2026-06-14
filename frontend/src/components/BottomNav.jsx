import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiGrid, FiHeart, FiBell, FiMenu } from 'react-icons/fi';
import Logo from './Logo/Logo';
import styles from './BottomNav.module.scss';

const BottomNav = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleToggleMenu = (e) => {
    e.preventDefault();
    // Викликаємо кастомну подію для відкриття меню в Header.jsx
    window.dispatchEvent(new CustomEvent('openProfileMenu'));
  };

  return (
    <nav className={styles.bottomNav}>
      <Link to="/favorites" className={`${styles.navItem} ${isActive('/favorites') ? styles.active : ''}`}>
        <FiHeart className={styles.icon} />
        <span className={styles.label}>Закладки</span>
      </Link>

      <Link to="/catalog" className={`${styles.navItem} ${isActive('/catalog') ? styles.active : ''}`}>
        <FiGrid className={styles.icon} />
        <span className={styles.label}>Каталог</span>
      </Link>

      <Link to="/" className={`${styles.navItem} ${styles.homeItem} ${isActive('/') ? styles.active : ''}`}>
        <div className={styles.homeIconWrapper}>
          <Logo className={styles.bottomLogo} />
        </div>
      </Link>

      <Link to="/notifications?tab=news" className={`${styles.navItem} ${isActive('/notifications') ? styles.active : ''}`}>
        <FiBell className={styles.icon} />
        <span className={styles.label}>Новини</span>
      </Link>

      <button onClick={handleToggleMenu} className={styles.navItem}>
        <FiMenu className={styles.icon} />
        <span className={styles.label}>Меню</span>
      </button>
    </nav>
  );
};

export default BottomNav;
