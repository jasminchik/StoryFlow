import React, { useState } from 'react';
import styles from './AuthModal.module.scss';

const AuthModal = ({ isOpen, onClose, defaultMessage, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('user'); // 'user' or 'author'
  const [nickname, setNickname] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Імітація успішної авторизації/реєстрації
    const userData = {
      username: !isLogin && nickname ? nickname : 'jecamen_905',
      role: isLogin ? 'Читач' : (role === 'author' ? 'Автор' : 'Читач'),
      experience: 34
    };
    
    // Зберігаємо сесію у localStorage
    localStorage.setItem('token', 'fake-jwt-token-storyflow');
    localStorage.setItem('user', JSON.stringify(userData));
    
    onSuccess(userData);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        
        {/* Повідомлення, якщо юзер клікнув на Закладки без авторизації */}
        {defaultMessage && isLogin && (
          <p className={styles.alertMsg}>{defaultMessage}</p>
        )}

        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${isLogin ? styles.active : ''}`} 
            onClick={() => setIsLogin(true)}
          >
            Вхід
          </button>
          <button 
            className={`${styles.tab} ${!isLogin ? styles.active : ''}`} 
            onClick={() => setIsLogin(false)}
          >
            Реєстрація
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {!isLogin && (
            <div className={styles.roleSelection}>
              <button 
                type="button" 
                className={`${styles.roleBtn} ${role === 'user' ? styles.activeRole : ''}`}
                onClick={() => setRole('user')}
              >
                👤 Читач
              </button>
              <button 
                type="button" 
                className={`${styles.roleBtn} ${role === 'author' ? styles.activeRole : ''}`}
                onClick={() => setRole('author')}
              >
                ✍️ Автор
              </button>
            </div>
          )}

          {!isLogin && (
            <input 
              type="text" 
              placeholder="Нікнейм" 
              className={styles.input} 
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              required 
            />
          )}
          <input type="email" placeholder="Email" className={styles.input} required />
          <input type="password" placeholder="Пароль" className={styles.input} required />

          <button type="submit" className={styles.submitBtn}>
            {isLogin ? 'Увійти' : 'Зареєструватися'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
