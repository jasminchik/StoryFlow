import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsAuth(true);
      setCurrentUser(JSON.parse(user));
    }
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

  const handleRandomTitle = () => {
    const randomIndex = Math.floor(Math.random() * AVAILABLE_IDS.length);
    const randomId = AVAILABLE_IDS[randomIndex];
    
    setIsCatalogOpen(false);
    navigate(`/manga/${randomId}`);
  };

  return (
    <>
      <header className={styles.headerWrapper}>
        <div className={styles.headerInner}>
          
          {/* ЛІВА ЗОНА: Тільки логотип */}
          <div className={styles.leftArea}>
            <Link to="/" className={styles.logoLink}>
              <Logo className={styles.logoSvg} />
              StoryFlow
            </Link>
          </div>

          {/* ЦЕНТРАЛЬНА ЗОНА: Каталог -> Пошук -> Новини (Строго по центру) */}
          <div className={styles.centerArea}>
            <div className={styles.catalogContainer} ref={catalogRef}>
              <button 
                className={styles.navLinkBtn} 
                onClick={() => setIsCatalogOpen(!isCatalogOpen)}
              >
                Каталог <span className={styles.dropdownArrow}>{isCatalogOpen ? '▲' : '▼'}</span>
              </button>
              {isCatalogOpen && (
                <div className={styles.catalogDropdown}>
                  <Link to="/catalog?type=manga" className={styles.catalogItem} onClick={() => setIsCatalogOpen(false)}>Манґа</Link>
                  <Link to="/catalog?type=manhwa" className={styles.catalogItem} onClick={() => setIsCatalogOpen(false)}>Манхва</Link>
                  <Link to="/catalog?type=fanfic" className={styles.catalogItem} onClick={() => setIsCatalogOpen(false)}>Фанфіки</Link>
                  <Link to="/authors" className={styles.catalogItem} onClick={() => setIsCatalogOpen(false)}>Автори</Link>
                  <Link to="/reading-now" className={styles.catalogItem} onClick={() => setIsCatalogOpen(false)}>Читають зараз</Link>
                  
                  <div className={styles.dropdownDivider}></div>
                  <button className={styles.randomBtn} onClick={handleRandomTitle}>
                    🎲 Випадковий тайтл
                  </button>
                </div>
              )}
            </div>

            <button className={styles.searchTrigger} onClick={() => setIsSearchOpen(true)}>
              <span className={styles.searchIcon}>🔍</span>
              <span className={styles.searchText}>Пошук</span>
            </button>

            <Link to="/news" className={styles.navLink}>Новини</Link>
          </div>

          {/* ПРАВА ЗОНА: Обране, Профіль та Бургер */}
          <div className={styles.rightArea}>
            <Link to="/favorites" className={styles.bookmarkLink} title="Обране">
              <span className={styles.icon}>💖</span>
              <span className={styles.btnText}>Обране</span>
            </Link>
            
            {!isAuth ? (
              <button className={styles.authBtn} onClick={handleLoginClick}>Увійти</button>
            ) : (
              <div className={styles.userProfileContainer}>
                <div 
                  className={styles.avatar} 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  title="Мій профіль"
                >
                  {currentUser?.username ? currentUser.username[0].toUpperCase() : '👤'}
                </div>
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
