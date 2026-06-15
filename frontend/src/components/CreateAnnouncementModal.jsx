import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiImage, FiAlertCircle } from 'react-icons/fi';
import styles from './CreateAnnouncementModal.module.scss';

const CreateAnnouncementModal = ({ isOpen, onClose, onSaveSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [myTitles, setMyTitles] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    manga: '',
    category: 'manga_update'
  });

  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    if (isOpen) {
      fetchMyTitles();
    }
  }, [isOpen]);

  const fetchMyTitles = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/manga/my-titles`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setMyTitles(data.data);
        if (data.data.length > 0 && !formData.manga) {
          setFormData(prev => ({ ...prev, manga: data.data[0]._id }));
        }
      }
    } catch (err) {
      console.error('Помилка завантаження тайтлів:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Помилка при створенні новини');
      }

      setFormData({
        title: '',
        content: '',
        manga: myTitles.length > 0 ? myTitles[0]._id : '',
        category: 'manga_update'
      });
      
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedManga = myTitles.find(m => m._id === formData.manga);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Додати новину тайтлу</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Закрити">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.errorMessage}>
              <FiAlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className={styles.layout}>
            <div className={styles.leftCol}>
              <div className={styles.mangaSelect}>
                <label>Оберіть тайтл *</label>
                <select 
                  name="manga" 
                  value={formData.manga} 
                  onChange={handleInputChange}
                  required
                >
                  {myTitles.length === 0 && <option value="">У вас немає тайтлів</option>}
                  {myTitles.map(manga => (
                    <option key={manga._id} value={manga._id}>{manga.title}</option>
                  ))}
                </select>
              </div>

              <div className={styles.previewCard}>
                {selectedManga ? (
                  <>
                    <img 
                      src={`${API_BASE}${selectedManga.coverImage}`} 
                      alt={selectedManga.title} 
                      className={styles.previewImage}
                    />
                    <div className={styles.previewInfo}>
                      <span className={styles.previewType}>{selectedManga.type}</span>
                      <h4 className={styles.previewTitle}>{selectedManga.title}</h4>
                    </div>
                  </>
                ) : (
                  <div className={styles.placeholder}>
                    <FiImage size={40} />
                    <span>Тайтл не обрано</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.rightCol}>
              <div className={styles.formGroup}>
                <label>Заголовок новини *</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange} 
                  placeholder="Наприклад: Вийшов новий розділ!"
                  required 
                  maxLength={100}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Зміст новини *</label>
                <textarea 
                  name="content" 
                  value={formData.content} 
                  onChange={handleInputChange} 
                  placeholder="Розкажіть детальніше про оновлення..."
                  rows="8"
                  required 
                ></textarea>
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <button 
              type="button" 
              className={styles.cancelBtn} 
              onClick={onClose}
              disabled={isLoading}
            >
              Скасувати
            </button>
            <button 
              type="submit" 
              className={styles.submitBtn} 
              disabled={isLoading || myTitles.length === 0}
            >
              {isLoading ? 'Публікація...' : (
                <>
                  <FiCheck />
                  <span>Опублікувати</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAnnouncementModal;
