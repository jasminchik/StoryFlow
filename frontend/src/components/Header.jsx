import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">StoryFlow</div>
        <nav>
          <a href="#" className="nav-link">Каталог</a>
        </nav>
      </div>
      <div className="header-center">
        <div className="search-bar">
          <input type="text" placeholder="Пошук манги..." />
          <button type="button" className="search-btn">
             <span role="img" aria-label="search">🔍</span>
          </button>
        </div>
      </div>
      <div className="header-right">
        <button className="icon-btn" title="Закладки">
          <span role="img" aria-label="bookmarks">🔖</span>
          <span>Закладки</span>
        </button>
        <button className="auth-btn">Увійти</button>
      </div>
    </header>
  );
};

export default Header;
