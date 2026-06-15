import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import { FiUpload, FiX, FiCheck, FiArrowLeft, FiImage } from 'react-icons/fi';
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

  const types = ['Манґа', 'Манхва', 'Маньхуа', 'Комікс'];
  const statuses = ['Анонс', 'В процесі', 'Завершено', 'Призупинено'];
  const availableGenres = [
    'Бойовик', 'Пригоди', 'Комедія', 'Драма', 'Фентезі', 
    'Жахи', 'Містика', 'Романтика', 'Психологія', 'Наукова фантастика',
    'Повсякденність', 'Трагедія', 'Надприродне', 'Екшн', 'Військове'
  ];

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
        }
      } catch (err) {
        setError('Помилка завантаження даних тайтлу');
      } finally {
        setIsFetching(false);
      }
    };

    fetchManga();
  }, [id, navigate]);

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
        <p>Оновіть інформацію про твір.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
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
    </div>
  );
};

export default EditManga;
