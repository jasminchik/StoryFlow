import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus, FiArrowLeft, FiLayout, FiDatabase, FiSearch } from 'react-icons/fi';
import Header from '../../components/Header';
import ConfirmationModal from '../../components/ConfirmationModal';
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
  const [newsData, setNewsData] = useState({ title: '', content: '', category: 'Інше', mangaId: '' });
  const [newsList, setNewsList] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // { id: string, type: 'news' | 'announcement' | 'manga' }
  
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
      
      const [sectionsRes, titlesRes, newsRes, announcementsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/sections`, { headers }),
        fetch(`${API_BASE}/api/admin/all-titles`, { headers }),
        fetch(`${API_BASE}/api/news`),
        fetch(`${API_BASE}/api/announcements`)
      ]);

      const sectionsData = await sectionsRes.json();
      const titlesData = await titlesRes.json();
      const newsData = await newsRes.json();
      const announcementsData = await announcementsRes.json();

      if (sectionsData.success) {
        if (sectionsData.data.length === 0) {
           setSections([
             { key: 'new_releases', title: 'Новинки', mangas: [] },
             { key: 'popular', title: 'Найпопулярніші', mangas: [] },
             { key: 'reading_now', title: 'Читають зараз', mangas: [] },
             { key: 'books', title: 'Навчальні книги', mangas: [] }
           ]);
        } else {
           setSections(sectionsData.data);
        }
      }
      
      if (titlesData.success) {
        setAllMangas(titlesData.data);
      }

      // Об'єднуємо новини сайту та новини тайтлів
      let combinedNews = [];
      if (newsData.success && Array.isArray(newsData.data)) {
        combinedNews = [...combinedNews, ...newsData.data.map(n => ({ ...n, _type: 'news' }))];
      }
      if (announcementsData.success && Array.isArray(announcementsData.data)) {
        combinedNews = [...combinedNews, ...announcementsData.data.map(a => ({ ...a, _type: 'announcement' }))];
      }
      
      // Сортуємо від найновіших до найстаріших
      combinedNews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNewsList(combinedNews);

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
    if (!newsData.title || !newsData.content) {
      showStatus('Заповніть заголовок та текст новини', 'error');
      return;
    }

    try {
      let response;
      if (newsData.mangaId) {
        // Якщо обрано тайтл - створюємо Announcement (для вкладки "Оновлення тайтлів")
        response = await fetch(`${API_BASE}/api/announcements`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({
            title: newsData.title,
            content: newsData.content,
            manga: newsData.mangaId,
            category: 'manga_update'
          })
        });
      } else {
        // Загальна новина сайту
        response = await fetch(`${API_BASE}/api/admin/news`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({
            title: newsData.title,
            content: newsData.content,
            category: newsData.category
          })
        });
      }

      if (response.ok) {
        showStatus('Новину успішно опубліковано!');
        setNewsData({ title: '', content: '', category: 'Інше', mangaId: '' });
        fetchAdminData(); // Оновлюємо список
      } else {
        const data = await response.json();
        showStatus(`Помилка: ${data.error}`, 'error');
      }
    } catch (err) { 
      console.error(err);
      showStatus('Помилка з\'єднання з сервером', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      let response;
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };

      if (itemToDelete.type === 'manga') {
        // Використовуємо основний маршрут видалення манґи, бо він каскадний і повний
        response = await fetch(`${API_BASE}/api/manga/${itemToDelete.id}`, { method: 'DELETE', headers });
      } else if (itemToDelete.type === 'literature') {
        // Видалення фанфіків/літератури
        response = await fetch(`${API_BASE}/api/literature/${itemToDelete.id}`, { method: 'DELETE', headers });
      } else if (itemToDelete.type === 'announcement') {
        // Видалення новин тайтлів
        response = await fetch(`${API_BASE}/api/announcements/${itemToDelete.id}`, { method: 'DELETE', headers });
      } else if (itemToDelete.type === 'news') {
        // Видалення загальних новин сайту
        response = await fetch(`${API_BASE}/api/admin/news/${itemToDelete.id}`, { method: 'DELETE', headers });
      }

      if (response && response.ok) {
        showStatus('Успішно видалено');
        if (itemToDelete.type === 'manga' || itemToDelete.type === 'literature') {
          setAllMangas(prev => prev.filter(m => m._id !== itemToDelete.id));
        } else {
          fetchAdminData();
        }
      } else {
        const errData = await (response ? response.json() : { error: 'Невідома помилка' });
        showStatus(`Помилка: ${errData.error || 'при видаленні'}`, 'error');
      }
    } catch (err) {
      console.error('Помилка при видаленні:', err);
      showStatus('Помилка сервера', 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteClick = (id, type) => {
    setItemToDelete({ id, type });
    setIsDeleteModalOpen(true);
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

  const filteredMangas = allMangas.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m._id.includes(searchQuery)
  );

  const formatStatus = (status) => {
    switch (status) {
      case 'Анонс': return 'Анонс';
      case 'В процесі':
      case 'in_progress': return 'В процесі';
      case 'Завершено':
      case 'completed': return 'Завершено';
      case 'Призупинено':
      case 'dropped': return 'Призупинено';
      default: return status || 'Невідомо';
    }
  };

  const getDeleteModalInfo = () => {
    if (!itemToDelete) return { title: 'Підтвердження', message: 'Ви впевнені?' };
    if (itemToDelete.type === 'manga' || itemToDelete.type === 'literature') {
      return {
        title: 'Видалити твір?',
        message: 'Ви впевнені? Це видалить тайтл та всі його розділи, коментарі і списки НАЗАВЖДИ!'
      };
    }
    return {
      title: 'Видалити новину?',
      message: 'Ви впевнені, що хочете видалити цю новину? Цю дію неможливо скасувати.'
    };
  };

  const deleteInfo = getDeleteModalInfo();

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
                      <option value="reading_now">Читають зараз</option>
                      <option value="books">Навчальні книги</option>
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
                <div className={styles.titlesManagerV2}>
                  <div className={styles.managerHeader}>
                    <div className={styles.headerInfo}>
                      <h2>Керування контентом</h2>
                      <p>Усього тайтлів у базі: <strong>{allMangas.length}</strong></p>
                    </div>
                    <div className={styles.searchBox}>
                      <FiSearch className={styles.searchIcon} />
                      <input 
                        type="text" 
                        placeholder="Шукати за назвою або ID..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                      />
                      {searchQuery && (
                        <button className={styles.clearSearch} onClick={() => setSearchQuery('')}>
                          <FiX />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className={styles.tableCard}>
                    <div className={styles.tableWrapper}>
                      <table className={styles.modernTable}>
                        <thead>
                          <tr>
                            <th>Обкладинка</th>
                            <th>Назва твору</th>
                            <th>Тип</th>
                            <th>Статус</th>
                            <th className={styles.actionsCell}>Дії</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMangas.length > 0 ? (
                            filteredMangas.map(manga => (
                              <tr key={manga._id}>
                                <td>
                                  <div className={styles.titleCover}>
                                    <img src={manga.coverImage ? (manga.coverImage.startsWith('http') ? manga.coverImage : `${API_BASE}${manga.coverImage}`) : ''} alt="" />
                                  </div>
                                </td>
                                <td>
                                  <div className={styles.titleMainInfo}>
                                    <span className={styles.titleText}>{manga.title}</span>
                                    <span className={styles.titleId}>ID: {manga._id}</span>
                                  </div>
                                </td>
                                <td>
                                  <span className={`${styles.typeBadge} ${styles[manga.type] || styles.other}`}>
                                    {manga.type || 'Фанфік'}
                                  </span>
                                </td>
                                <td>
                                  <span className={`${styles.statusText} ${styles[manga.status === 'in_progress' ? 'В процесі' : manga.status] || styles.pending}`}>
                                    {formatStatus(manga.status)}
                                  </span>
                                </td>
                                <td className={styles.actionsCell}>
                                  <div className={styles.actionButtons}>
                                    <button 
                                      className={styles.editBtnV2} 
                                      onClick={() => navigate(`/edit-manga/${manga._id}`)}
                                      title="Редагувати"
                                    >
                                      ⚙️
                                    </button>
                                    <button 
                                      className={styles.deleteBtnV2} 
                                      onClick={() => handleDeleteClick(manga._id, manga.resourceType || 'manga')}
                                      title="Видалити"
                                    >
                                      <FiTrash2 size={18} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className={styles.emptyRow}>
                                <p>За вашим запитом нічого не знайдено</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'news' && (
                <div className={styles.newsManagerV2}>
                  <div className={styles.newsHeader}>
                    <div className={styles.headerText}>
                      <h2>Керування новинами</h2>
                      <p>Створюйте та видаляйте новини для головної сторінки</p>
                    </div>
                  </div>

                  <div className={styles.newsGrid}>
                    <div className={styles.newsFormCard}>
                      <h3><FiPlus /> Нова публікація</h3>
                      <div className={styles.formBody}>
                        <div className={styles.inputGroup}>
                          <label>Заголовок новини</label>
                          <input 
                            type="text" 
                            placeholder="Введіть заголовок..." 
                            value={newsData.title} 
                            onChange={e => setNewsData({...newsData, title: e.target.value})} 
                          />
                        </div>

                        <div className={styles.inputGroup}>
                          <label>Тайтл (якщо новина про твір)</label>
                          <select 
                            value={newsData.mangaId} 
                            onChange={e => setNewsData({...newsData, mangaId: e.target.value})}
                          >
                            <option value="">-- Загальна новина сайту --</option>
                            {allMangas.map(m => (
                              <option key={m._id} value={m._id}>{m.title} ({m.type})</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className={styles.inputGroup}>
                          <label>Категорія</label>
                          <select 
                            value={newsData.category} 
                            onChange={e => setNewsData({...newsData, category: e.target.value})}
                          >
                            <option value="Системні">⚙️ Системні</option>
                            <option value="Оновлення">🚀 Оновлення</option>
                            <option value="Важливе">🔔 Важливе</option>
                            <option value="Інше">📝 Інше</option>
                          </select>
                        </div>

                        <div className={styles.inputGroup}>
                          <label>Текст новини</label>
                          <textarea 
                            placeholder="Про що хочете розповісти?..." 
                            rows="6" 
                            value={newsData.content} 
                            onChange={e => setNewsData({...newsData, content: e.target.value})}
                          ></textarea>
                        </div>

                        <button onClick={handlePublishNews} className={styles.publishBtn}>
                          Опублікувати новину
                        </button>
                      </div>
                    </div>

                    <div className={styles.newsListCard}>
                      <h3>Останні новини ({newsList.length})</h3>
                      <div className={styles.newsScrollList}>
                        {newsList.length > 0 ? (
                          newsList.map((news) => (
                            <div key={news._id} className={styles.newsItem}>
                              <div className={styles.newsMain}>
                                <div className={styles.newsTop}>
                                  <span className={`${styles.newsBadge} ${styles[news.category] || styles.other}`}>
                                    {news.category || (news._type === 'announcement' ? 'Тайтл' : 'Інше')}
                                  </span>
                                  <span className={styles.newsDate}>
                                    {new Date(news.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <h4 className={styles.newsTitle}>
                                  {news._type === 'announcement' && news.manga ? `[${news.manga.title}] ` : ''}
                                  {news.title}
                                </h4>
                                <p className={styles.newsSnippet}>{news.content.substring(0, 80)}...</p>
                              </div>
                              <button 
                                className={styles.deleteNewsBtn} 
                                onClick={() => handleDeleteClick(news._id, news._type)}
                                title="Видалити"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className={styles.emptyNews}>
                            <FiDatabase size={40} />
                            <p>Ще немає опублікованих новин</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title={deleteInfo.title}
        message={deleteInfo.message}
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
      />

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
