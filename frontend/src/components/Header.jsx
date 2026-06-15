import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiHeart, FiChevronDown, FiShuffle, FiUser } from 'react-icons/fi';
import SearchOverlay from './SearchOverlay';
import AuthModal from './AuthModal';
import ProfileDropdown from './ProfileDropdown';
import Logo from './Logo/Logo';
import styles from './Header.module.scss';

const AVAILABLE_IDS = [1, 2, 3, 4, 5, 6];

const Header = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const catalogRef = useRef(null);
  const navigate = useNavigate();

  // Авто-вхід при завантаженні (відновлення сесії)
  useEffect(() => {
    const refreshUser = () => {
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (token && user) {
          setIsAuth(true);
          setCurrentUser(JSON.parse(user));
        } else {
          setIsAuth(false);
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Failed to parse user from localStorage:', err);
        setIsAuth(false);
        setCurrentUser(null);
      }
    };

    const handleOpenMenu = () => setIsProfileMenuOpen(true);

    refreshUser();

    // Слухаємо оновлення профілю
    window.addEventListener('profileUpdate', refreshUser);
    // Слухаємо команду відкриття меню (з BottomNav)
    window.addEventListener('openProfileMenu', handleOpenMenu);

    // Відкриваємо модалку, якщо є параметри помилки або режиму авторизації
    // АЛЕ тільки якщо користувач ще не авторизований
    const params = new URLSearchParams(window.location.search);
    const hasAuthParams = params.get('auth_mode') || params.get('auth_error');
    if (hasAuthParams && !localStorage.getItem('token')) {
      setIsModalOpen(true);
    }

    return () => {
      window.removeEventListener('profileUpdate', refreshUser);
      window.removeEventListener('openProfileMenu', handleOpenMenu);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (catalogRef.current && !catalogRef.current.contains(event.target)) {
        setIsCatalogOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLoginClick = () => {
    setAuthMessage('');
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleLoginSuccess = (userData) => {
    setIsAuth(true);
    setCurrentUser(userData);
    setIsModalOpen(false);
  };

  const handleLogout = () => {
    // Очищення сесії
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setIsAuth(false);
    setCurrentUser(null);
    setIsProfileMenuOpen(false);
  };

  const handleRandomClick = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/manga/random');
      const data = await response.json();
      if (data.success && data.id) {
        setIsCatalogOpen(false);
        navigate(`/manga/${data.id}`);
      }
    } catch (err) {
      console.error('Помилка при отриманні випадкового тайтлу:', err);
    }
  };

  return (
    <>
      <header className={styles.headerWrapper}>
        <div className={styles.headerInner}>
          
          {/* ЛІВА ЗОНА: Тільки логотип (Сховано на мобільних) */}
          <div className={`${styles.leftArea} ${styles.desktopOnly}`}>
            <Link to="/" className={styles.logoLink}>
              <Logo className={styles.logoSvg} />
              StoryFlow
            </Link>
          </div>

          {/* ЦЕНТРАЛЬНА ЗОНА: Каталог -> Пошук -> Новини */}
          <div className={styles.centerArea}>
            <div className={`${styles.catalogContainer} ${styles.desktopOnly}`} ref={catalogRef}>
              <button 
                className={styles.navLinkBtn} 
                onClick={() => setIsCatalogOpen(!isCatalogOpen)}
              >
                Каталог <FiChevronDown size={18} className={`${styles.dropdownArrow} ${isCatalogOpen ? styles.rotated : ''}`} />
              </button>
              {isCatalogOpen && (
                <div className={styles.catalogDropdown}>
                  <Link to="/catalog?type=manga" className={styles.catalogItem} onClick={() => setIsCatalogOpen(false)}>Манґа</Link>
                  <Link to="/catalog?type=manhwa" className={styles.catalogItem} onClick={() => setIsCatalogOpen(false)}>Манхва</Link>
                  <Link to="/catalog?type=fanfic" className={styles.catalogItem} onClick={() => setIsCatalogOpen(false)}>Література/Фанфік</Link>
                  <Link to="/authors" className={styles.catalogItem} onClick={() => setIsCatalogOpen(false)}>Автори</Link>
                  <Link to="/catalog?status=reading" className={styles.catalogItem} onClick={() => setIsCatalogOpen(false)}>Читають зараз</Link>
                  
                  <div className={styles.dropdownDivider}></div>
                  <button className={styles.randomBtn} onClick={handleRandomClick}>
                    <FiShuffle size={16} /> Випадковий тайтл
                  </button>
                </div>
              )}
            </div>

            <button className={styles.searchTrigger} onClick={() => setIsSearchOpen(true)}>
              <FiSearch size={20} className={styles.searchIcon} />
              <span className={styles.searchText}>Пошук</span>
            </button>

            <Link to="/notifications?tab=news" className={`${styles.navLink} ${styles.desktopOnly}`}>Новини</Link>
          </div>

          {/* ПРАВА ЗОНА: Обране, Профіль та Бургер (Сховано на мобільних) */}
          <div className={`${styles.rightArea} ${styles.desktopOnly}`}>
            <Link to="/favorites" className={`${styles.bookmarkLink} ${styles.desktopOnly}`} title="Обране">
              <FiHeart size={20} className={styles.icon} />
              <span className={styles.btnText}>Обране</span>
            </Link>
            
            {!isAuth ? (
              <button className={styles.authBtn} onClick={handleLoginClick}>Увійти</button>
            ) : (
              <div className={styles.userProfileContainer}>
                <Link 
                  to={`/profile/${currentUser?.username || ''}`}
                  className={styles.headerAvatar} 
                  title="Мій профіль"
                >
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt="Avatar" />
                  ) : (
                    <FiUser size={24} />
                  )}
                </Link>
                <button 
                  className={styles.hamburgerBtn} 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  title="Меню"
                >
                  <span className={styles.bar}></span>
                  <span className={styles.bar}></span>
                  <span className={styles.bar}></span>
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />

      <AuthModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        defaultMessage={authMessage}
        onSuccess={handleLoginSuccess}
      />

      <ProfileDropdown 
        isOpen={isProfileMenuOpen} 
        onClose={() => setIsProfileMenuOpen(false)} 
        user={currentUser}
        onLogout={handleLogout}
      />
    </>
  );
};

export default Header;
