import React from 'react';
import './Sidebar.css';

const Sidebar = () => {
  const topManga = [
    { id: 1, title: 'Solo Leveling', rating: '9.8' },
    { id: 2, title: 'One Piece', rating: '9.5' },
    { id: 3, title: 'Berserk', rating: '9.9' },
  ];

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Топ за тиждень</h2>
      <ul className="top-list">
        {topManga.map((manga, index) => (
          <li key={manga.id} className="top-item">
            <span className="rank">{index + 1}</span>
            <div className="manga-info">
              <span className="manga-title">{manga.title}</span>
              <span className="manga-rating">⭐ {manga.rating}</span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
