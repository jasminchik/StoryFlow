import React from 'react';
import './UpdatesGrid.css';

const UpdatesGrid = () => {
  const updates = [
    { id: 1, title: 'Наруто', chapter: '700', cover: 'https://via.placeholder.com/150x220?text=Naruto' },
    { id: 2, title: 'Бліч', chapter: '686', cover: 'https://via.placeholder.com/150x220?text=Bleach' },
    { id: 3, title: 'Ван Піс', chapter: '1100', cover: 'https://via.placeholder.com/150x220?text=One+Piece' },
    { id: 4, title: 'Людина-бензопила', chapter: '150', cover: 'https://via.placeholder.com/150x220?text=Chainsaw+Man' },
  ];

  return (
    <div className="updates-container">
      <h2 className="section-title">Останні оновлення</h2>
      <div className="updates-grid">
        {updates.map(manga => (
          <div key={manga.id} className="manga-card">
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
