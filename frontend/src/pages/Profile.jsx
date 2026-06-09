import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import styles from './Profile.module.scss';

const Profile = () => {
  const { username: urlUsername } = useParams();
  const [user, setUser] = useState(null);

  const STATS = [
    { label: 'Тайтли', value: 12, icon: '📚' },
    { label: 'Коментарі', value: 114, icon: '💬' },
    { label: 'Оцінки', value: 25, icon: '⭐' },
    { label: 'Прочитано', value: 301, icon: '📖' }
  ];

  const MOCK_FRIENDS = [
    { id: 1, name: 'Alex_Manga', status: 'В мережі', isOnline: true },
    { id: 2, name: 'Sora_Reader', status: 'Офлайн', isOnline: false },
    { id: 3, name: 'DarthVader', status: 'В мережі', isOnline: true },
    { id: 4, name: 'NekoGirl', status: 'Офлайн', isOnline: false },
    { id: 5, name: 'Zoro_Fan', status: 'В мережі', isOnline: true },
    { id: 6, name: 'Luffy_Pirate', status: 'Офлайн', isOnline: false }
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (token && storedUser) {
      if (urlUsername === storedUser.username || !urlUsername) {
        setUser(storedUser);
      } else {
        setUser({
          username: urlUsername,
          role: 'Користувач',
          avatar: null
        });
      }
    } else {
      setUser({
        username: urlUsername || 'Гість',
        role: 'Гість',
        avatar: null
      });
    }
  }, [urlUsername]);

  if (!user) return <div className={styles.profileWrapper}><Header /></div>;

  return (
    <div className={styles.profileWrapper}>
      <Header />
      
      <div className={styles.container}>
        {/* Unified Header Section */}
        <section className={styles.headerSection}>
          <div className={styles.banner}>
            <div className={styles.bannerImage} />
          </div>
          
          <div className={styles.userInfoBar}>
            <div className={styles.avatarWrapper}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className={styles.avatarImage} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className={styles.userDetails}>
              <h1 className={styles.nickname}>{user.username}</h1>
              
              <div className={styles.statsPanel}>
                {STATS.map((stat, index) => (
                  <div key={index} className={styles.statItem}>
                    <span>{stat.icon}</span>
                    <span className={styles.statLabel}>{stat.label}</span>
                    <span className={styles.statValue}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <main className={styles.mainContent}>
          {/* Left Column */}
          <section className={styles.contentBlock}>
            <h2 className={styles.blockTitle}>Активність та Список читання</h2>
            <div className={styles.placeholderContent}>
              <div style={{ fontSize: '40px' }}>📑</div>
              <p>Тут будуть відображатися останні прочитані розділи та оновлення у списках користувача.</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ваша активність поки що не записана.</p>
            </div>
          </section>

          {/* Right Column: Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.contentBlock}>
              <h2 className={styles.blockTitle}>Друзі</h2>
              <div className={styles.friendsList}>
                {MOCK_FRIENDS.map(friend => (
                  <div key={friend.id} className={styles.friendItem}>
                    <div className={`${styles.friendAvatar} ${friend.isOnline ? styles.online : ''}`}>
                      {friend.name.charAt(0)}
                    </div>
                    <div className={styles.friendInfo}>
                      <span className={styles.friendName}>{friend.name}</span>
                      <span className={styles.friendStatus}>{friend.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default Profile;
