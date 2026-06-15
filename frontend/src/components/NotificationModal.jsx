import React from 'react';
import styles from './NotificationModal.module.scss';

const NotificationModal = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.content}>
          <p>{message}</p>
        </div>
        <button className={styles.okBtn} onClick={onClose}>
          ОК
        </button>
      </div>
    </div>
  );
};

export default NotificationModal;
