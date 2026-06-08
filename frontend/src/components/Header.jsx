import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchDropdown from './SearchDropdown';
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
          <div className={styles.navLeft}>
            <Link to="/" className={styles.logoLink}>
              <Logo className={styles.logoSvg} />
              StoryFlow
            </Link>
            <Link to="/catalog" className={styles.navLink}>Каталог</Link>
          </div>
          
          <div className={styles.navCenter}>
            <SearchDropdown />
          </div>
          
          <div className={styles.navRight}>
            <button className={styles.iconBtn} title="Закладки" onClick={handleBookmarksClick}>
              <span className={styles.icon}>🔖</span>
              <span className={styles.btnText}>Закладки</span>
            </button>
            
            {!isAuth ? (
              <button className={styles.authBtn} onClick={handleLoginClick}>Увійти</button>
            ) : (
              <div className={styles.userProfileBtn} onClick={() => setIsProfileMenuOpen(true)}>
                <div className={styles.avatar}>
                  {/* Заглушка аватарки */}
                  {currentUser?.username ? currentUser.username[0].toUpperCase() : '👤'}
                </div>
                <button className={styles.hamburgerBtn}>
                  <span className={styles.bar}></span>
                  <span className={styles.bar}></span>
                  <span className={styles.bar}></span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

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
