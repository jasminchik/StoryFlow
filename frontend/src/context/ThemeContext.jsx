import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Відновлюємо тему з localStorage при першому завантаженні, 
    // але якщо її немає — залишаємо 'dark'
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  const toggleTheme = (event) => {
    const x = event.clientX;
    const y = event.clientY;
    
    // Розраховуємо кінцевий радіус для кругової маски
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const isDarkMode = theme === 'dark';

    // Додаємо клас для відключення переходів
    document.documentElement.classList.add('theme-transitioning');

    // Якщо View Transitions API не підтримується
    if (!document.startViewTransition) {
      setTheme(isDarkMode ? 'light' : 'dark');
      document.documentElement.classList.remove('theme-transitioning');
      return;
    }

    // Викликаємо перехід
    const transition = document.startViewTransition(() => {
      setTheme(isDarkMode ? 'light' : 'dark');
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      document.documentElement.animate(
        {
          clipPath: clipPath,
        },
        {
          duration: 400, // Трохи швидше для миттєвого відгуку
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });

    // Видаляємо клас після завершення анімації
    transition.finished.then(() => {
      document.documentElement.classList.remove('theme-transitioning');
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
