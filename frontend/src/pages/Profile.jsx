import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  FiEdit3,
  FiPlus,
  FiHeart,
  FiShield
} from 'react-icons/fi';
import { FaMars, FaVenus } from 'react-icons/fa';
import { LuShieldCheck } from 'react-icons/lu';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Header from '../components/Header';
import ProfileSidebar from '../components/ProfileSidebar';
import ProfileSettingsModal from '../components/ProfileSettingsModal';
import CreateAnnouncementModal from '../components/CreateAnnouncementModal';
import styles from './Profile.module.scss';

const Profile = () => {
  const { username: urlUsername } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Зміни збережено!');
  
  const [myWorks, setMyWorks] = useState({ manga: [], literature: [] });
  const [isMyWorksLoading, setIsMyWorksLoading] = useState(false);

  const [userTitles, setUserTitles] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isTitlesLoading, setIsTitlesLoading] = useState(false);

  // States для коментарів та відгуків
  const [userComments, setUserComments] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [userHistory, setUserHistory] = useState([]);
  const [isActivityLoading, setIsActivityLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  
  const [commentTypeFilter, setCommentTypeFilter] = useState('all');
  const [commentLocationFilter, setCommentLocationFilter] = useState('all');
  
  const [historyTypeFilter, setHistoryTypeFilter] = useState('all');
  const [historyPlacementFilter, setHistoryPlacementFilter] = useState('all');

  const [analytics, setAnalytics] = useState({ 
    totalChaptersRead: 42, 
    totalHoursRead: 7, 
    chartData: [
      { name: 'Пн', rozdivly: 5 },
      { name: 'Вв', rozdivly: 8 },
      { name: 'Ср', rozdivly: 3 },
      { name: 'Чт', rozdivly: 12 },
      { name: 'Пт', rozdivly: 6 },
      { name: 'Сб', rozdivly: 15 },
      { name: 'Нд', rozdivly: 9 }
    ] 
  });

  const [profileTab, setProfileTab] = useState(searchParams.get('tab') || 'titles');
  const analyticsRef = useRef(null);
  const tabsRef = useRef(null);

  const API_BASE = 'http://localhost:5000';
  const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');
  const isOwnProfile = user?.username && (loggedInUser?.username === user.username);

  const TITLE_CATEGORIES = [
    { id: 'all', label: 'Усі' },
    { id: 'reading', label: 'Читаю' },
    { id: 'planned', label: 'В планах' },
    { id: 'read', label: 'Прочитано' },
    { id: 'dropped', label: 'Кинуто' },
    { id: 'favorites', label: 'В Обраному' }
  ];

  // Завантаження аналітики (Вимкнено для відображення фейкових даних)
  /*
  useEffect(() => {
    if (profileTab === 'stats' && urlUsername) {
      const fetchAnalytics = async () => {
        try {
          const response = await fetch(`${API_BASE}/api/users/profile/${urlUsername}/analytics`);
          const data = await response.json();
          if (data.success) {
            setAnalytics(data.data);
          }
        } catch (err) {
          console.error('Помилка завантаження аналітики:', err);
        }
      };
      fetchAnalytics();
    }
  }, [profileTab, urlUsername]);
  */

  useEffect(() => {
    if (profileTab === 'titles' && urlUsername) {
      const fetchTitles = async () => {
        setIsTitlesLoading(true);
        try {
          // Отримуємо списки через бекенд для профілю (навіть чужого)
          const response = await fetch(`${API_BASE}/api/user-list/user/${urlUsername}`);
          const data = await response.json();
          
          if (data.success) {
            const lists = data.data; // Масив { manga: { _id, title, ... }, status, ... }
            if (lists.length === 0) {
              setUserTitles([]);
              return;
            }

            const userMangaDetails = lists
              .filter(item => item.manga) // Відсікаємо якщо манґу видалили з бази
              .map(item => ({
                ...item.manga,
                statusInList: item.status
              }));
              
            setUserTitles(userMangaDetails);
          }
        } catch (err) {
          console.error('Помилка завантаження тайтлів:', err);
        } finally {
          setIsTitlesLoading(false);
        }
      };
      fetchTitles();
    }
  }, [profileTab, urlUsername]);

  useEffect(() => {
    if ((profileTab === 'comments' || profileTab === 'reviews') && user?._id) {
      const fetchActivity = async () => {
        setIsActivityLoading(true);
        try {
          const endpoint = profileTab === 'comments' ? 'comments' : 'reviews';
          const response = await fetch(`${API_BASE}/api/${endpoint}/user/${user._id}`);
          const data = await response.json();
          if (data.success) {
            if (profileTab === 'comments') setUserComments(data.data);
            else setUserReviews(data.data);
          }
        } catch (err) {
          console.error('Помилка завантаження активності:', err);
        } finally {
          setIsActivityLoading(false);
        }
      };
      fetchActivity();
    }
  }, [profileTab, user]);

  useEffect(() => {
    if (profileTab === 'history' && user?._id) {
      const fetchHistory = async () => {
        setIsHistoryLoading(true);
        try {
          const response = await fetch(`${API_BASE}/api/history/user/${user._id}`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new TypeError("Oops, we haven't got JSON!");
          }

          const data = await response.json();
          if (data.success) {
            setUserHistory(data.data);
          }
        } catch (err) {
          console.error('Помилка завантаження історії:', err);
        } finally {
          setIsHistoryLoading(false);
        }
      };
      fetchHistory();
    }
  }, [profileTab, user]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'settings') {
      setIsSettingsOpen(true);
      return;
    }
    setIsSettingsOpen(false);
    if (tab) setProfileTab(tab);

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
    setToastMessage('Зміни збережено!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAnnouncementSuccess = () => {
    setToastMessage('Новину опубліковано!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => {
    if (profileTab === 'my-creations' && (isOwnProfile || user?.role === 'author' || user?.role === 'admin')) {
      const fetchMyWorks = async () => {
        setIsMyWorksLoading(true);
        try {
          const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
          const [mangaRes, litRes] = await Promise.all([
            fetch(`${API_BASE}/api/manga/my-titles`, { headers }),
            fetch(`${API_BASE}/api/literature`)
          ]);
          
          const mangaData = await mangaRes.json();
          const litData = await litRes.json();
          
          let myManga = [];
          let myLit = [];

          if (mangaData.success) myManga = mangaData.data;
          if (litData.success) {
            const profileUserId = user?._id || user?.id;
            myLit = litData.data.filter(l => (l.author?._id || l.author) === profileUserId);
          }
          
          setMyWorks({ manga: myManga, literature: myLit });
        } catch (err) {
          console.error('Помилка завантаження робіт:', err);
        } finally {
          setIsMyWorksLoading(false);
        }
      };
      fetchMyWorks();
    }
  }, [profileTab, user, isOwnProfile]);

  const PROFILE_TABS = useMemo(() => [
    { id: 'titles', label: 'Тайтли' },
    { id: 'stats', label: 'Аналітика' },
    ...(isOwnProfile || user?.role === 'author' || user?.role === 'admin' ? [{ id: 'my-creations', label: 'Творчість' }] : []),
    { id: 'comments', label: 'Коментарі' },
    { id: 'reviews', label: 'Відгуки' },
    { id: 'history', label: 'Історія' }
  ], [user, isOwnProfile]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/users/profile/${urlUsername}`);
        const data = await response.json();
        if (data.success) {
          setUser(data.data);
        } else {
          setUser({ username: urlUsername, role: 'Гість', avatar: null, error: true });
        }
      } catch (err) {
        console.error('Помилка завантаження профілю:', err);
      }
    };
    if (urlUsername) fetchUserData();

    const handleProfileUpdate = () => {
      const loggedIn = JSON.parse(localStorage.getItem('user') || 'null');
      if (loggedIn && (loggedIn.username === urlUsername || loggedIn.id === user?._id)) {
        setUser(prev => ({ ...prev, ...loggedIn }));
      }
    };
    window.addEventListener('profileUpdate', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdate', handleProfileUpdate);
  }, [urlUsername]);

  if (!user) return <div className={styles.profileWrapper}><Header /><div className={styles.loading}>Завантаження...</div></div>;

  const STATS_DYNAMIC = [
    { label: 'Тайтли', value: user.stats?.titles || 0, icon: <FiBook size={18} /> },
    { label: 'Коментарі', value: user.stats?.comments || 0, icon: <FiMessageSquare size={18} /> },
    { label: 'Оцінки', value: user.stats?.ratings || 0, icon: <FiStar size={18} /> },
    { label: 'Прочитано', value: user.stats?.readCount || 0, icon: <FiBookOpen size={18} /> }
  ];

  const renderProfileTabContent = () => {
    switch(profileTab) {
      case 'my-creations':
        const hasWorks = myWorks.manga.length > 0 || myWorks.literature.length > 0;
        return (
          <div className={styles.creationsWrapper}>
            {isOwnProfile && (
              <div className={styles.creationsActions}>
                {(user?.role === 'author' || user?.role === 'admin') && (
                  <>
                    <button className={styles.creationsBtn} onClick={() => setIsAnnouncementOpen(true)}>
                      <FiPlus /> <span>Новина тайтлу</span>
                    </button>
                    <button className={styles.creationsBtn} onClick={() => navigate('/create-manga')}>
                      <FiPlus /> <span>Додати тайтл</span>
                    </button>
                  </>
                )}
                <button className={styles.creationsBtn} onClick={() => navigate('/create-fanfic')}>
                  <FiPlus /> <span>Написати фанфік</span>
                </button>
              </div>
            )}
            
            <div className={styles.myWorksSection}>
              {isMyWorksLoading ? (
                <div className={styles.loading}>Завантаження ваших робіт...</div>
              ) : hasWorks ? (
                <>
                  {myWorks.manga.length > 0 && (
                    <div className={styles.worksGroup}>
                      <h3 className={styles.groupTitle}>Манґа та комікси</h3>
                      <div className={styles.myTitlesGrid}>
                        {myWorks.manga.map(m => (
                          <div key={m._id} className={styles.mangaCard}>
                            <div className={styles.imageWrapper} onClick={() => navigate(`/manga/${m._id}`)}>
                              <img src={`${API_BASE}${m.coverImage}`} alt={m.title} />
                            </div>
                            <h3 className={styles.cardTitle} onClick={() => navigate(`/manga/${m._id}`)}>{m.title}</h3>
                            {isOwnProfile && (
                              <button className={styles.editCreationBtn} onClick={() => navigate(`/edit-manga/${m._id}`)}>Редагувати</button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {myWorks.literature.length > 0 && (
                    <div className={styles.worksGroup}>
                      <h3 className={styles.groupTitle}>Фанфіки та література</h3>
                      <div className={styles.fanficsGrid}>
                        {myWorks.literature.map(lit => (
                          <div 
                            key={lit._id} 
                            className={styles.fanficCard}
                            onClick={() => navigate(`/fanfic/${lit._id}`)}
                          >
                            <div className={styles.fanficIcon}>
                              <FiBookOpen size={24} />
                            </div>
                            <div className={styles.fanficInfo}>
                              <div className={styles.fanficTop}>
                                <h3 className={styles.fanficTitle}>{lit.title}</h3>
                                {lit.isOfficial && <span className={styles.officialBadge}>Від автора</span>}
                              </div>
                              <div className={styles.fanficMeta}>
                                <span className={styles.direction}>{lit.direction}</span>
                                <span className={styles.dot}>•</span>
                                <span className={styles.status}>
                                  {lit.status === 'completed' ? 'Завершено' : 'В процесі'}
                                </span>
                              </div>
                            </div>
                            <div className={styles.fanficLikes}>
                              <FiHeart size={14} fill="#ff4d00" stroke="none" />
                              <span>{lit.likes?.length || 0}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.emptyState}>
                  <p>У вас ще немає створених творів.</p>
                  <div className={styles.emptyActions}>
                    <button onClick={() => navigate('/create-fanfic')} className={styles.createBtn}>Написати перший фанфік</button>
                    {(user?.role === 'author' || user?.role === 'admin') && (
                      <button onClick={() => navigate('/create-manga')} className={styles.createBtnSecondary}>Додати манґу</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'titles':
        const filteredTitles = userTitles.filter(item => {
          if (activeCategory === 'all') return true;
          return item.statusInList === activeCategory;
        });

        return (
          <div className={styles.titlesWrapper}>
            {isTitlesLoading ? (
              <div className={styles.loading}>Завантаження списку...</div>
            ) : filteredTitles.length > 0 ? (
              <div className={styles.progressGrid}>
                {filteredTitles.map(manga => (
                  <div key={manga._id} className={styles.progressCard} onClick={() => navigate(`/manga/${manga._id}`)} style={{ cursor: 'pointer' }}>
                    <img src={manga.coverImage ? (manga.coverImage.startsWith('http') ? manga.coverImage : `${API_BASE}${manga.coverImage}`) : ''} alt={manga.title} className={styles.cardCover} />
                    <div className={styles.cardInfo}>
                      <h3 className={styles.cardTitle}>{manga.title}</h3>
                      <div className={styles.progressText}>
                        Статус: {TITLE_CATEGORIES.find(c => c.id === manga.statusInList)?.label || 'Невідомо'}
                      </div>
                      <div className={styles.progressTrack}>
                         <div className={styles.progressFill} style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>У цій категорії ще немає тайтлів.</p>
              </div>
            )}
          </div>
        );
      case 'stats':
        return (
          <div className={styles.analyticsSection} ref={analyticsRef}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Прочитано розділів</span>
                <span className={styles.statNumber}>{analytics.totalChaptersRead}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Годин читання (приблизно)</span>
                <span className={styles.statNumber}>{analytics.totalHoursRead} год.</span>
              </div>
            </div>
            <div className={styles.chartContainer}>
              <h3 className={styles.chartTitle}>Активність читання (Останні 7 днів)</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={analytics.chartData}>
                    <XAxis dataKey="name" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                      itemStyle={{ color: 'var(--primary-color)' }}
                    />
                    <Line type="monotone" dataKey="rozdivly" name="Розділи" stroke="var(--primary-color)" strokeWidth={3} dot={{ r: 5, fill: 'var(--primary-color)' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      case 'comments':
      case 'reviews':
        const activityData = profileTab === 'comments' ? userComments : userReviews;
        const filteredActivity = activityData.filter(item => {
          const typeMap = { 'manga': 'Манґа', 'manhwa': 'Манхва', 'fanfic': 'Література', 'manhua': 'Маньхуа' };
          const matchType = commentTypeFilter === 'all' || item.resourceId?.type === typeMap[commentTypeFilter];
          const matchLocation = commentLocationFilter === 'all' || commentLocationFilter === 'under_title';
          return matchType && matchLocation;
        });

        return (
          <div className={styles.activityContainer}>
            {isActivityLoading ? (
              <div className={styles.loading}>Завантаження...</div>
            ) : filteredActivity.length > 0 ? (
              <div className={styles.activityList}>
                {filteredActivity.map(item => (
                  <div key={item._id} className={styles.activityCard}>
                    <div className={styles.activityHeader}>
                      <span className={styles.targetTitle} onClick={() => navigate(`/${item.resourceType?.toLowerCase() === 'manga' ? 'manga' : 'fanfic'}/${item.resourceId?._id}`)}>
                        {item.resourceId?.title || 'Видалений твір'}
                      </span>
                      <span className={styles.activityDate}>{new Date(item.createdAt).toLocaleDateString('uk-UA')}</span>
                    </div>
                    <p className={styles.activityContent}>{item.content}</p>
                    <div className={styles.activityMeta}>
                      <span className={styles.typeBadge}>{item.resourceId?.type || (item.resourceType === 'Literature' ? 'Література' : 'Твір')}</span>
                      <span className={styles.activityDate}>
                        {profileTab === 'reviews' ? 'Відгук' : 'Коментар'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>Тут поки що порожньо.</div>
            )}
          </div>
        );
      case 'history':
        const filteredHistory = userHistory.filter(item => {
          // Фільтр за типом твору (береться з populated поля manga.type)
          const matchType = historyTypeFilter === 'all' || item.manga?.type === historyTypeFilter;
          
          // Фільтр за розміщенням (якщо chapter існує — це читання в розділах, якщо немає — перегляд сторінки тайтлу)
          const matchPlacement = historyPlacementFilter === 'all' || 
            (historyPlacementFilter === 'chapter' ? item.chapter : !item.chapter);
            
          return matchType && matchPlacement;
        });

        return (
          <div className={styles.historyWrapper}>
            {isHistoryLoading ? (
              <div className={styles.loading}>Завантаження історії...</div>
            ) : filteredHistory.length > 0 ? (
              <div className={styles.historyGrid}>
                {filteredHistory.map(item => (
                  <div 
                    key={item._id} 
                    className={styles.historyCard}
                    onClick={() => {
                      if (item.chapter) {
                        navigate(`/manga/${item.manga?._id}/read/${item.chapter?._id}`);
                      } else {
                        navigate(`/manga/${item.manga?._id}`);
                      }
                    }}
                  >
                    <div className={styles.historyCover}>
                      <img src={item.manga?.coverImage ? (item.manga.coverImage.startsWith('http') ? item.manga.coverImage : `${API_BASE}${item.manga.coverImage}`) : ''} alt={item.manga?.title} />
                      <div className={styles.historyOverlay}>
                        <FiBookOpen size={24} />
                      </div>
                    </div>
                    <div className={styles.historyInfo}>
                      <h3 className={styles.historyMangaTitle}>{item.manga?.title || 'Видалений твір'}</h3>
                      <div className={styles.historyChapterDetails}>
                        {item.chapter ? (
                          <>
                            <span className={styles.historyChapterNumber}>Розділ {item.chapter?.number}</span>
                            {item.chapter?.title && <span className={styles.historyChapterTitle}> - {item.chapter.title}</span>}
                          </>
                        ) : (
                          <span className={styles.historyChapterNumber}>Перегляд тайтлу</span>
                        )}
                      </div>
                      <span className={styles.historyDate}>Прочитано: {new Date(item.readAt).toLocaleDateString('uk-UA')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>В історії немає записів, що відповідають обраним фільтрам.</p>
              </div>
            )}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className={styles.profileWrapper}>
      <Header />
      <div className={styles.container}>
        <section className={styles.headerSection}>
          <div className={styles.banner}>
            <div className={styles.bannerImage} style={{ backgroundImage: user.banner ? `url("${user.banner}")` : 'none' }} />
            {isOwnProfile && (
              <div className={styles.bannerActions}>
                {user.role === 'admin' && (
                  <button className={styles.adminPanelBtn} onClick={() => navigate('/admin')} title="Панель адміністратора">
                    <FiShield size={20} />
                    <span>Адмін-панель</span>
                  </button>
                )}
                <button className={styles.settingsBtn} onClick={() => handleTabChange('settings')} title="Налаштування">
                  <FiSettings size={20} />
                </button>
              </div>
            )}
          </div>
          <div className={styles.userInfoBar}>
            <div className={styles.avatarWrapper}>
              {user.avatar ? <img src={user.avatar} alt={user.username} className={styles.avatarImage} /> : <div className={styles.avatarPlaceholder}><FiUser size={40} /></div>}
            </div>
            <div className={styles.userDetails}>
              <div className={styles.nameRow}>
                <h1 className={styles.nickname}>{user.username}</h1>
                {user.role === 'admin' && (
                  <div className={`${styles.authorBadge} ${styles.adminBadge}`}>
                    <LuShieldCheck size={14} strokeWidth={2.5} /> 
                    <span>Адміністратор</span>
                  </div>
                )}
                {user.role === 'author' && <div className={styles.authorBadge}><FiEdit3 size={12} /> <span>Автор</span></div>}
              </div>
              {user.aboutMe && <p className={styles.aboutText}>{user.aboutMe}</p>}
              <div className={styles.statsPanel}>
                {STATS_DYNAMIC.map((s, i) => (
                  <div key={i} className={styles.statItem}>
                    <span>{s.icon}</span><span className={styles.statLabel}>{s.label}</span><span className={styles.statValue}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <div className={styles.profileTabsMenu} ref={tabsRef}>
          {PROFILE_TABS.map(t => (
            <button key={t.id} type="button" className={`${styles.tabBtn} ${profileTab === t.id ? styles.activeProfileTab : ''}`} onClick={() => handleTabChange(t.id)}>{t.label}</button>
          ))}
        </div>
        <div className={styles.tabLayout}>
          <main className={styles.tabContentArea}>{renderProfileTabContent()}</main>
          <ProfileSidebar 
            activeTab={profileTab} 
            listFilter={activeCategory}
            setListFilter={setActiveCategory}
            commentType={commentTypeFilter}
            setCommentType={setCommentTypeFilter}
            commentLocation={commentLocationFilter}
            setCommentLocation={setCommentLocationFilter}
            historyType={historyTypeFilter}
            setHistoryType={setHistoryTypeFilter}
            historyPlacement={historyPlacementFilter}
            setHistoryPlacement={setHistoryPlacementFilter}
          />
        </div>
      </div>
      <ProfileSettingsModal isOpen={isSettingsOpen} onClose={handleCloseSettings} user={user} onSaveSuccess={handleSaveSuccess} />
      <CreateAnnouncementModal isOpen={isAnnouncementOpen} onClose={() => setIsAnnouncementOpen(false)} onSaveSuccess={handleAnnouncementSuccess} />
      <div className={`${styles.toast} ${showToast ? styles.show : ''}`}><FiCheckCircle className={styles.toastIcon} /><span>{toastMessage}</span></div>
    </div>
  );
};

export default Profile;
