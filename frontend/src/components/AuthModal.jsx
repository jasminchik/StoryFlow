import React, { useState, useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaTwitch } from 'react-icons/fa';
import styles from './AuthModal.module.scss';

const AuthModal = ({ isOpen, onClose }) => {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('reader'); // 'reader' | 'author'
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Parse URL params for errors from OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('auth_mode');
    const authError = params.get('auth_error');
    const registeredEmail = params.get('registered_email');

    if (mode) setAuthMode(mode);
    
    if (authError === 'no_account') {
      setError('Ваш акаунт ще не зареєстровано. Будь ласка, зареєструйтесь.');
    } else if (authError === 'email_registered') {
      setError('Ця пошта вже зареєстрована. Будь ласка, увійдіть.');
    } else if (authError === 'oauth_failed') {
      setError('Помилка авторизації через сторонній сервіс.');
    }

    if (registeredEmail) setEmail(registeredEmail);
  }, [isOpen]);

  if (!isOpen) return null;

  const API_BASE_URL = 'http://localhost:5000/api/auth';

  const handleGoogleSignIn = () => {
    window.location.href = `${API_BASE_URL}/google?intent=${authMode}`;
  };

  const handleTwitchSignIn = () => {
    window.location.href = `${API_BASE_URL}/twitch?intent=${authMode}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const endpoint = authMode === 'login' ? '/login' : '/register';
    const payload = authMode === 'login' 
      ? { email, password } 
      : { email, password, username, role: userRole };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Щось пішло не так');
      }

      // Зберігаємо токен та дані юзера
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      console.log(`${authMode === 'login' ? 'Вхід' : 'Реєстрація'} успішна!`, data);
      
      // Закриваємо модалку та переходимо на головну (очищуємо URL)
      onClose();
      window.location.href = '/';

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${authMode === 'login' ? styles.activeTab : ''}`}
            onClick={() => setAuthMode('login')}
          >
            Вхід
          </button>
          <button 
            className={`${styles.tab} ${authMode === 'register' ? styles.activeTab : ''}`}
            onClick={() => setAuthMode('register')}
          >
            Реєстрація
          </button>
        </div>

        <div className={styles.content}>
          <form className={styles.form} onSubmit={handleSubmit}>
            {error && <div className={styles.errorMessage}>{error}</div>}
            
            {authMode === 'register' && (
              <>
                <div className={styles.roleLabel}>Хто ви?</div>
                <div className={styles.roleSelector}>
                  <button 
                    type="button"
                    className={`${styles.roleOption} ${userRole === 'reader' ? styles.activeRole : ''}`}
                    onClick={() => setUserRole('reader')}
                  >
                    Читач
                  </button>
                  <button 
                    type="button"
                    className={`${styles.roleOption} ${userRole === 'author' ? styles.activeRole : ''}`}
                    onClick={() => setUserRole('author')}
                  >
                    Автор
                  </button>
                </div>

                <div className={styles.formGroup}>
                  <input 
                    type="text" 
                    placeholder="Нікнейм" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <div className={styles.formGroup}>
              <input 
                type="email" 
                placeholder="Електронна пошта" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <input 
                type="password" 
                placeholder="Пароль" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? 'Завантаження...' : (authMode === 'login' ? 'Увійти' : 'Зареєструватися')}
            </button>
          </form>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <div className={styles.oauthSection}>
            <button className={styles.oauthBtn} onClick={handleGoogleSignIn}>
              <FcGoogle className={styles.icon} /> 
              <span>Continue with Google</span>
            </button>
            <button className={styles.oauthBtn} onClick={handleTwitchSignIn}>
              <FaTwitch className={styles.icon} style={{ color: '#9146FF' }} /> 
              <span>Continue with Twitch</span>
            </button>
          </div>

          <div className={styles.footer}>
            {authMode === 'login' ? (
              <p>
                Немає акаунту? {' '}
                <span className={styles.link} onClick={() => setAuthMode('register')}>
                  Зареєструйтеся
                </span>
              </p>
            ) : (
              <p>
                Вже є акаунт? {' '}
                <span className={styles.link} onClick={() => setAuthMode('login')}>
                  Увійдіть
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
