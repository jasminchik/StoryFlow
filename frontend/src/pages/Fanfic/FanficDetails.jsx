import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiBookOpen, 
  FiUser, 
  FiCalendar, 
  FiHeart, 
  FiPlus, 
  FiArrowLeft, 
  FiClock, 
  FiSend, 
  FiX,
  FiFileText,
  FiInfo,
  FiTrash2
} from 'react-icons/fi';
import Header from '../../components/Header';
import InteractionSection from '../../components/InteractionSection';
import styles from './Fanfic.module.scss';

const TABS = [
  { id: 'chapters', label: 'Зміст' },
  { id: 'comments', label: 'Коментарі' },
  { id: 'reviews', label: 'Рецензії' },
  { id: 'discussions', label: 'Обговорення' }
];

const FanficDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fanfic, setFanfic] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState('chapters');

  const [newChapter, setNewChapter] = useState({
    title: '',
    content: '',
    chapterNumber: 1
  });

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const API_BASE = 'http://localhost:5000';
  const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');

  console.log("Дані фанфіка:", fanfic);

  useEffect(() => {
    fetchFanficDetails();
  }, [id]);

  const fetchFanficDetails = async () => {
    setIsLoading(true);
    try {
      const [fanficRes, chaptersRes] = await Promise.all([
        fetch(`${API_BASE}/api/literature/${id}`),
        fetch(`${API_BASE}/api/literature-chapters/literature/${id}`)
      ]);

      const fanficData = await fanficRes.json();
      const chaptersData = await chaptersRes.json();

      if (fanficData.success) {
        setFanfic(fanficData.data);
        setLikeCount(fanficData.data.likes?.length || 0);
        if (loggedInUser) {
          const userId = loggedInUser.id || loggedInUser._id;
          setIsLiked(fanficData.data.likes?.some(uid => String(uid) === String(userId)));
        }
      }
      if (chaptersData.success) {
        setChapters(chaptersData.data);
        setNewChapter(prev => ({ ...prev, chapterNumber: chaptersData.data.length + 1 }));
      }
    } catch (err) {
      console.error('Помилка завантаження фанфіка:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFanfic = async () => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей фанфік?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/literature/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert('Твір успішно видалено');
        navigate('/catalog');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Помилка при видаленні');
      }
    } catch (err) {
      console.error('Помилка видалення фанфіка:', err);
    }
  };

  const handleLike = async () => {
    if (!loggedInUser) {
      alert('Будь ласка, увійдіть, щоб ставити лайки');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/literature/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setIsLiked(data.isLiked);
        setLikeCount(data.data.length);
      }
    } catch (err) {
      console.error('Помилка лайку:', err);
    }
  };

  const handleAddChapter = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/api/literature-chapters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...newChapter,
          literature: id
        })
      });

      const result = await response.json();

      if (response.ok) {
        setChapters([...chapters, result.data]);
        setIsChapterModalOpen(false);
        setNewChapter({ title: '', content: '', chapterNumber: chapters.length + 2 });
      } else {
        alert(result.error || 'Помилка при додаванні розділу');
      }
    } catch (err) {
      console.error('Помилка:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className={styles.loadingWrapper}><div className={styles.loader}></div></div>;
  if (!fanfic) return <div className={styles.errorWrapper}><h2>Твір не знайдено</h2><button onClick={() => navigate(-1)} className={styles.backButton}><FiArrowLeft size={18}/> Повернутись</button></div>;

  const isOwner = loggedInUser && (String(fanfic.author?._id || fanfic.author) === String(loggedInUser.id || loggedInUser._id));
  const isAdmin = loggedInUser && loggedInUser.role === 'admin';

  const handleBack = () => {
    if (fanfic?.manga?._id) {
      navigate(`/manga/${fanfic.manga._id}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={styles.fanficPage}>
      <Header />

      <main className={styles.mainContent}>
        <div className={styles.container}>

          {/* NAVIGATION */}
          <div className={styles.breadcrumb}>
            <button className={styles.backButton} onClick={handleBack}>
              <FiArrowLeft size={18} />
              <span>Повернутись назад</span>
            </button>
          </div>

          {/* FANFIC HEADER */}
          <div className={styles.fanficHeaderCard}>

            {/* AUTHOR ACTIONS */}
            {(isOwner || isAdmin) && (
              <div className={styles.authorActions}>
                {isOwner && (
                  <button className={styles.actionBtnPrimary} onClick={() => setIsChapterModalOpen(true)}>
                    <FiPlus size={18} />
                    <span>Додати розділ</span>
                  </button>
                )}
                <button className={`${styles.actionBtnSecondary} ${styles.deleteAction}`} onClick={handleDeleteFanfic}>
                  <FiTrash2 size={18} />
                  <span>Видалити твір</span>
                </button>
              </div>
            )}

            <div className={styles.headerInfo}>
              <h1 className={styles.fanficTitle}>{fanfic.title}</h1>

              <div className={styles.primaryMeta}>
                <div className={styles.authorRow}>
                  <FiUser size={18} className={styles.metaIcon} />
                  <Link to={`/profile/${fanfic.author?.username}`} className={styles.authorName}>
                    {fanfic.author?.username || 'Невідомий автор'}
                  </Link>
                  {fanfic.isOfficial && <span className={styles.officialBadge}>Від автора</span>}
                </div>

                {fanfic.manga && (
                  <div className={styles.fandomRow}>
                    <FiInfo size={18} className={styles.metaIcon} />
                    <span className={styles.fandomLabel}>Фендом:</span>
                    <Link to={`/manga/${fanfic.manga?._id}`} className={styles.fandomName}>
                      {fanfic.manga?.title}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* SPECS GRID */}
            <div className={styles.specsGrid}>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Статус</span>
                <span className={`${styles.specValue} ${styles[fanfic.status]}`}>
                  {fanfic.status === 'in_progress' ? 'В процесі' : 'Завершено'}
                </span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Спрямованість</span>
                <span className={styles.specValue}>{fanfic.direction || 'Джен'}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Рейтинг</span>
                <span className={`${styles.specValue} ${styles.ratingBadge}`}>{fanfic.ageRating || 'PG-13'}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Розділів</span>
                <span className={styles.specValue}>{chapters?.length || 0}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Оновлено</span>
                <span className={styles.specValue}>{fanfic.updatedAt ? new Date(fanfic.updatedAt).toLocaleDateString() : '—'}</span>
              </div>
              <div 
                className={`${styles.specItem} ${styles.likeItem} ${isLiked ? styles.liked : ''}`}
                onClick={handleLike}
              >
                <span className={styles.specLabel}>Вподобань</span>
                <span className={styles.specValue}>
                  <FiHeart size={16} fill={isLiked ? "#ff4d00" : "none"} stroke={isLiked ? "none" : "currentColor"} /> 
                  {likeCount}
                </span>
              </div>
            </div>

            {/* GENRES */}
            <div className={styles.genresRow}>
              {fanfic.genres?.map(genre => (
                <span key={genre} className={styles.genreTag}>{genre}</span>
              ))}
            </div>

            {/* TEXT BLOCKS */}
            <div className={styles.contentBlocks}>
              <div className={styles.block}>
                <h3 className={styles.blockTitle}>Анотація</h3>
                <div className={styles.blockContent}>
                  <p>{fanfic.description}</p>
                </div>
              </div>

              {fanfic.authorNote && (
                <div className={styles.block}>
                  <h3 className={styles.blockTitle}>Примітки автора</h3>
                  <div className={`${styles.blockContent} ${styles.authorNote}`}>
                    <p>{fanfic.authorNote}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* TABS SECTION */}
          <div className={styles.tabsContainer}>
            <div className={styles.tabsMenu}>
              {TABS.map(tab => (
                <button 
                  key={tab.id} 
                  className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`} 
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className={styles.tabContent}>
              {activeTab === 'chapters' && (
                <div className={styles.chaptersWrapper}>
                  <div className={styles.chaptersHeader}>
                    <FiBookOpen size={22} className={styles.primaryIcon} />
                    <h2>Зміст твору</h2>
                    <span className={styles.chaptersCount}>{chapters?.length || 0} розділів</span>
                  </div>

                  <div className={styles.chaptersList}>
                    {chapters?.length > 0 ? (
                      chapters.map((chapter) => (
                        <div 
                          key={chapter._id} 
                          className={styles.chapterRow}
                          onClick={() => navigate(`/fanfic/${id}/read/${chapter._id}`)}
                        >
                          <div className={styles.chapterMain}>
                            <span className={styles.chapterNumber}>Розділ {chapter.chapterNumber}</span>
                            <span className={styles.chapterSeparator}>—</span>
                            <span className={styles.chapterTitle}>{chapter.title}</span>
                          </div>
                          <div className={styles.chapterMeta}>
                            <FiCalendar size={14} />
                            <span>{new Date(chapter.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.emptyChapters}>
                        <FiFileText size={48} className={styles.emptyIcon} />
                        <p>У цього твору ще немає опублікованих розділів.</p>
                        {isOwner && <button onClick={() => setIsChapterModalOpen(true)} className={styles.actionBtnPrimary}>Опублікувати перший розділ</button>}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'comments' && <InteractionSection type="comment" targetId={id} resourceType="Literature" />}
              {activeTab === 'reviews' && <InteractionSection type="review" targetId={id} resourceType="Literature" />}
              {activeTab === 'discussions' && <InteractionSection type="discussion" targetId={id} resourceType="Literature" />}
            </div>
          </div>

        </div>
      </main>

      {/* CREATE CHAPTER MODAL */}
      {isChapterModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsChapterModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Створити новий розділ</h2>
              <button className={styles.closeBtn} onClick={() => setIsChapterModalOpen(false)}>
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleAddChapter} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Назва розділу *</label>
                <input 
                  type="text" 
                  value={newChapter.title} 
                  onChange={e => setNewChapter({...newChapter, title: e.target.value})}
                  placeholder="Наприклад: Початок історії"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Текст твору *</label>
                <textarea 
                  value={newChapter.content} 
                  onChange={e => setNewChapter({...newChapter, content: e.target.value})}
                  placeholder="Пишіть вашу історію тут..."
                  rows="15"
                  required
                ></textarea>
                <p className={styles.formHint}>Використовуйте порожні рядки для поділу на абзаци.</p>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsChapterModalOpen(false)}>
                  Скасувати
                </button>
                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                  {isSubmitting ? 'Публікація...' : (
                    <>
                      <FiSend size={18} />
                      <span>Опублікувати</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FanficDetails;
