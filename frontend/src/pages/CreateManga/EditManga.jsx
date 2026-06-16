import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import { FiUpload, FiX, FiCheck, FiArrowLeft, FiImage, FiPlus, FiBookOpen, FiTrash2 } from 'react-icons/fi';
import NotificationModal from '../../components/NotificationModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import styles from './CreateManga.module.scss';

const EditManga = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  
  const API_BASE = 'http://localhost:5000';

  // States for Image Previews
  const [preview, setPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  // States for Cropper
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropType, setCropType] = useState(null); // 'cover' | 'banner'

  const [formData, setFormData] = useState({
    title: '',
    alternativeTitle: '',
    description: '',
    type: 'Манґа',
    status: 'Анонс',
    releaseYear: new Date().getFullYear(),
    genres: [],
    coverImage: null,
    bannerImage: null
  });

  const types = ['Манґа', 'Манхва', 'Маньхуа', 'Комікс', 'Книга'];
  const statuses = ['Анонс', 'В процесі', 'Завершено', 'Призупинено'];
  const availableGenres = [
    'Бойовик', 'Пригоди', 'Комедія', 'Драма', 'Фентезі', 
    'Жахи', 'Містика', 'Романтика', 'Психологія', 'Наукова фантастика',
    'Повсякденність', 'Трагедія', 'Надприродне', 'Екшн', 'Військове',
    'Навчальна література', 'Програмування', 'Наукова література', 'Довідник'
  ];

  const [chapters, setChapters] = useState([]);
  const [isChapterFormOpen, setIsChapterFormOpen] = useState(false);
  const [newChapter, setNewChapter] = useState({
    number: '',
    title: '',
  });
  const [localPages, setLocalPages] = useState([]); // { file, preview }
  const [orderedIndices, setOrderedIndices] = useState([]); // indices of localPages in order

  // Modal states
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Автоматичне встановлення номера наступного розділу
  useEffect(() => {
    if (isChapterFormOpen && !newChapter.number) {
      if (chapters.length > 0) {
        const lastNumber = Math.max(...chapters.map(ch => ch.number));
        setNewChapter(prev => ({ ...prev, number: lastNumber + 1 }));
      } else {
        setNewChapter(prev => ({ ...prev, number: 1 }));
      }
    }
  }, [isChapterFormOpen, chapters, newChapter.number]);

  const fetchChapters = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/chapters/manga/${id}`);
      const data = await res.json();
      if (data.success) {
        setChapters(data.data.sort((a, b) => a.number - b.number));
      }
    } catch (err) {
      console.error('Error fetching chapters:', err);
    }
  }, [id, API_BASE]);

  useEffect(() => {
    const fetchManga = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/manga/${id}`);
        const result = await response.json();
        
        if (result.success) {
          const manga = result.data;
          
          // Перевірка чи це автор (або адмін)
          const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (manga.author._id !== loggedInUser.id && manga.author !== loggedInUser.id && 
              manga.author._id !== loggedInUser._id && manga.author !== loggedInUser._id &&
              loggedInUser.role !== 'admin') {
            navigate('/');
            return;
          }

          setFormData({
            title: manga.title || '',
            alternativeTitle: manga.alternativeTitle || '',
            description: manga.description || '',
            type: manga.type || 'Манґа',
            status: manga.status || 'Анонс',
            releaseYear: manga.releaseYear || new Date().getFullYear(),
            genres: manga.genres || [],
            coverImage: null, // Blobs will be null initially
            bannerImage: null
          });

          if (manga.coverImage) setPreview(`${API_BASE}${manga.coverImage}`);
          if (manga.bannerImage) setBannerPreview(`${API_BASE}${manga.bannerImage}`);
          
          fetchChapters();
        }
      } catch (err) {
        setError('Помилка завантаження даних тайтлу');
      } finally {
        setIsFetching(false);
      }
    };

    fetchManga();
  }, [id, navigate, fetchChapters]);

  const handlePagesFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (localPages.length + files.length > 100) {
      setError('Максимальна кількість сторінок у розділі - 100');
      return;
    }

    const sortedFiles = files.sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
    const newPages = sortedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setLocalPages(prev => {
      const updated = [...prev, ...newPages];
      // Автоматично вибираємо всі сторінки у порядку їх додавання/імен
      setOrderedIndices(updated.map((_, i) => i));
      return updated;
    });
  };

  const togglePageSelection = (index) => {
    setOrderedIndices(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const resetOrder = () => setOrderedIndices([]);

  const handleAddChapter = async (e) => {
    if (e) e.preventDefault();
    if (isLoading) return; // Захист від подвійного кліку

    setError('');
    const chapterNum = Number(newChapter.number);

    if (!newChapter.number || isNaN(chapterNum)) {
      setError('Будь ласка, вкажіть коректний номер розділу');
      return;
    }

    if (chapters.some(ch => ch.number === chapterNum)) {
      setError(`Розділ №${chapterNum} вже існує у цьому тайтлі`);
      return;
    }

    if (localPages.length === 0) {
      setError('Будь ласка, завантажте сторінки розділу');
      return;
    }

    if (orderedIndices.length !== localPages.length) {
      setError(`Ви обрали лише ${orderedIndices.length} з ${localPages.length} сторінок. Будь ласка, оберіть усі сторінки у потрібному порядку або скиньте порядок.`);
      return;
    }

    setIsLoading(true);
    if (localPages.length > 0 && (localPages[0].file.type === 'application/pdf' || localPages[0].file.name.toLowerCase().endsWith('.pdf'))) {
      setIsProcessing(true);
    }

    try {
      const data = new FormData();
      data.append('mangaId', id);
      data.append('number', Number(newChapter.number));
      data.append('title', newChapter.title);
      
      // Append files in the specific order chosen by the user
      orderedIndices.forEach((idx) => {
        data.append('pages', localPages[idx].file);
      });

      const response = await fetch(`${API_BASE}/api/chapters`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: data
      });

      const result = await response.json();
      console.log('Додавання розділу результат:', result);

      if (result.success) {
        // Очищуємо стани завантаження ВІДРАЗУ
        setIsLoading(false);
        setIsProcessing(false);
        
        setNotifyMessage(`Розділ №${newChapter.number} успішно додано`);
        setIsNotifyOpen(true);
        
        setNewChapter({ number: '', title: '' });
        setLocalPages([]);
        setOrderedIndices([]);
        setIsChapterFormOpen(false);
        
        // Оновлюємо список асинхронно, не блокуючи сповіщення
        fetchChapters();
      } else {
        setIsLoading(false);
        setIsProcessing(false);
        setError(result.error || 'Помилка при додаванні розділу');
        console.error('Помилка додавання розділу:', result.error);
      }
    } catch (err) {
      setIsLoading(false);
      setIsProcessing(false);
      setError('Помилка з\'єднання з сервером');
      console.error('Помилка fetch додавання розділу:', err);
    }
  };

  const handleDeleteChapter = async () => {
    if (!chapterToDelete) return;
    setIsConfirmOpen(false);
    try {
      const response = await fetch(`${API_BASE}/api/chapters/${chapterToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setNotifyMessage('Розділ успішно видалено');
        setIsNotifyOpen(true);
        fetchChapters();
      } else {
        setNotifyMessage('Помилка при видаленні розділу');
        setIsNotifyOpen(true);
      }
    } catch (err) {
      setNotifyMessage('Помилка з\'єднання з сервером');
      setIsNotifyOpen(true);
    } finally {
      setChapterToDelete(null);
    }
  };

  const openDeleteConfirm = (chapterId) => {
    setChapterToDelete(chapterId);
    setIsConfirmOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenreToggle = (genre) => {
    setFormData(prev => {
      const isSelected = prev.genres.includes(genre);
      return {
        ...prev,
        genres: isSelected 
          ? prev.genres.filter(g => g !== genre) 
          : [...prev.genres, genre]
      };
    });
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  };

  const handleCropConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const previewUrl = URL.createObjectURL(croppedBlob);
      
      if (cropType === 'cover') {
        setFormData(prev => ({ ...prev, coverImage: croppedBlob }));
        setPreview(previewUrl);
      } else if (cropType === 'banner') {
        setFormData(prev => ({ ...prev, bannerImage: croppedBlob }));
        setBannerPreview(previewUrl);
      }
      
      setImageSrc(null);
      setCropType(null);
    } catch (e) {
      console.error("Помилка обрізки зображення:", e);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result);
        setCropType(type);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = ''; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.genres.length === 0) {
      setError('Будь ласка, оберіть принаймні один жанр');
      return;
    }

    setIsLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('alternativeTitle', formData.alternativeTitle);
    data.append('description', formData.description);
    data.append('type', formData.type);
    data.append('status', formData.status);
    data.append('genres', formData.genres.join(','));
    data.append('releaseYear', formData.releaseYear);
    
    if (formData.coverImage) {
      data.append('coverImage', formData.coverImage, 'cover.jpg');
    }
    if (formData.bannerImage) {
      data.append('bannerImage', formData.bannerImage, 'banner.jpg');
    }

    try {
      const response = await fetch(`${API_BASE}/api/manga/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: data
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Помилка при оновленні тайтлу');
      }

      navigate(`/manga/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div className={styles.loading}>Завантаження...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <FiArrowLeft size={20} />
          <span>Назад</span>
        </button>
        <h1>Редагувати тайтл</h1>
        <p>Оновіть інформацію про твір та керуйте розділами.</p>
      </div>

      <div className={styles.editTabs}>
        <button className={styles.active}>Основна інформація</button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* ... (rest of the form stays mostly same, but I'll add the chapters section after it) */}
        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.bannerUploadSection}>
          <div className={styles.bannerPreview} style={{ backgroundImage: bannerPreview ? `url(${bannerPreview})` : 'none' }}>
            {!bannerPreview && (
              <div className={styles.bannerPlaceholder}>
                <FiImage size={48} />
                <span>Завантажити банер (опціонально)</span>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleFileChange(e, 'banner')} 
              className={styles.bannerInput}
              id="bannerUpload"
            />
            {bannerPreview && (
              <label htmlFor="bannerUpload" className={styles.bannerLabel}>
                Змінити банер
              </label>
            )}
          </div>
        </div>

        <div className={styles.mainLayout}>
          <div className={styles.leftColumn}>
            <div className={styles.uploadSection}>
              <div className={styles.imagePreview} style={{ backgroundImage: preview ? `url(${preview})` : 'none' }}>
                {!preview && <FiUpload size={48} className={styles.uploadIcon} />}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, 'cover')} 
                  className={styles.fileInput}
                  id="coverUpload"
                />
                <label htmlFor="coverUpload" className={styles.uploadLabel}>
                  {preview ? 'Змінити обкладинку' : 'Завантажити обкладинку'}
                </label>
              </div>
            </div>
          </div>
          
          <div className={styles.rightColumn}>
            <div className={styles.formGroup}>
              <label>Назва твору *</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleInputChange} 
                required 
              />
            </div>

            <div className={styles.formGroup}>
              <label>Альтернативна назва</label>
              <input 
                type="text" 
                name="alternativeTitle" 
                value={formData.alternativeTitle} 
                onChange={handleInputChange} 
              />
            </div>

            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label>Тип *</label>
                <select name="type" value={formData.type} onChange={handleInputChange}>
                  {types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Статус *</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Рік випуску *</label>
                <input 
                  type="number" 
                  name="releaseYear" 
                  value={formData.releaseYear} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Опис *</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                rows="6"
                required 
              ></textarea>
            </div>

            <div className={styles.formGroup}>
              <label>Жанри *</label>
              <div className={styles.genresGrid}>
                {availableGenres.map(genre => (
                  <button
                    key={genre}
                    type="button"
                    className={`${styles.genreBadge} ${formData.genres.includes(genre) ? styles.activeGenre : ''}`}
                    onClick={() => handleGenreToggle(genre)}
                  >
                    {formData.genres.includes(genre) && <FiCheck className={styles.checkIcon} />}
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.actions}>
              <button 
                type="button" 
                className={styles.cancelBtn} 
                onClick={() => navigate(-1)}
                disabled={isLoading}
              >
                Скасувати
              </button>
              <button 
                type="submit" 
                className={styles.submitBtn} 
                disabled={isLoading}
              >
                {isLoading ? 'Зберігання...' : 'Оновити тайтл'}
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className={styles.chaptersSection}>
        <div className={styles.sectionHeader}>
          <h2><FiBookOpen /> Розділи ({chapters.length})</h2>
          <button 
            type="button"
            className={styles.addChapterBtn} 
            onClick={() => setIsChapterFormOpen(!isChapterFormOpen)}
          >
            {isChapterFormOpen ? <><FiX /> Закрити</> : <><FiPlus /> Додати розділ</>}
          </button>
        </div>

        {isChapterFormOpen && (
          <div className={styles.chapterForm}>
            <h3>Новий розділ</h3>
            <div className={styles.chapterRow}>
              <div className={styles.formGroup}>
                <label>Номер розділу *</label>
                <input 
                  type="number" 
                  value={newChapter.number} 
                  onChange={(e) => setNewChapter({...newChapter, number: e.target.value})} 
                  placeholder="Напр. 1" 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Назва розділу (опц.)</label>
                <input 
                  type="text" 
                  value={newChapter.title} 
                  onChange={(e) => setNewChapter({...newChapter, title: e.target.value})} 
                  placeholder="Напр. Початок" 
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Завантажити сторінки *</label>
              <div className={styles.pagesUploadBox}>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*,.pdf" 
                  onChange={handlePagesFileChange} 
                  id="pages-upload"
                  className={styles.hiddenInput}
                />
                <label htmlFor="pages-upload" className={styles.pagesUploadLabel}>
                  <FiUpload /> Обрати файли
                </label>
                {localPages.length > 0 && (
                  <button type="button" className={styles.resetBtn} onClick={resetOrder}>
                    Скинути порядок
                  </button>
                )}
              </div>
            </div>

            {localPages.length > 0 && (
              <div className={styles.pagesOrderingGallery}>
                <p className={styles.galleryHint}>Клікніть на сторінки у порядку їх слідування (1, 2, 3...):</p>
                <div className={styles.pagesGrid}>
                  {localPages.map((page, index) => {
                    const orderIndex = orderedIndices.indexOf(index);
                    return (
                      <div 
                        key={index} 
                        className={`${styles.pagePreviewItem} ${orderIndex !== -1 ? styles.selectedPage : ''}`}
                        onClick={() => togglePageSelection(index)}
                      >
                        <img src={page.preview} alt={`Page ${index}`} />
                        {orderIndex !== -1 && (
                          <div className={styles.pageBadge}>{orderIndex + 1}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <button 
              type="button" 
              className={styles.saveChapterBtn} 
              onClick={handleAddChapter}
              disabled={isLoading || orderedIndices.length === 0}
            >
              <FiCheck /> {isLoading ? 'Збереження...' : 'Зберегти розділ'}
            </button>
          </div>
        )}

        <div className={styles.chaptersGrid}>
          {chapters.length > 0 ? (
            chapters.map(ch => (
              <div key={ch._id} className={styles.chapterCard}>
                <div className={styles.chapterCardInfo}>
                  <span className={styles.chapterCardNumber}>Розділ {ch.number}</span>
                  <span className={styles.chapterCardTitle}>{ch.title || 'Без назви'}</span>
                  <span className={styles.chapterCardPages}>{ch.pages?.length || 0} сторінок</span>
                </div>
                <div className={styles.chapterCardActions}>
                  <button 
                    type="button"
                    className={styles.deleteBtn} 
                    onClick={() => openDeleteConfirm(ch._id)}
                    title="Видалити розділ"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyText}>
              <FiBookOpen size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>Розділів ще не додано. Ви можете додати перший розділ вище.</p>
            </div>
          )}
        </div>
      </div>

      {imageSrc && (
        <div className={styles.cropperOverlay}>
          <div className={styles.cropperModal}>
            <div className={styles.cropperHeader}>
              <h3>Налаштування {cropType === 'banner' ? 'банеру' : 'обкладинки'}</h3>
            </div>
            <div className={styles.cropperContainer}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={cropType === 'banner' ? 1920 / 400 : 2 / 3}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className={styles.cropperControls}>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(e.target.value)}
                className={styles.zoomSlider}
              />
              <div className={styles.cropperButtons}>
                <button className={styles.cancelBtn} onClick={() => setImageSrc(null)}>Скасувати</button>
                <button className={styles.cropBtn} onClick={handleCropConfirm}>Застосувати</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <NotificationModal 
        isOpen={isNotifyOpen} 
        message={notifyMessage} 
        onClose={() => setIsNotifyOpen(false)} 
      />

      <ConfirmationModal
        isOpen={isConfirmOpen}
        title="Видалити розділ?"
        message="Ви впевнені, що хочете видалити цей розділ? Всі сторінки будуть видалені назавжди."
        onConfirm={handleDeleteChapter}
        onCancel={() => {
          setIsConfirmOpen(false);
          setChapterToDelete(null);
        }}
      />

      {isProcessing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          color: 'white',
          textAlign: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #ff4757',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <h2>Обробка PDF-файлу...</h2>
          <p style={{ marginTop: '10px', opacity: 0.8 }}>
            Ми конвертуємо ваш файл у зображення. Це може зайняти деякий час для великих документів (до 1-2 хвилин).<br />
            Будь ласка, не закривайте сторінку.
          </p>
        </div>
      )}
    </div>
  );
};

export default EditManga;
