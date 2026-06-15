import React, { useState, useEffect, useCallback } from 'react';
import { FiSend, FiMessageSquare, FiTrash2, FiUser, FiStar, FiHash } from 'react-icons/fi';
import styles from './CommentSection.module.scss'; // Перевикористовуємо стилі для консистентності

const InteractionSection = ({ targetId, resourceType, type }) => {
  const [items, setItems] = useState([]);
  const [newContent, setNewContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE = 'http://localhost:5000';
  const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');

  const fetchInteractions = useCallback(async () => {
    setIsLoading(true);
    try {
      // Додаємо фільтр по типу (comment/review/discussion)
      const response = await fetch(`${API_BASE}/api/comments/${targetId}?type=${type}`);
      const data = await response.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (err) {
      console.error('Помилка завантаження даних:', err);
    } finally {
      setIsLoading(false);
    }
  }, [targetId, type]);

  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newContent.trim() || !loggedInUser) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: newContent,
          resourceId: targetId,
          resourceType,
          interactionType: type
        })
      });

      const data = await response.json();
      if (data.success) {
        setItems([data.data, ...items]);
        setNewContent('');
      }
    } catch (err) {
      console.error('Помилка відправки:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей запис?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/comments/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setItems(items.filter(i => i._id !== itemId));
      }
    } catch (err) {
      console.error('Помилка видалення:', err);
    }
  };

  const getHeaderInfo = () => {
    switch (type) {
      case 'review':
        return { icon: <FiStar size={20} />, label: 'Відгуки' };
      case 'discussion':
        return { icon: <FiHash size={20} />, label: 'Обговорення' };
      default:
        return { icon: <FiMessageSquare size={20} />, label: 'Коментарі' };
    }
  };

  const { icon, label } = getHeaderInfo();

  return (
    <div className={styles.commentSection}>
      <div className={styles.header}>
        {icon}
        <h3>{label} ({items.length})</h3>
      </div>

      {loggedInUser ? (
        <form onSubmit={handleSubmit} className={styles.commentForm}>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder={
              type === 'review' ? "Поділіться вашим детальним відгуком..." : 
              type === 'discussion' ? "Почніть нову тему для обговорення..." : 
              "Напишіть вашу думку..."
            }
            rows="4"
            required
          />
          <button type="submit" disabled={isSubmitting || !newContent.trim()}>
            {isSubmitting ? '...' : <><FiSend /> <span>Відправити</span></>}
          </button>
        </form>
      ) : (
        <div className={styles.loginPrompt}>
          Будь ласка, увійдіть у систему, щоб залишити {type === 'review' ? 'відгук' : 'повідомлення'}.
        </div>
      )}

      <div className={styles.commentsList}>
        {isLoading ? (
          <div className={styles.loading}>Завантаження...</div>
        ) : items.length > 0 ? (
          items.map((item) => (
            <div key={item._id} className={styles.commentItem}>
              <div className={styles.avatarWrapper}>
                {item.author?.avatar ? (
                  <img src={item.author.avatar} alt={item.author.username} />
                ) : (
                  <div className={styles.placeholder}><FiUser /></div>
                )}
              </div>
              <div className={styles.contentWrapper}>
                <div className={styles.commentHeader}>
                  <span className={styles.username}>{item.author?.username || 'Невідомий'}</span>
                  <span className={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</span>
                  {(loggedInUser && (item.author?._id === (loggedInUser.id || loggedInUser._id) || loggedInUser.role === 'admin')) && (
                    <button className={styles.deleteBtn} onClick={() => handleDelete(item._id)}>
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
                <p className={styles.text}>{item.content}</p>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.empty}>Тут поки що порожньо. Будьте першим!</div>
        )}
      </div>
    </div>
  );
};

export default InteractionSection;
