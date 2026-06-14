import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Зберігаємо токен у localStorage
      localStorage.setItem('token', token);
      
      // Запитуємо дані користувача з бекенду
      fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem('user', JSON.stringify(data.user));
          // Редіректимо на головну
          window.location.href = '/';
        } else {
          window.location.href = '/?auth_error=true';
        }
      })
      .catch(() => {
        window.location.href = '/?auth_error=true';
      });
    } else {
      // Якщо токена немає, повертаємо на логін з помилкою
      window.location.href = '/?auth_error=true';
    }
  }, [searchParams]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#121212',
      color: '#fff',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div className="loader"></div> {/* Можна додати стилізований лоадер */}
      <h2>Авторизація успішна...</h2>
      <p>Зачекайте, ми перенаправляємо вас на головну сторінку.</p>
    </div>
  );
};

export default AuthSuccess;
