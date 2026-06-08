import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './ProfileDropdown.module.scss';

const ProfileDropdown = ({ isOpen, onClose, user, onLogout }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Затемнення фону */}
      <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`} onClick={onClose}></div>
      
      {/* Бічне меню */}
      <div className={`${styles.sideMenu} ${isOpen ? styles.open : ''}`} ref={menuRef}>
        <div className={styles.menuHeader}>
          <div className={styles.userInfo}>
            <Link to="/profile" className={styles.profileLink} onClick={onClose}>Мій профіль →</Link>
            <h3 className={styles.username}>{user?.username}</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.experienceBadge}>
          <span className={styles.starIcon}>⭐</span>
          <span className={styles.expText}>{user?.experience || 0} досвіду</span>
        </div>

        <nav className={styles.menuLinks}>
          <Link to="/messages" className={styles.menuItem} onClick={onClose}>
            <span className={styles.icon}>✉️</span> Повідомлення
          </Link>
          <Link to="/comments" className={styles.menuItem} onClick={onClose}>
            <span className={styles.icon}>💬</span> Коментарі
          </Link>
          <Link to="/history" className={styles.menuItem} onClick={onClose}>
            <span className={styles.icon}>👁️</span> Історія переглядів
          </Link>
          <Link to="/stats" className={styles.menuItem} onClick={onClose}>
            <span className={styles.icon}>📊</span> Статистика
          </Link>
          
          <div className={styles.divider}></div>
          
          <button className={styles.menuItem}>
            <span className={styles.icon}>🌙</span> Тема сайту: <span className={styles.themeText}>Темна</span>
          </button>
          <Link to="/settings" className={styles.menuItem} onClick={onClose}>
            <span className={styles.icon}>⚙️</span> Налаштування
          </Link>
          
          <button className={`${styles.menuItem} ${styles.logoutBtn}`} onClick={onLogout}>
            <span className={styles.icon}>🚪</span> Вихід
          </button>
        </nav>
      </div>
    </>
  );
};

export default ProfileDropdown;
