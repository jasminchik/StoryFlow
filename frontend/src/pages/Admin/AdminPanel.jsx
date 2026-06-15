import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus, FiArrowLeft, FiLayout, FiDatabase, FiSearch } from 'react-icons/fi';
import Header from '../../components/Header';
import styles from './AdminPanel.module.scss';

const API_BASE = 'http://localhost:5000';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home'); // 'home' або 'titles'
  
  // States для управління головною
  const [sections, setSections] = useState([]);
  const [addMangaId, setAddMangaId] = useState('');
  
  // States для управління тайтлами
  const [allMangas, setAllMangas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);

  // Перевірка прав доступу
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      navigate('/');
    }
  }, [navigate]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      
      // Завантажуємо і секції, і всі тайтли
      const [sectionsRes, mangasRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/sections`, { headers }),
        fetch(`${API_BASE}/api/manga`) // Публічний маршрут або адмінський, якщо треба всі
      ]);

      const sectionsData = await sectionsRes.json();
      const mangasData = await mangasRes.json();

      if (sectionsData.success) {
        // Якщо секцій ще немає, створимо фейкові для UI, щоб можна було додавати
        if (sectionsData.data.length === 0) {
           setSections([
             { key: 'new_releases', title: 'Новинки', mangas: [] },
             { key: 'popular', title: 'Найпопулярніші', mangas: [] }
           ]);
        } else {
           setSections(sectionsData.data);
        }
      }
      
      if (mangasData.success) {
        setAllMangas(mangasData.data);
      }
    } catch (err) {
      console.error('Помилка завантаження даних адмін-панелі:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // --- Логіка керування секціями ---
  const handleUpdateSection = async (sectionKey, action, mangaId) => {
    if (!mangaId) return;

    try {
      const response = await fetch(`${API_BASE}/api/admin/sections/${sectionKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ action, mangaId })
      });

      const data = await response.json();
      if (data.success) {
        // Оновлюємо конкретну секцію в стейті
        setSections(prev => prev.map(s => s.key === sectionKey ? data.data : s));
        if (action === 'add') setAddMangaId('');
        alert(action === 'add' ? 'Тайтл додано до секції' : 'Тайтл прибрано з секції');
      } else {
        alert(`Помилка: ${data.error}`);
      }
    } catch (err) {
      console.error('Помилка оновлення секції:', err);
    }
  };

  // --- Логіка глобального видалення ---
  const handleDeleteManga = async (mangaId) => {
    if (!window.confirm('УВАГА! Ви впевнені, що хочете видалити цей тайтл назавжди? Разом із ним будуть видалені всі його розділи!')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/manga/${mangaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setAllMangas(prev => prev.filter(m => m._id !== mangaId));
        alert('Тайтл успішно видалено з бази');
      } else {
        alert(`Помилка: ${data.error}`);
      }
    } catch (err) {
      console.error('Помилка видалення тайтлу:', err);
    }
  };

  const filteredMangas = allMangas.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m._id.includes(searchQuery)
  );

  return (
    <div className={styles.adminWrapper}>
      <Header />
      
      <div className={styles.adminContainer}>
        <div className={styles.adminHeader}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <FiArrowLeft size={24} />
          </button>
          <h1>Панель Адміністратора</h1>
        </div>

        <div className={styles.adminTabs}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'home' ? styles.active : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <FiLayout /> Головна сторінка
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'titles' ? styles.active : ''}`}
            onClick={() => setActiveTab('titles')}
          >
            <FiDatabase /> Всі Тайтли
          </button>
        </div>

        <div className={styles.adminContent}>
          {isLoading ? (
            <div className={styles.loading}>Завантаження даних...</div>
          ) : (
            <>
              {/* Вкладка: Головна сторінка */}
              {activeTab === 'home' && (
                <div className={styles.sectionsManager}>
                  {sections.map(section => (
                    <div key={section.key} className={styles.sectionBlock}>
                      <div className={styles.sectionHeader}>
                        <h2>Секція: {section.title} <span>({section.key})</span></h2>
                        <div className={styles.addAction}>
                          <input 
                            type="text" 
                            placeholder="Введіть ID манґи..."
                            value={addMangaId}
                            onChange={(e) => setAddMangaId(e.target.value)}
                          />
                          <button 
                            className={styles.addBtn}
                            onClick={() => handleUpdateSection(section.key, 'add', addMangaId)}
                          >
                            <FiPlus /> Додати
                          </button>
                        </div>
                      </div>

                      <div className={styles.sectionItems}>
                        {section.mangas && section.mangas.length > 0 ? (
                          section.mangas.map(manga => (
                            <div key={manga._id} className={styles.mangaRow}>
                              <div className={styles.mangaInfo}>
                                <img src={manga.coverImage ? (manga.coverImage.startsWith('http') ? manga.coverImage : `${API_BASE}${manga.coverImage}`) : ''} alt={manga.title} />
                                <div>
                                  <div className={styles.mangaTitle}>{manga.title}</div>
                                  <div className={styles.mangaId}>ID: {manga._id}</div>
                                </div>
                              </div>
                              <button 
                                className={styles.removeBtn}
                                onClick={() => handleUpdateSection(section.key, 'remove', manga._id)}
                              >
                                Прибрати з головної
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className={styles.emptyText}>Ця секція порожня. На головній будуть виводитись автоматичні дані.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Вкладка: Всі Тайтли */}
              {activeTab === 'titles' && (
                <div className={styles.titlesManager}>
                  <div className={styles.searchBar}>
                    <FiSearch className={styles.searchIcon} />
                    <input 
                      type="text" 
                      placeholder="Пошук за назвою або ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className={styles.tableWrapper}>
                    <table className={styles.adminTable}>
                      <thead>
                        <tr>
                          <th>Обкладинка</th>
                          <th>Назва</th>
                          <th>ID</th>
                          <th>Тип</th>
                          <th>Дія</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMangas.map(manga => (
                          <tr key={manga._id}>
                            <td>
                              <img className={styles.tableImg} src={manga.coverImage ? (manga.coverImage.startsWith('http') ? manga.coverImage : `${API_BASE}${manga.coverImage}`) : ''} alt={manga.title} />
                            </td>
                            <td className={styles.primaryText}>{manga.title}</td>
                            <td className={styles.mutedText}>{manga._id}</td>
                            <td>{manga.type}</td>
                            <td>
                              <button 
                                className={styles.deleteBtn}
                                onClick={() => handleDeleteManga(manga._id)}
                              >
                                <FiTrash2 /> Видалити з кінцями
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredMangas.length === 0 && <p className={styles.emptyText}>Тайтлів не знайдено</p>}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
