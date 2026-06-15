import React, { useState, useEffect } from 'react';
import { FiSend, FiMessageSquare, FiTrash2, FiUser } from 'react-icons/fi';
import styles from './CommentSection.module.scss';

const CommentSection = ({ resourceId, resourceType }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE = 'http://localhost:5000';
  const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    fetchComments();
  }, [resourceId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/comments/${resourceId}`);
      const data = await response.json();
      if (data.success) {
        setComments(data.data);
      }
    } catch (err) {
      console.error('Помилка завантаження коментарів:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !loggedInUser) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: newComment,
          resourceId,
          resourceType
        })
      });

      const data = await response.json();
      if (data.success) {
        setComments([data.data, ...comments]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Помилка відправки коментаря:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей коментар?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setComments(comments.filter(c => c._id !== commentId));
      }
    } catch (err) {
      console.error('Помилка видалення:', err);
    }
  };

  return (
    <div className={styles.commentSection}>
      <div className={styles.header}>
        <FiMessageSquare size={20} />
        <h3>Коментарі ({comments.length})</h3>
      </div>

      {loggedInUser ? (
        <form onSubmit={handleSubmit} className={styles.commentForm}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Напишіть вашу думку про цей твір..."
            rows="3"
            required
          />
          <button type="submit" disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? '...' : <><FiSend /> <span>Відправити</span></>}
          </button>
        </form>
      ) : (
        <div className={styles.loginPrompt}>
          Будь ласка, увійдіть, щоб залишати коментарі.
        </div>
      )}

      <div className={styles.commentsList}>
        {isLoading ? (
          <div className={styles.loading}>Завантаження коментарів...</div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className={styles.commentItem}>
              <div className={styles.avatarWrapper}>
                {comment.author?.avatar ? (
                  <img src={comment.author.avatar} alt={comment.author.username} />
                ) : (
                  <div className={styles.placeholder}><FiUser /></div>
                )}
              </div>
              <div className={styles.contentWrapper}>
                <div className={styles.commentHeader}>
                  <span className={styles.username}>{comment.author?.username || 'Невідомий'}</span>
                  <span className={styles.date}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                  {(loggedInUser && (comment.author?._id === (loggedInUser.id || loggedInUser._id) || loggedInUser.role === 'admin')) && (
                    <button className={styles.deleteBtn} onClick={() => handleDelete(comment._id)}>
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
                <p className={styles.text}>{comment.content}</p>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.empty}>Коментарів поки що немає. Будьте першим!</div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
