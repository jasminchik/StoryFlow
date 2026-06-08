import React from 'react';
import Header from '../components/Header';
import styles from './Profile.module.scss';

const Profile = () => {
  // Тут в майбутньому ми будемо брати дані юзера з глобального стейту (Context/Redux)
  // Поки що використовуємо мок-дані для верстки
  const MOCK_USER = {
    username: 'jecamen_905',
    role: 'Читач',
    experience: 34,
    joinDate: 'Жовтень 2023',
    avatar: ''
  };

  return (
    <div className={styles.profileWrapper}>
      <Header />
      
      <main className={styles.container}>
        <section className={styles.profileCard}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              {MOCK_USER.avatar ? (
                <img src={MOCK_USER.avatar} alt="Avatar" />
              ) : (
                <span className={styles.avatarPlaceholder}>
                  {MOCK_USER.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            <div className={styles.userInfo}>
              <h1 className={styles.username}>{MOCK_USER.username}</h1>
              <div className={styles.badges}>
                <span className={styles.roleBadge}>{MOCK_USER.role}</span>
                <span className={styles.expBadge}>⭐ {MOCK_USER.experience} досвіду</span>
              </div>
              <p className={styles.joinDate}>На сайті з: {MOCK_USER.joinDate}</p>
            </div>
          </div>
          
          <button className={styles.editBtn}>Редагувати профіль</button>
        </section>

        {/* Заглушки під майбутній контент */}
        <div className={styles.contentGrid}>
          <section className={styles.contentSection}>
            <h2 className={styles.sectionTitle}>Останні дії</h2>
            <div className={styles.placeholderCard}>
              <p>Тут буде історія переглядів та коментарі користувача.</p>
            </div>
          </section>

          <section className={styles.contentSection}>
            <h2 className={styles.sectionTitle}>Закладки</h2>
            <div className={styles.placeholderCard}>
              <p>Тут буде відображатися список доданих у закладки тайтлів.</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;
