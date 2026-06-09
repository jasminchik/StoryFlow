import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchOverlay from './SearchOverlay';
import AuthModal from './AuthModal';
import ProfileDropdown from './ProfileDropdown';
import Logo from './Logo/Logo';
import styles from './Header.module.scss';

const Header = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Авто-вхід при завантаженні (відновлення сесії)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsAuth(true);
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleBookmarksClick = () => {
    if (!isAuth) {
      setAuthMessage('Щоб додавати твори у закладки, вам потрібно зареєструватися або увійти в акаунт.');
      setIsModalOpen(true);
    } else {
      console.log("Перехід до закладок...");
    }
  };

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

  return (
    <>
      <header className={styles.navbar}>
        <div className={styles.navContent}>
          <Link to="/" className={styles.logoLink}>
            <Logo className={styles.logoSvg} />
            StoryFlow
          </Link>

          <div className={styles.centerNav}>
            <nav className={styles.navLinks}>
              <Link to="/catalog" className={styles.navLink}>Каталог</Link>
              <Link to="/news" className={styles.navLink}>Новини</Link>

              <div 
                className={styles.moreContainer}
                onMouseEnter={() => setIsMoreOpen(true)}
                onMouseLeave={() => setIsMoreOpen(false)}
              >
                <button className={styles.moreBtn}>...</button>
                {isMoreOpen && (
                  <div className={styles.moreDropdown}>
                    <Link to="/faq" className={styles.dropdownItem} onClick={() => setIsMoreOpen(false)}>
                      Питання і відповіді
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            <button className={styles.searchTrigger} onClick={() => setIsSearchOpen(true)}>
              <span className={styles.searchIcon}>🔍</span>
              <span className={styles.searchText}>Пошук</span>
            </button>
          </div>

          <div className={styles.navRight}>
            <Link to="/favorites" className={styles.bookmarkLink} title="Обране">
              <span className={styles.icon}>💖</span>
              <span className={styles.btnText}>Обране</span>
            </Link>
      ...
            {!isAuth ? (
              <button className={styles.authBtn} onClick={handleLoginClick}>Увійти</button>
            ) : (
              <div className={styles.userProfileContainer}>
                <Link 
                  to={`/profile/${currentUser?.username || 'user'}`} 
                  className={styles.avatarLink}
                  title="Мій профіль"
                >
                  <div className={styles.avatar}>
                    {currentUser?.username ? currentUser.username[0].toUpperCase() : '👤'}
                  </div>
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
