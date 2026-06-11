import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import ProfileSettingsModal from '../components/ProfileSettingsModal';
import styles from './Profile.module.scss';

const Profile = () => {
  const { username: urlUsername } = useParams();
  const [user, setUser] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);

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

  const loadProfileData = useCallback(() => {
    const storedData = JSON.parse(localStorage.getItem('user_profile_data') || 'null');
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (storedUser && (urlUsername === storedUser.username || !urlUsername)) {
      setProfileData(storedData);
    } else {
      setProfileData(null);
    }
  }, [urlUsername]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (token && storedUser) {
      if (urlUsername === storedUser.username || !urlUsername) {
        setUser(storedUser);
        loadProfileData();
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

    window.addEventListener('profileUpdate', loadProfileData);
    return () => window.removeEventListener('profileUpdate', loadProfileData);
  }, [urlUsername, loadProfileData]);

  if (!user) return <div className={styles.profileWrapper}><Header /></div>;

  const isOwnProfile = user.username && (JSON.parse(localStorage.getItem('user'))?.username === user.username);
  const displayName = profileData?.nickname || user.username;
  const displayAvatar = profileData?.avatar || user.avatar;
  const displayBanner = profileData?.banner;

  return (
    <div className={styles.profileWrapper}>
      <Header />
      
      <div className={styles.container}>
        <section className={styles.headerSection}>
          <div className={styles.banner}>
            <div 
              className={styles.bannerImage} 
              style={{ backgroundImage: displayBanner ? `url(${displayBanner})` : 'none' }}
            />
            {isOwnProfile && (
              <button 
                className={styles.settingsBtn}
                onClick={() => setIsSettingsOpen(true)}
                title="Налаштування"
              >
                ⚙️
              </button>
            )}
          </div>
          
          <div className={styles.userInfoBar}>
            <div className={styles.avatarWrapper}>
              {displayAvatar ? (
                <img src={displayAvatar} alt={displayName} className={styles.avatarImage} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className={styles.userDetails}>
              <div className={styles.nameRow}>
                <h1 className={styles.nickname}>{displayName}</h1>
                {profileData?.gender && profileData.gender !== 'secret' && (
                  <span className={styles.genderBadge} title={profileData.gender === 'male' ? 'Чоловік' : 'Жінка'}>
                    {profileData.gender === 'male' ? '♂️' : '♀️'}
                  </span>
                )}
              </div>
              
              {profileData?.aboutMe && (
                <p className={styles.aboutText}>{profileData.aboutMe}</p>
              )}
              
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

        <main className={styles.mainContent}>
          <section className={styles.contentBlock}>
            <h2 className={styles.blockTitle}>Активність та Список читання</h2>
            <div className={styles.placeholderContent}>
              <div style={{ fontSize: '40px' }}>📑</div>
              <p>Тут будуть відображатися останні прочитані розділи та оновлення у списках користувача.</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ваша активність поки що не записана.</p>
            </div>
          </section>

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

      <ProfileSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default Profile;
