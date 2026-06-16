import React from 'react';
import styles from './ConfirmationModal.module.scss';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{title || 'Підтвердження'}</h3>
        </div>
        <div className={styles.content}>
          <p>{message}</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            Скасувати
          </button>
          <button className={styles.confirmBtn} onClick={onConfirm}>
            Видалити
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
