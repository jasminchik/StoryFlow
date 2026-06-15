import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UpdatesGrid.css';

const UpdatesGrid = () => {
  const navigate = useNavigate();
  const [updates, setUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/manga');
        const data = await response.json();
        if (data.success) {
          // Поки що просто беремо мангу як "оновлення", 
          // пізніше можна буде зробити ендпоінт для останніх розділів
          const formatted = data.data.slice(0, 12).map(m => ({
            id: m._id,
            title: m.title,
            chapter: m.status, // Тимчасово замість розділу показуємо статус
            cover: m.coverImage ? (m.coverImage.startsWith('http') ? m.coverImage : `http://localhost:5000${m.coverImage}`) : ''
          }));
          setUpdates(formatted);
        }
      } catch (error) {
        console.error('Помилка завантаження оновлень:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpdates();
  }, []);

  if (isLoading) return <div className="updates-loading">Завантаження оновлень...</div>;

  return (
    <div className="updates-container">
      <h2 className="section-title">Останні оновлення</h2>
      {updates.length > 0 ? (
        <div className="updates-grid">
          {updates.map(manga => (
            <div 
              key={manga.id} 
              className="manga-card"
              onClick={() => navigate(`/manga/${manga.id}`)}
            >
              <div className="cover-wrapper">
                <img src={manga.cover} alt={manga.title} />
                <div className="chapter-badge">{manga.chapter}</div>
              </div>
              <h3 className="manga-card-title">{manga.title}</h3>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-text">Оновлень поки що немає.</p>
      )}
    </div>
  );
};

export default UpdatesGrid;
