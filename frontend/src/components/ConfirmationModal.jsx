import React from 'react';
import { FiTrash2, FiAlertTriangle, FiX } from 'react-icons/fi';
import styles from './ConfirmationModal.module.scss';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  const isDeleteAction = title?.toLowerCase().includes('видалити') || title?.toLowerCase().includes('delete');

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onCancel}>
          <FiX size={20} />
        </button>

        <div className={styles.iconWrapper}>
          {isDeleteAction ? (
            <div className={styles.deleteIcon}>
              <FiTrash2 size={32} />
            </div>
          ) : (
            <div className={styles.infoIcon}>
              <FiAlertTriangle size={32} />
            </div>
          )}
        </div>

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
          <button 
            className={`${styles.confirmBtn} ${isDeleteAction ? styles.danger : ''}`} 
            onClick={onConfirm}
          >
            {isDeleteAction ? 'Так, видалити' : 'Підтвердити'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
