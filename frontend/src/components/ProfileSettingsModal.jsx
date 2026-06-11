import React, { useState, useEffect } from 'react';
import styles from './ProfileSettingsModal.module.scss';

const ProfileSettingsModal = ({ isOpen, onClose }) => {
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('');
  const [banner, setBanner] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [gender, setGender] = useState('secret');

  useEffect(() => {
    if (isOpen) {
      const storedData = JSON.parse(localStorage.getItem('user_profile_data') || '{}');
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      setNickname(storedData.nickname || currentUser.username || '');
      setAvatar(storedData.avatar || '');
      setBanner(storedData.banner || '');
      setAboutMe(storedData.aboutMe || '');
      setGender(storedData.gender || 'secret');
      
      // Prevent scrolling of body when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSave = () => {
    const profileData = {
      nickname,
      avatar,
      banner,
      aboutMe,
      gender
    };
    
    localStorage.setItem('user_profile_data', JSON.stringify(profileData));
    
    // Also update the 'user' object if nickname changed to keep sync (optional but good)
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.username) {
      // Note: In a real app, nickname and username might be different, 
      // but here we might want to reflect the choice.
    }

    // Custom event to notify other components (like Profile.jsx) that data changed
    window.dispatchEvent(new Event('profileUpdate'));
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Налаштування профілю</h2>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.content}>
          <div className={styles.imageUploads}>
            <div className={styles.bannerUpload}>
              <div 
                className={styles.bannerPreview} 
                style={{ backgroundImage: banner ? `url(${banner})` : 'none' }}
              >
                {!banner && <div className={styles.bannerPlaceholder}>Фоновий банер</div>}
                <div className={styles.uploadOverlay}>
                  <span>📷</span>
                </div>
              </div>
              <input 
                type="text" 
                placeholder="URL банера" 
                value={banner} 
                onChange={(e) => setBanner(e.target.value)}
                className={styles.urlInput}
              />
            </div>

            <div className={styles.avatarUpload}>
              <div className={styles.avatarPreview}>
                {avatar ? (
                  <img src={avatar} alt="Avatar Preview" />
                ) : (
                  <div className={styles.avatarPlaceholder}>{nickname ? nickname.charAt(0).toUpperCase() : '?'}</div>
                )}
                <div className={styles.uploadOverlay}>
                  <span>📷</span>
                </div>
              </div>
              <input 
                type="text" 
                placeholder="URL аватарки" 
                value={avatar} 
                onChange={(e) => setAvatar(e.target.value)}
                className={styles.urlInput}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Нікнейм</label>
            <input 
              type="text" 
              value={nickname} 
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Введіть ваш нікнейм"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Про себе</label>
            <textarea 
              value={aboutMe} 
              onChange={(e) => setAboutMe(e.target.value)}
              placeholder="Розкажіть трохи про себе..."
              rows="4"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Стать</label>
            <div className={styles.genderSelection}>
              <label className={`${styles.genderLabel} ${gender === 'male' ? styles.active : ''}`}>
                <input 
                  type="radio" 
                  name="gender" 
                  value="male" 
                  checked={gender === 'male'} 
                  onChange={() => setGender('male')}
                />
                Чоловіча
              </label>
              <label className={`${styles.genderLabel} ${gender === 'female' ? styles.active : ''}`}>
                <input 
                  type="radio" 
                  name="gender" 
                  value="female" 
                  checked={gender === 'female'} 
                  onChange={() => setGender('female')}
                />
                Жіноча
              </label>
              <label className={`${styles.genderLabel} ${gender === 'secret' ? styles.active : ''}`}>
                <input 
                  type="radio" 
                  name="gender" 
                  value="secret" 
                  checked={gender === 'secret'} 
                  onChange={() => setGender('secret')}
                />
                Секрет
              </label>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.saveBtn} onClick={handleSave}>
            Зберегти зміни
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsModal;
