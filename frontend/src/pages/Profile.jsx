import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  FiBook, 
  FiMessageSquare, 
  FiStar, 
  FiBookOpen, 
  FiSettings, 
  FiUser, 
  FiChevronRight,
  FiCheckCircle,
  FiEdit3
} from 'react-icons/fi';
import { FaMars, FaVenus } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Header from '../components/Header';
import ProfileSidebar from '../components/ProfileSidebar';
import ProfileSettingsModal from '../components/ProfileSettingsModal';
import styles from './Profile.module.scss';

const Profile = () => {
  const { username: urlUsername } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const [profileTab, setProfileTab] = useState(searchParams.get('tab') || 'titles');
  const analyticsRef = useRef(null);
  const tabsRef = useRef(null);

  useEffect(() => {
    const tab = searchParams.get('tab');
    
    if (tab === 'settings') {
      setIsSettingsOpen(true);
      return;
    }

    setIsSettingsOpen(false);
    
    if (tab) {
      setProfileTab(tab);
    }

    // Плавно скролимо до контенту при зміні таба
    // Використовуємо таймаут, щоб React встиг зарендерити нову вкладку
    const timer = setTimeout(() => {
      if (tab === 'stats') {
        analyticsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (tab) {
        tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    if (tabId === 'settings') {
      setSearchParams({ tab: 'settings' });
    } else {
      setProfileTab(tabId);
      setSearchParams({ tab: tabId });
    }
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('tab');
    setSearchParams(newParams);
  };

  const handleSaveSuccess = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const [myTitles, setMyTitles] = useState([]);
  const [isMyTitlesLoading, setIsMyTitlesLoading] = useState(false);

  useEffect(() => {
    if (profileTab === 'my-creations' && user?.role === 'author') {
      const fetchMyTitles = async () => {
        setIsMyTitlesLoading(true);
        try {
          const response = await fetch('http://localhost:5000/api/manga/my-titles', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const data = await response.json();
          if (data.success) {
            setMyTitles(data.data);
          }
        } catch (err) {
          console.error('Помилка завантаження моїх творів:', err);
        } finally {
          setIsMyTitlesLoading(false);
        }
      };
      fetchMyTitles();
    }
  }, [profileTab, user]);

  const PROFILE_TABS = [
    { id: 'titles', label: 'Тайтли' },
    ...(user?.role === 'author' ? [{ id: 'my-creations', label: 'Мої твори' }] : []),
    { id: 'comments', label: 'Коментарі' },
    { id: 'reviews', label: 'Відгуки' },
    { id: 'friends', label: 'Друзі' },
    { id: 'history', label: 'Історія' }
  ];

  const MOCK_FRIENDS = [
    { id: 1, name: 'Alex_Manga', status: 'В мережі', isOnline: true },
    { id: 2, name: 'Sora_Reader', status: 'Офлайн', isOnline: false },
    { id: 3, name: 'DarthVader', status: 'В мережі', isOnline: true },
    { id: 4, name: 'NekoGirl', status: 'Офлайн', isOnline: false },
    { id: 5, name: 'Zoro_Fan', status: 'В мережі', isOnline: true },
    { id: 6, name: 'Luffy_Pirate', status: 'Офлайн', isOnline: false }
  ];

  const readingNowData = [];

  const activityStats = [
    { date: '05.06', count: 0 },
    { date: '06.06', count: 0 },
    { date: '07.06', count: 0 },
    { date: '08.06', count: 0 },
    { date: '09.06', count: 0 },
    { date: '10.06', count: 0 },
    { date: '11.06', count: 0 }
  ];

  const totalStats = { 
    mangaChapters: 0, 
    fanficChapters: 0, 
    totalTime: '0 годин' 
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/profile/${urlUsername}`);
        const data = await response.json();
        
        if (data.success) {
          setUser(data.data);
        } else {
          setUser({
            username: urlUsername,
            role: 'Гість',
            avatar: null,
            error: true
          });
        }
      } catch (err) {
        console.error('Помилка завантаження профілю:', err);
      }
    };

    if (urlUsername) {
      fetchUserData();
    }

    // Слухаємо оновлення, щоб оновити дані профілю, якщо це власний профіль
    const handleProfileUpdate = () => {
      const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');
      if (loggedInUser && (loggedInUser.username === urlUsername || loggedInUser.id === user?._id || loggedInUser._id === user?._id)) {
        setUser(prev => ({ ...prev, ...loggedInUser }));
      }
    };

    window.addEventListener('profileUpdate', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdate', handleProfileUpdate);
  }, [urlUsername]);

  if (!user) return <div className={styles.profileWrapper}><Header /><div className={styles.loading}>Завантаження...</div></div>;

  const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');
  const isOwnProfile = user.username && (loggedInUser?.username === user.username);
  
  const displayName = user.username;
  const displayAvatar = user.avatar;
  const displayBanner = user.banner;

  const STATS_DYNAMIC = [
    { label: 'Тайтли', value: user.stats?.titles || 0, icon: <FiBook size={18} /> },
    { label: 'Коментарі', value: user.stats?.comments || 0, icon: <FiMessageSquare size={18} /> },
    { label: 'Оцінки', value: user.stats?.ratings || 0, icon: <FiStar size={18} /> },
    { label: 'Прочитано', value: user.stats?.readCount || 0, icon: <FiBookOpen size={18} /> }
  ];

  const API_BASE = 'http://localhost:5000';

  const renderProfileTabContent = () => {
    switch(profileTab) {
      case 'my-creations':
        return (
          <div className={styles.myTitlesGrid}>
            {isMyTitlesLoading ? (
              <div className={styles.loading}>Завантаження ваших творів...</div>
            ) : myTitles.length > 0 ? (
              myTitles.map(manga => (
                <div 
                  key={manga._id} 
                  className={styles.mangaCard}
                >
                  <div className={styles.imageWrapper} onClick={() => navigate(`/manga/${manga._id}`)}>
                    <img src={`${API_BASE}${manga.coverImage}`} alt={manga.title} />
                    <div className={styles.statusBadge}>
                      {manga.moderationStatus === 'pending' ? 'На модерації' : 
                       manga.moderationStatus === 'approved' ? 'Схвалено' : 'Відхилено'}
                    </div>
                  </div>
                  <h3 className={styles.cardTitle} onClick={() => navigate(`/manga/${manga._id}`)}>{manga.title}</h3>
                  <div className={styles.cardMeta}>
                    <span>{manga.type}</span>
                    <span>•</span>
                    <span>{manga.releaseYear}</span>
                  </div>
                  {isOwnProfile && (
                    <button 
                      className={styles.editCreationBtn}
                      onClick={() => navigate(`/edit-manga/${manga._id}`)}
                    >
                      Редагувати
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>У вас ще немає створених творів.</p>
                <button onClick={() => navigate('/create-manga')} className={styles.createBtn}>
                  Створити перший тайтл
                </button>
              </div>
            )}
          </div>
        );
      case 'titles':
        return (
          <div className={styles.progressGrid}>
            {readingNowData.length > 0 ? (
              readingNowData.map(item => (
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
              ))
            ) : (
              <div className={styles.emptyState}>Список порожній.</div>
            )}
          </div>
        );
      case 'comments':
        return (
          <div className={styles.listContainer}>
            <div className={styles.emptyState}>Коментарів ще немає.</div>
          </div>
        );
      case 'reviews':
        return (
          <div className={styles.listContainer}>
            <div className={styles.emptyState}>Відгуків ще немає.</div>
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
            <div className={styles.emptyState}>Історія порожня.</div>
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
              style={{ backgroundImage: displayBanner ? `url("${displayBanner}")` : 'none' }}
            />
            {isOwnProfile && (
              <button 
                className={styles.settingsBtn}
                onClick={() => handleTabChange('settings')}
                title="Налаштування"
              >
                <FiSettings size={20} />
              </button>
            )}
          </div>
          
          <div className={styles.userInfoBar}>
            <div className={styles.avatarWrapper}>
              {displayAvatar ? (
                <img src={displayAvatar} alt={displayName} className={styles.avatarImage} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <FiUser size={40} />
                </div>
              )}
            </div>
            
            <div className={styles.userDetails}>
              <div className={styles.nameRow}>
                <h1 className={styles.nickname}>{displayName}</h1>
                {user.role === 'author' && (
                  <div className={styles.authorBadge}>
                    <FiEdit3 size={12} className={styles.authorIcon} />
                    <span>Автор</span>
                  </div>
                )}
                {user.gender && user.gender !== 'secret' && (
                  <span 
                    className={`${styles.genderBadge} ${user.gender === 'male' ? styles.male : styles.female}`} 
                    title={user.gender === 'male' ? 'Чоловік' : 'Жінка'}
                  >
                    {user.gender === 'male' ? <FaMars size={14} /> : <FaVenus size={14} />}
                  </span>
                )}
              </div>
              
              {user.aboutMe && (
                <p className={styles.aboutText}>{user.aboutMe}</p>
              )}
              
              <div className={styles.statsPanel}>
                {STATS_DYNAMIC.map((stat, index) => (
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
        <section className={styles.analyticsSection} ref={analyticsRef}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Прочитано розділів манґи</span>
              <span className={styles.statNumber}>{totalStats.mangaChapters}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Прочитано Література/Фанфік</span>
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
        <div className={styles.profileTabsMenu} ref={tabsRef}>
          {PROFILE_TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`${styles.tabBtn} ${profileTab === tab.id ? styles.activeProfileTab : ''}`}
              onClick={() => handleTabChange(tab.id)}
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
        onClose={handleCloseSettings} 
        user={user}
        onSaveSuccess={handleSaveSuccess}
      />

      {/* УСПІШНЕ ПОВІДОМЛЕННЯ (TOAST) */}
      <div className={`${styles.toast} ${showToast ? styles.show : ''}`}>
        <FiCheckCircle className={styles.toastIcon} />
        <span>Зміни збережено!</span>
      </div>
    </div>
  );
};

export default Profile;
