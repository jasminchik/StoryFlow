import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Header from '../components/Header';
import ProfileSidebar from '../components/ProfileSidebar';
import ProfileSettingsModal from '../components/ProfileSettingsModal';
import styles from './Profile.module.scss';

const Profile = () => {
  const { username: urlUsername } = useParams();
  const [user, setUser] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const [profileTab, setProfileTab] = useState('titles');

  const PROFILE_TABS = [
    { id: 'titles', label: 'Тайтли' },
    { id: 'comments', label: 'Коментарі' },
    { id: 'reviews', label: 'Відгуки' },
    { id: 'friends', label: 'Друзі' },
    { id: 'history', label: 'Історія' }
  ];

  const MOCK_COMMENTS = [
    { id: 1, title: 'Наруто', text: 'Крутий поворот сюжету, чекаю продовження!', date: '2 дні тому' },
    { id: 2, title: 'Блю Лок', text: 'Ісагі просто неймовірний у цьому розділі!', date: 'Тиждень тому' }
  ];

  const MOCK_REVIEWS = [
    { id: 1, title: 'Бліч', rating: 9, text: 'Дуже цікаво, але філлерів багато. Загалом манґа топ, особливо остання арка.', date: 'Тиждень тому' },
    { id: 2, title: 'Ван Піс', rating: 10, text: 'Легендарна історія, яка ніколи не набридне.', date: 'Місяць тому' }
  ];

  const MOCK_HISTORY = [
    { id: 1, title: 'Бліч', details: 'Том 1, Розділ 5, стор. 12', time: '3 години тому' },
    { id: 2, title: 'Блю Лок', details: 'Том 3, Розділ 24, стор. 1', time: 'Вчора' },
    { id: 3, title: 'Магічна Битва', details: 'Том 10, Розділ 89, стор. 15', time: '2 дні тому' }
  ];

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

  const renderProfileTabContent = () => {
    switch(profileTab) {
      case 'titles':
        return (
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
        );
      case 'comments':
        return (
          <div className={styles.listContainer}>
            {MOCK_COMMENTS.map(comment => (
              <div key={comment.id} className={styles.listItem}>
                <div className={styles.listHeader}>
                  <span className={styles.listTitle}>{comment.title}</span>
                  <span className={styles.listDate}>{comment.date}</span>
                </div>
                <p className={styles.listText}>"{comment.text}"</p>
              </div>
            ))}
          </div>
        );
      case 'reviews':
        return (
          <div className={styles.listContainer}>
            {MOCK_REVIEWS.map(review => (
              <div key={review.id} className={styles.listItem}>
                <div className={styles.listHeader}>
                  <span className={styles.listTitle}>{review.title}</span>
                  <span className={styles.reviewRating}>⭐ {review.rating}/10</span>
                </div>
                <p className={styles.listText}>{review.text}</p>
                <span className={styles.listDate}>{review.date}</span>
              </div>
            ))}
          </div>
        );
      case 'friends':
        return (
          <div className={styles.friendsGrid}>
            {MOCK_FRIENDS.map(friend => (
              <div key={friend.id} className={styles.friendCard}>
                <div className={styles.friendAvatarWrapper}>
                  {friend.avatar ? (
                    <img src={friend.avatar} alt={friend.name} className={styles.friendAvatarImg} />
                  ) : (
                    <div className={styles.friendAvatarPlaceholder}>{friend.name.charAt(0)}</div>
                  )}
                  {friend.isOnline ? (
                    <div className={styles.onlineIndicator}></div>
                  ) : (
                    <div className={styles.offlineIndicator}></div>
                  )}
                </div>
                <span className={styles.friendName}>{friend.name}</span>
              </div>
            ))}
          </div>
        );
      case 'history':
        return (
          <div className={styles.listContainer}>
            {MOCK_HISTORY.map(history => (
              <div key={history.id} className={styles.historyItem}>
                <span className={styles.historyTitle}>{history.title}</span>
                <span className={styles.historyDetails}>{history.details}</span>
                <span className={styles.historyTime}>• {history.time}</span>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

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

        {/* АНАЛІТИКА (ЗАВЖДИ ЗВЕРХУ) */}
        <section className={styles.analyticsSection}>
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

        {/* СИСТЕМА ВКЛАДОК */}
        <div className={styles.profileTabsMenu}>
          {PROFILE_TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`${styles.tabBtn} ${profileTab === tab.id ? styles.activeProfileTab : ''}`}
              onClick={() => setProfileTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.tabLayout}>
          <main className={styles.tabContentArea}>
            {renderProfileTabContent()}
          </main>
          
          <ProfileSidebar activeTab={profileTab} />
        </div>
      </div>

      <ProfileSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default Profile;
