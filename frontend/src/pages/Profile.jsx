import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
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

  const readingNowData = [
    { id: 1, title: 'Блю Лок', cover: '/uploads/blue_lock.jpg', currentChapter: 42, totalChapters: 250 },
    { id: 2, title: 'Ван Піс', cover: '/uploads/one_piece.jpg', currentChapter: 1050, totalChapters: 1110 }
  ];

  const activityStats = [
    { date: '05.06', count: 0 },
    { date: '06.06', count: 2 },
    { date: '07.06', count: 5 },
    { date: '08.06', count: 1 },
    { date: '09.06', count: 12 },
    { date: '10.06', count: 8 },
    { date: '11.06', count: 15 }
  ];

  const totalStats = { 
    mangaChapters: 142, 
    fanficChapters: 12, 
    totalTime: '48 годин' 
  };

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
          <div className={styles.leftColumn}>
            <section className={styles.contentBlock}>
              <h2 className={styles.blockTitle}>Читаю зараз</h2>
              <div className={styles.progressGrid}>
                {readingNowData.map(item => (
                  <div key={item.id} className={styles.progressCard}>
                    <img src={item.cover} alt={item.title} className={styles.cardCover} />
                    <div className={styles.cardInfo}>
                      <h3 className={styles.cardTitle}>{item.title}</h3>
                      <div className={styles.progressTrack}>
                        <div 
                          className={styles.progressFill} 
                          style={{ width: `${(item.currentChapter / item.totalChapters) * 100}%` }}
                        />
                      </div>
                      <span className={styles.progressText}>
                        Прочитано {item.currentChapter} / {item.totalChapters} розділів
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.contentBlock}>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Прочитано розділів манґи</span>
                  <span className={styles.statNumber}>{totalStats.mangaChapters}</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Прочитано фанфіків</span>
                  <span className={styles.statNumber}>{totalStats.fanficChapters}</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Час за читанням</span>
                  <span className={styles.statNumber}>{totalStats.totalTime}</span>
                </div>
              </div>

              <div className={styles.chartContainer}>
                <h3 className={styles.chartTitle}>АКТИВНІСТЬ ЗА 7 ДНІВ</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={activityStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" stroke="#555" tick={{ fill: '#888', fontSize: 12 }} />
                    <YAxis stroke="#555" tick={{ fill: '#888', fontSize: 12 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333', color: '#fff', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="count" stroke="#ff8c00" strokeWidth={2} dot={{ r: 4, fill: '#ff8c00', stroke: '#121212', strokeWidth: 2 }} activeDot={{ r: 6 }} name="Прочитано розділів" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

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
