import React from 'react';
import styles from './Footer.module.scss';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        <span className={styles.logo}>StoryFlow</span>
        <span className={styles.copyright}>© 2026 StoryFlow. Всі права захищені.</span>
      </div>
      <div className={styles.right}>
        <span className={styles.contact}>
          Для зв'язку: <a href="mailto:jecamenlpl@gmail.com">jecamenlpl@gmail.com</a>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
