import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiList, FiBook } from 'react-icons/fi';
import Header from '../../components/Header';
import styles from './ReadFanfic.module.scss';

const ReadFanfic = () => {
  const { id, chapterId } = useParams();
  const navigate = useNavigate();
  
  const [chapter, setChapter] = useState(null);
  const [allChapters, setAllChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const [chapterRes, listRes] = await Promise.all([
          fetch(`${API_BASE}/api/literature-chapters/${chapterId}`),
          fetch(`${API_BASE}/api/literature-chapters/literature/${id}`)
        ]);

        const chapterData = await chapterRes.json();
        const listData = await listRes.json();

        if (chapterData.success) setChapter(chapterData.data);
        if (listData.success) setAllChapters(listData.data);
      } catch (err) {
        console.error('Помилка завантаження розділу:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
    window.scrollTo(0, 0);
  }, [id, chapterId]);

  if (isLoading) return <div className={styles.loading}>Завантаження тексту...</div>;
  if (!chapter) return <div className={styles.error}>Розділ не знайдено</div>;

  const currentIndex = allChapters.findIndex(c => c._id === chapterId);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  return (
    <div className={styles.readPage}>
      <Header />
      
      <div className={styles.readerContainer}>
        {/* Top Navigation Bar */}
        <nav className={styles.topNav}>
          <Link to={`/fanfic/${id}`} replace className={styles.backLink}>
            <FiArrowLeft /> <span>До опису твору</span>
          </Link>
          <div className={styles.titles}>
            <h2 className={styles.workTitle}>{chapter.literature?.title}</h2>
            <h1 className={styles.chapterTitle}>Розділ {chapter.chapterNumber}. {chapter.title}</h1>
          </div>
        </nav>

        {/* Content Area */}
        <article className={styles.contentArea}>
          <div className={styles.textContent}>
            {chapter.content.split('\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </article>

        {/* Bottom Navigation */}
        <footer className={styles.bottomNav}>
          <div className={styles.navControls}>
            <button 
              className={styles.navBtn} 
              disabled={!prevChapter}
              onClick={() => navigate(`/fanfic/${id}/read/${prevChapter._id}`)}
            >
              <FiChevronLeft /> <span>Попередній розділ</span>
            </button>
            
            <button className={styles.listBtn} onClick={() => navigate(`/fanfic/${id}`)}>
              <FiList /> <span>Зміст</span>
            </button>

            <button 
              className={styles.navBtn} 
              disabled={!nextChapter}
              onClick={() => navigate(`/fanfic/${id}/read/${nextChapter._id}`)}
            >
              <span>Наступний розділ</span> <FiChevronRight />
            </button>
          </div>
          
          <div className={styles.finishArea}>
            <p>Ви прочитали цей розділ. Сподобалось?</p>
            <Link to={`/fanfic/${id}`} className={styles.returnBtn}>
              <FiBook /> Повернутись до сторінки твору
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ReadFanfic;
