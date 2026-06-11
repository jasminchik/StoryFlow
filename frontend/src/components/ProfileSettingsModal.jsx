import React, { useState, useEffect, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import styles from './ProfileSettingsModal.module.scss';

const ProfileSettingsModal = ({ isOpen, onClose }) => {
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('');
  const [banner, setBanner] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [gender, setGender] = useState('secret');

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
    if (isOpen) {
      const storedData = JSON.parse(localStorage.getItem('user_profile_data') || '{}');
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      setNickname(storedData.nickname || currentUser.username || '');
      setAvatar(storedData.avatar || '');
      setBanner(storedData.banner || '');
      setAboutMe(storedData.aboutMe || '');
      setGender(storedData.gender || 'secret');
      
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setImageSrc(null); // Скидаємо кроппер при закритті
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSave = () => {
    const profileData = { nickname, avatar, banner, aboutMe, gender };
    localStorage.setItem('user_profile_data', JSON.stringify(profileData));
    window.dispatchEvent(new Event('profileUpdate'));
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
      <div className={styles.backdrop} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <h2>Налаштування профілю</h2>
            <button className={styles.closeBtn} onClick={onClose}>&times;</button>
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
                  <span className={styles.dropIcon}>☁️</span>
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
                  <span className={styles.dropIcon}>☁️</span>
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
                  <select 
                    className={styles.selectInput}
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="secret">Секрет</option>
                    <option value="male">Чоловіча</option>
                    <option value="female">Жіноча</option>
                  </select>
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
            <button className={styles.saveButton} onClick={handleSave}>
              Зберегти зміни
            </button>
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
