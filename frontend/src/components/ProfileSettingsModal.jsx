import React, { useState, useEffect, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { FiX, FiUploadCloud, FiZap, FiUser as GenderIcon } from 'react-icons/fi';
import { FaMars, FaVenus } from 'react-icons/fa';
import styles from './ProfileSettingsModal.module.scss';

const ProfileSettingsModal = ({ isOpen, onClose, user }) => {
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('');
  const [banner, setBanner] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [gender, setGender] = useState('secret');
  const [isSaved, setIsSaved] = useState(false);

  // Управління завантаженням та обрізкою (Cropper)
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropType, setCropType] = useState(null); // 'avatar' | 'banner'

  const [isDragging, setIsDragging] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      setNickname(user.username || '');
      setAvatar(user.avatar || '');
      setBanner(user.banner || '');
      setAboutMe(user.aboutMe || '');
      setGender(user.gender || 'secret');
      setIsSaved(false);
      
      document.body.style.overflow = 'hidden';
    } else if (!isOpen) {
      document.body.style.overflow = 'unset';
      setImageSrc(null);
      setNickname('');
      setAvatar('');
      setBanner('');
      setAboutMe('');
      setGender('secret');
    }
  }, [isOpen, user]);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: nickname,
          avatar,
          banner,
          aboutMe,
          gender
        })
      });

      const data = await response.json();

      if (data.success) {
        // Оновлюємо дані в localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...data.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Повідомляємо інші компоненти про оновлення
        window.dispatchEvent(new Event('profileUpdate'));
        
        setIsSaved(true);

        // Якщо нікнейм змінився, треба змінити URL через деякий час
        if (nickname !== currentUser.username) {
          setTimeout(() => {
            window.location.href = `/profile/${nickname}`;
          }, 2000);
        }
      } else {
        alert(data.error || 'Помилка при збереженні');
      }
    } catch (err) {
      console.error('Помилка збереження:', err);
      alert('Не вдалося зберегти зміни');
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleDragOver = (e, type) => {
    e.preventDefault();
    setIsDragging(type);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(null);
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setIsDragging(null);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result);
        setCropType(type);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
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
    e.target.value = ''; // Очищаємо інпут
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Утиліта для обрізки зображення через Canvas
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

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleCropConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      if (cropType === 'avatar') {
        setAvatar(croppedImage);
      } else if (cropType === 'banner') {
        setBanner(croppedImage);
      }
      
      // Закриваємо кроппер
      setImageSrc(null);
      setCropType(null);
    } catch (e) {
      console.error("Помилка обрізки зображення:", e);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.backdrop} onClick={handleClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <h2>Налаштування профілю</h2>
            <button className={styles.closeBtn} onClick={handleClose}><FiX size={24} /></button>
          </div>

          <div className={styles.content}>
            {/* СЕКЦІЯ ЗОБРАЖЕНЬ */}
            <div className={styles.imagesSection}>
              {/* АВАТАР */}
              <div className={styles.avatarColumn}>
                <h3 className={styles.sectionLabel}>Аватар</h3>
                <div className={styles.avatarPreviewWrapper}>
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className={styles.avatarImage} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {nickname ? nickname.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                </div>
                <label 
                  className={`${styles.uploadZone} ${isDragging === 'avatar' ? styles.activeDrag : ''}`}
                  onDragOver={(e) => handleDragOver(e, 'avatar')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'avatar')}
                >
                  <FiUploadCloud size={32} className={styles.dropIcon} />
                  <span>Натисніть або перетягніть зображення</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className={styles.hiddenFileInput}
                    ref={avatarInputRef}
                    onChange={(e) => handleFileChange(e, 'avatar')}
                  />
                </label>
              </div>

              {/* БАНЕР */}
              <div className={styles.bannerColumn}>
                <div className={styles.bannerHeader}>
                  <h3 className={styles.sectionLabel}>Фон профілю</h3>
                </div>
                <div className={styles.bannerPreviewWrapper}>
                  {banner ? (
                    <img src={banner} alt="Banner" className={styles.bannerImage} />
                  ) : (
                    <div className={styles.bannerPlaceholder}>Немає фону</div>
                  )}
                </div>
                <label 
                  className={`${styles.uploadZone} ${isDragging === 'banner' ? styles.activeDrag : ''}`}
                  onDragOver={(e) => handleDragOver(e, 'banner')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'banner')}
                >
                  <FiUploadCloud size={32} className={styles.dropIcon} />
                  <span>Натисніть або перетягніть зображення</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className={styles.hiddenFileInput}
                    ref={bannerInputRef}
                    onChange={(e) => handleFileChange(e, 'banner')}
                  />
                </label>
              </div>
            </div>

            {/* СЕКЦІЯ ІНФОРМАЦІЇ */}
            <div className={styles.infoSection}>
              <h3 className={styles.sectionLabel}>Інформація</h3>
              
              <div className={styles.infoGrid}>
                <div className={styles.formGroup}>
                  <label>Нікнейм</label>
                  <input 
                    type="text" 
                    className={styles.textInput}
                    value={nickname} 
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Ваш нікнейм"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Стать</label>
                  <div className={styles.genderSelector}>
                    <button 
                      type="button"
                      className={`${styles.genderOption} ${gender === 'male' ? styles.active : ''}`}
                      onClick={() => setGender('male')}
                    >
                      <FaMars size={18} className={styles.icon} />
                      <span>Чоловіча</span>
                    </button>
                    <button 
                      type="button"
                      className={`${styles.genderOption} ${gender === 'female' ? styles.active : ''}`}
                      onClick={() => setGender('female')}
                    >
                      <FaVenus size={18} className={styles.icon} />
                      <span>Жіноча</span>
                    </button>
                    <button 
                      type="button"
                      className={`${styles.genderOption} ${gender === 'secret' ? styles.active : ''}`}
                      onClick={() => setGender('secret')}
                    >
                      <GenderIcon size={18} className={styles.icon} />
                      <span>Секрет</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Про себе</label>
                <textarea 
                  className={styles.textArea}
                  value={aboutMe} 
                  onChange={(e) => setAboutMe(e.target.value)}
                  placeholder="Розкажіть трохи про себе..."
                  rows="4"
                />
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            {isSaved ? (
              <div className={styles.successWrapper}>
                <span className={styles.successText}>
                  <FiZap size={18} className={styles.successIcon} /> Зміни збережено! Ваш аватар та банер оновлено. Тепер ви можете закрити це вікно.
                </span>
                <button className={styles.saveButton} onClick={handleClose}>
                  Закрити
                </button>
              </div>
            ) : (
              <button className={styles.saveButton} onClick={handleSave}>
                Зберегти зміни
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ОВЕРЛЕЙ ОБРІЗКИ (CROPPER REACT-EASY-CROP) */}
      {imageSrc && (
        <div className={styles.cropperOverlay} onClick={() => setImageSrc(null)}>
          <div className={styles.cropperModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.cropperHeader}>
              <h3>Обрізка зображення</h3>
            </div>
            
            <div className={styles.cropperContainer}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={cropType === 'avatar' ? 1 : 3 / 1}
                cropShape={cropType === 'avatar' ? 'round' : 'rect'}
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
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className={styles.zoomSlider}
              />
              <div className={styles.cropperButtons}>
                <button className={styles.cancelBtn} onClick={() => setImageSrc(null)}>
                  Відмінити
                </button>
                <button className={styles.cropBtn} onClick={handleCropConfirm}>
                  Обрізати
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileSettingsModal;
