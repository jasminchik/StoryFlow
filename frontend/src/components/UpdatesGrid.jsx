import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UpdatesGrid.css';

const UpdatesGrid = () => {
  const navigate = useNavigate();
  const updates = [
    { id: 1, title: 'Наруто', chapter: '700', cover: '/uploads/naruto.jpg' },
    { id: 2, title: 'Бліч', chapter: '686', cover: '/uploads/bleach.jpg' },
    { id: 3, title: 'Ван Піс', chapter: '1100', cover: '/uploads/one_piece.jpg' },
    { id: 4, title: 'Людина-бензопила', chapter: '150', cover: '/uploads/chainsaw_man.jpg' },
  ];

  return (
    <div className="updates-container">
      <h2 className="section-title">Останні оновлення</h2>
      <div className="updates-grid">
        {updates.map(manga => (
          <div 
            key={manga.id} 
            className="manga-card"
            onClick={() => navigate(`/manga/${manga.id}`)}
          >
            <div className="cover-wrapper">
              <img src={manga.cover} alt={manga.title} />
              <div className="chapter-badge">Розділ {manga.chapter}</div>
            </div>
            <h3 className="manga-card-title">{manga.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpdatesGrid;
