import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiUser, 
  FiBell, 
  FiMessageSquare, 
  FiClock, 
  FiBarChart2, 
  FiSettings, 
  FiLogOut, 
  FiMoon, 
  FiSun,
  FiX,
  FiChevronRight,
  FiEdit3,
  FiPlusSquare,
  FiShield,
  FiShuffle
} from 'react-icons/fi';
import { LuShieldCheck } from 'react-icons/lu';
import { useTheme } from '../context/ThemeContext';
import styles from './ProfileDropdown.module.scss';

const ProfileDropdown = ({ isOpen, onClose, user, onLogout }) => {
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleRandomClick = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/manga/random');
      const data = await response.json();
      if (data.success && data.id) {
        onClose();
        navigate(`/manga/${data.id}`);
      }
    } catch (err) {
      console.error('Помилка при отриманні випадкового тайтлу:', err);
    }
  };

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
            <Link to={`/profile/${user?.username}`} className={styles.profileLink} onClick={onClose}>
              Мій профіль <FiChevronRight size={16} />
            </Link>
            <div className={styles.nameWithBadge}>
              <h3 className={styles.username}>{user?.username}</h3>
              {user?.role === 'admin' && (
                <div className={`${styles.authorBadge} ${styles.adminBadge}`}>
                  <LuShieldCheck size={12} strokeWidth={2.5} />
                  <span>Адміністратор</span>
                </div>
              )}
              {user?.role === 'author' && (
                <div className={styles.authorBadge}>
                  <FiEdit3 size={10} />
                  <span>Автор</span>
                </div>
              )}
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <nav className={styles.menuLinks}>
          {user?.role === 'author' && (
            <Link to="/create-manga" className={`${styles.menuItem} ${styles.createBtn}`} onClick={onClose}>
              <FiPlusSquare className={styles.icon} size={20} /> 
              <span className={styles.createBtnText}>Додати тайтл</span>
            </Link>
          )}
          
          <Link to="/notifications" className={styles.menuItem} onClick={onClose}>
            <FiBell className={styles.icon} size={20} /> Повідомлення
          </Link>
          <Link to={`/profile/${user?.username}?tab=comments`} className={styles.menuItem} onClick={onClose}>
            <FiMessageSquare className={styles.icon} size={20} /> Коментарі
          </Link>
          <Link to={`/profile/${user?.username}?tab=history`} className={styles.menuItem} onClick={onClose}>
            <FiClock className={styles.icon} size={20} /> Історія переглядів
          </Link>
          <Link to={`/profile/${user?.username}?tab=stats`} className={styles.menuItem} onClick={onClose}>
            <FiBarChart2 className={styles.icon} size={20} /> Статистика
          </Link>

          <button className={styles.menuItem} onClick={handleRandomClick}>
            <FiShuffle className={styles.icon} size={20} /> Випадковий тайтл
          </button>
          
          <div className={styles.divider}></div>
          
          <button className={styles.menuItem} onClick={(e) => toggleTheme(e)}>
            {theme === 'dark' ? <FiMoon className={styles.icon} size={20} /> : <FiSun className={styles.icon} size={20} />}
            Тема сайту: <span className={styles.themeText}>{theme === 'dark' ? 'Темна' : 'Світла'}</span>
          </button>
          <Link to={`/profile/${user?.username}?tab=settings`} className={styles.menuItem} onClick={onClose}>
            <FiSettings className={styles.icon} size={20} /> Налаштування
          </Link>
          
          <button className={`${styles.menuItem} ${styles.logoutBtn}`} onClick={onLogout}>
            <FiLogOut className={styles.icon} size={20} /> Вихід
          </button>
        </nav>
      </div>
    </>
  );
};

export default ProfileDropdown;



