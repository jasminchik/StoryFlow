import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus, FiArrowLeft, FiLayout, FiDatabase, FiSearch } from 'react-icons/fi';
import Header from '../../components/Header';
import styles from './AdminPanel.module.scss';

const API_BASE = 'http://localhost:5000';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'titles', 'news'
  
  // States для управління головною
  const [sections, setSections] = useState([]);
  const [addMangaId, setAddMangaId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('new_releases');
  
  // States для управління тайтлами
  const [allMangas, setAllMangas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // States для новин
  const [newsData, setNewsData] = useState({ title: '', content: '', category: 'Інше' });
  
  // Toast Notification System
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showStatus = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };
  
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
      
      const [sectionsRes, titlesRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/sections`, { headers }),
        fetch(`${API_BASE}/api/admin/all-titles`, { headers })
      ]);

      const sectionsData = await sectionsRes.json();
      const titlesData = await titlesRes.json();

      if (sectionsData.success) {
        if (sectionsData.data.length === 0) {
           setSections([
             { key: 'new_releases', title: 'Новинки', mangas: [] },
             { key: 'popular', title: 'Найпопулярніші', mangas: [] }
           ]);
        } else {
           setSections(sectionsData.data);
        }
      }
      
      if (titlesData.success) {
        setAllMangas(titlesData.data);
      }
    } catch (err) {
      console.error('Помилка завантаження даних:', err);
      showStatus('Помилка завантаження даних', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handlePublishNews = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(newsData)
      });
      if (response.ok) {
        showStatus('Новину успішно опубліковано!');
        setNewsData({ title: '', content: '', category: 'Інше' });
      } else {
        const data = await response.json();
        showStatus(`Помилка: ${data.error}`, 'error');
      }
    } catch (err) { 
      console.error(err);
      showStatus('Помилка з\'єднання з сервером', 'error');
    }
  };

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
        setSections(prev => prev.map(s => s.key === sectionKey ? data.data : s));
        if (action === 'add') setAddMangaId('');
        showStatus(action === 'add' ? 'Тайтл додано до секції' : 'Тайтл прибрано з секції');
      } else {
        showStatus(`Помилка: ${data.error}`, 'error');
      }
    } catch (err) {
      showStatus('Помилка оновлення секції', 'error');
    }
  };

  const handleDeleteManga = async (mangaId) => {
    if (!window.confirm('Ви впевнені? Це видалить тайтл та всі його розділи НАЗАВЖДИ!')) return;

    try {
      const response = await fetch(`${API_BASE}/api/admin/manga/${mangaId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        setAllMangas(prev => prev.filter(m => m._id !== mangaId));
        showStatus('Тайтл успішно видалено');
      } else {
        showStatus('Помилка при видаленні', 'error');
      }
    } catch (err) {
      showStatus('Помилка сервера', 'error');
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
          <button className={`${styles.tabBtn} ${activeTab === 'home' ? styles.active : ''}`} onClick={() => setActiveTab('home')}>
            <FiLayout /> Головна сторінка
          </button>
          <button className={`${styles.tabBtn} ${activeTab === 'titles' ? styles.active : ''}`} onClick={() => setActiveTab('titles')}>
            <FiDatabase /> Всі Тайтли
          </button>
          <button className={`${styles.tabBtn} ${activeTab === 'news' ? styles.active : ''}`} onClick={() => setActiveTab('news')}>
            Новини сайту
          </button>
        </div>

        <div className={styles.adminContent}>
          {isLoading ? (
            <div className={styles.loading}>Завантаження даних...</div>
          ) : (
            <>
              {activeTab === 'home' && (
                <div className={styles.sectionsManager}>
                  <div className={styles.globalAddAction}>
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={styles.categorySelect}>
                      <option value="new_releases">Новинки</option>
                      <option value="popular">Найпопулярніші</option>
                      <option value="admin_choice">Вибір адміна</option>
                    </select>
                    <select value={addMangaId} onChange={(e) => setAddMangaId(e.target.value)} className={styles.addInput}>
                      <option value="">-- Оберіть тайтл --</option>
                      {allMangas.map(item => (
                        <option key={item._id} value={item._id}>{item.title} ({item.type || 'Фанфік'})</option>
                      ))}
                    </select>
                    <button className={styles.addBtn} onClick={() => handleUpdateSection(selectedCategory, 'add', addMangaId)}>
                      <FiPlus /> Додати
                    </button>
                  </div>

                  {sections.map(section => (
                    <div key={section.key} className={styles.sectionBlock}>
                      <div className={styles.sectionHeader}>
                        <h2>Секція: {section.title} <span>({section.key})</span></h2>
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
                              <button className={styles.removeBtn} onClick={() => handleUpdateSection(section.key, 'remove', manga._id)}>Прибрати</button>
                            </div>
                          ))
                        ) : <p className={styles.emptyText}>Порожньо</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'titles' && (
                <div className={styles.titlesManager}>
                  <div className={styles.searchBar}>
                    <FiSearch className={styles.searchIcon} />
                    <input type="text" placeholder="Пошук..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                  <div className={styles.tableWrapper}>
                    <table className={styles.adminTable}>
                      <thead>
                        <tr><th>Обкладинка</th><th>Назва</th><th>Тип</th><th>Дія</th></tr>
                      </thead>
                      <tbody>
                        {filteredMangas.map(manga => (
                          <tr key={manga._id}>
                            <td><img className={styles.tableImg} src={manga.coverImage ? (manga.coverImage.startsWith('http') ? manga.coverImage : `${API_BASE}${manga.coverImage}`) : ''} alt="" /></td>
                            <td className={styles.primaryText}>{manga.title}</td>
                            <td>{manga.type || 'Фанфік'}</td>
                            <td>
                              <button className={styles.editBtn} onClick={() => navigate(`/edit-manga/${manga._id}`)}>⚙️</button>
                              <button className={styles.deleteBtn} onClick={() => handleDeleteManga(manga._id)}><FiTrash2 /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'news' && (
                <div className={styles.newsManager}>
                  <h2>Опублікувати новину</h2>
                  <div className={styles.newsForm}>
                    <input type="text" placeholder="Заголовок" value={newsData.title} onChange={e => setNewsData({...newsData, title: e.target.value})} className={styles.newsInput} />
                    <select value={newsData.category} onChange={e => setNewsData({...newsData, category: e.target.value})} className={styles.newsInput} style={{ marginBottom: '15px' }}>
                      <option value="Системні">Системні</option>
                      <option value="Оновлення">Оновлення</option>
                      <option value="Важливе">Важливе</option>
                      <option value="Інше">Інше</option>
                    </select>
                    <textarea placeholder="Текст..." rows="5" value={newsData.content} onChange={e => setNewsData({...newsData, content: e.target.value})} className={styles.newsTextarea}></textarea>
                    <button onClick={handlePublishNews} className={styles.addBtn} style={{ background: '#ff4757', color: 'white', fontWeight: 'bold' }}>Опублікувати</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      <div className={`${styles.toast} ${toast.show ? styles.show : ''} ${toast.type === 'error' ? styles.errorToast : ''}`}>
        <div className={styles.toastContent}>
          {toast.type === 'success' ? '✅' : '❌'}
          <span>{toast.message}</span>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
