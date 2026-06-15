import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiBook, FiEdit3, FiFileText, FiAlertCircle, FiPlus, FiTag } from 'react-icons/fi';
import Header from '../../components/Header';
import styles from './Fanfic.module.scss';

const CreateFanfic = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMangaId = searchParams.get('mangaId') || '';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mangas, setMangas] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    manga: initialMangaId,
    genres: [],
    status: 'in_progress',
    direction: 'Джен',
    ageRating: 'PG-13',
    authorNote: ''
  });

  const availableGenres = [
    'Романтика', 'Драма', 'Фентезі', 'Пригоди', 'Комедія', 
    'Містика', 'Жахи', 'Психологія', 'Повсякденність', 'Трагедія',
    'Бойовик', 'Детектив', 'Флафф', 'Ангст', 'AU'
  ];

  const directions = ['Джен', 'Гет', 'Слеш', 'Фемслеш', 'Стаття', 'Змішана'];
  const ageRatings = ['G', 'PG-13', 'R', 'NC-17'];

  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    const fetchMangas = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/manga`);
        const data = await response.json();
        if (data.success) {
          setMangas(Array.isArray(data.data) ? data.data : []);
        }
      } catch (err) {
        console.error('Помилка завантаження фендомів:', err);
      }
    };
    fetchMangas();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenreToggle = (genre) => {
    setFormData(prev => {
      const isSelected = prev.genres.includes(genre);
      return {
        ...prev,
        genres: isSelected 
          ? prev.genres.filter(g => g !== genre) 
          : [...prev.genres, genre]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.genres.length === 0) {
      setError('Будь ласка, оберіть принаймні один жанр для вашого твору');
      return;
    }

    setIsLoading(true);

    // Підготовка даних: якщо manga порожня строка, ставимо null
    const payload = {
      ...formData,
      manga: formData.manga === '' ? null : formData.manga
    };

    try {
      const response = await fetch(`${API_BASE}/api/literature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Помилка при створенні фанфіка');
      }

      navigate(`/fanfic/${result.data._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.fanficPage}>
      <Header />
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            <FiArrowLeft size={18} />
            <span>Повернутися назад</span>
          </button>
          <h1 className={styles.fanficTitle}>Створити новий твір</h1>
          <p style={{color: 'var(--text-muted)', fontSize: '1.1rem'}}>Розкажіть свою унікальну історію всьому світу.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && (
            <div className={styles.errorMessage}>
              <FiAlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Basic Metadata */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <FiEdit3 />
              <span>Основна інформація</span>
            </h3>
            
            <div className={styles.formGroup}>
              <label>Назва твору *</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleInputChange} 
                placeholder="Придумайте яскраву назву..."
                required 
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Фендом / Тайтл</label>
                <select name="manga" value={formData.manga} onChange={handleInputChange}>
                  <option value="">Оригінальний твір (без фендому)</option>
                  {mangas.map(m => (
                    <option key={m._id} value={m._id}>{m.title}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Спрямованість</label>
                <select name="direction" value={formData.direction} onChange={handleInputChange}>
                  {directions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Віковий рейтинг</label>
                <select name="ageRating" value={formData.ageRating} onChange={handleInputChange}>
                  {ageRatings.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Статус</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="in_progress">В процесі (ще пишу)</option>
                  <option value="completed">Завершено (кінець)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Annotation and Notes */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <FiFileText />
              <span>Зміст та примітки</span>
            </h3>
            
            <div className={styles.formGroup}>
              <label>Анотація (Опис) *</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                placeholder="Коротко опишіть, про що ваш твір, щоб зацікавити читачів..."
                required 
              ></textarea>
            </div>

            <div className={styles.formGroup}>
              <label>Примітка автора (необов'язково)</label>
              <textarea 
                name="authorNote" 
                value={formData.authorNote} 
                onChange={handleInputChange} 
                placeholder="Додайте слова від себе перед початком історії..."
                style={{ minHeight: '100px' }}
              ></textarea>
            </div>
          </div>

          {/* Section 3: Genres Selection */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <FiTag />
              <span>Жанри та мітки *</span>
            </h3>
            <div className={styles.checkboxGrid}>
              {availableGenres.map(genre => (
                <label key={genre} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.genres.includes(genre)}
                    onChange={() => handleGenreToggle(genre)}
                  />
                  <span>{genre}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => navigate(-1)}
              disabled={isLoading}
            >
              Скасувати
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
            >
              <FiPlus />
              <span>{isLoading ? 'Створюємо...' : 'Опублікувати шапку'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFanfic;
