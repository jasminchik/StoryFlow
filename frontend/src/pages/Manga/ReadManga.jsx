import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiList } from 'react-icons/fi';
import Header from '../../components/Header';
import styles from './ReadManga.module.scss';

const ReadManga = () => {
  const { titleId, chapterId } = useParams();
  const navigate = useNavigate();

  const [chapter, setChapter] = useState(null);
  const [manga, setManga] = useState(null);
  const [allChapters, setAllChapters] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [chapterRes, mangaRes, allChaptersRes] = await Promise.all([
          fetch(`${API_BASE}/api/chapters/${chapterId}`),
          fetch(`${API_BASE}/api/manga/${titleId}`),
          fetch(`${API_BASE}/api/chapters/manga/${titleId}`)
        ]);

        const chapterData = await chapterRes.json();
        const mangaData = await mangaRes.json();
        const allChaptersData = await allChaptersRes.json();

        if (chapterData.success) setChapter(chapterData.data);
        if (mangaData.success) setManga(mangaData.data);
        if (allChaptersData.success) {
          // Сортуємо по номеру глави
          setAllChapters(allChaptersData.data.sort((a, b) => a.number - b.number));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    setCurrentPage(0);
    window.scrollTo(0, 0);
  }, [chapterId, titleId]);

  const nextChapter = useMemo(() => {
    if (!chapter || allChapters.length === 0) return null;
    const currentIndex = allChapters.findIndex(c => String(c._id) === String(chapterId));
    if (currentIndex !== -1 && currentIndex < allChapters.length - 1) {
      return allChapters[currentIndex + 1];
    }
    return null;
  }, [chapter, allChapters, chapterId]);

  const handleNextPage = useCallback(() => {
    if (!chapter) return;
    if (currentPage < chapter.pages.length - 1) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo(0, 0);
    } else if (nextChapter) {
      // Перехід до наступного розділу
      navigate(`/manga/${titleId}/read/${nextChapter._id}`);
    } else {
      alert('Всі доступні розділи прочитано!');
      navigate(`/manga/${titleId}?tab=chapters`);
    }
  }, [currentPage, chapter, titleId, navigate, nextChapter]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  }, [currentPage]);

  // Обробка клавіш стрілок
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNextPage();
      if (e.key === 'ArrowLeft') handlePrevPage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextPage, handlePrevPage]);

  if (isLoading) return <div className={styles.loading}>Завантаження...</div>;
  if (!chapter) return <div className={styles.error}>Розділ не знайдено</div>;

  return (
    <div className={styles.readerWrapper}>
      <Header />
      
      <div className={styles.readerContainer}>
        <div className={styles.readerHeader}>
          <Link to={`/manga/${titleId}?tab=chapters`} className={styles.backBtn}>
            <FiArrowLeft /> До списку розділів
          </Link>
          <div className={styles.chapterTitleInfo}>
            <h2 className={styles.mangaTitle}>{manga?.title}</h2>
            <span className={styles.chapterInfo}>Розділ {chapter.number} {chapter.title && ` - ${chapter.title}`}</span>
          </div>
        </div>

        <div className={styles.pageViewer}>
          <div className={styles.pageContent} onClick={handleNextPage}>
            <img 
              src={chapter.pages[currentPage].startsWith('http') ? chapter.pages[currentPage] : `${API_BASE}${chapter.pages[currentPage]}`} 
              alt={`Сторінка ${currentPage + 1}`} 
              className={styles.mangaPage} 
            />
          </div>

          <div className={styles.navigation}>
            <button 
              className={styles.navBtn} 
              onClick={handlePrevPage}
              disabled={currentPage === 0}
            >
              <FiChevronLeft /> Назад
            </button>
            <span className={styles.pageCounter}>
              Сторінка {currentPage + 1} з {chapter.pages.length}
            </span>
            <button 
              className={styles.navBtn} 
              onClick={handleNextPage}
            >
              {currentPage < chapter.pages.length - 1 ? (
                <>Вперед <FiChevronRight /></>
              ) : (
                <>Завершити <FiList /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadManga;
