const express = require('express');
const router = express.Router();
const Manga = require('../models/Manga');
const Chapter = require('../models/Chapter');
const Literature = require('../models/Literature');
const LiteratureChapter = require('../models/LiteratureChapter');
const MainSection = require('../models/MainSection');
const News = require('../models/News');
const { protect, authorize } = require('../middleware/auth');

// Middleware для жорсткої перевірки адміна
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, error: 'Доступ заборонено. Тільки для адміністраторів.' });
  }
};

/**
 * @route   POST /api/admin/news
 * @desc    Створити новину сайту
 * @access  Private (Admin)
 */
router.post('/news', protect, isAdmin, async (req, res) => {
  try {
    const news = await News.create(req.body);
    res.status(201).json({ success: true, data: news });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   DELETE /api/admin/news/:id
 * @desc    Видалити новину сайту
 * @access  Private (Admin)
 */
router.delete('/news/:id', protect, isAdmin, async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ success: false, error: 'Новину не знайдено' });
    }
    await news.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/admin/sections
 * @desc    Отримати всі секції головної сторінки
 * @access  Private (Admin)
 */
router.get('/sections', protect, isAdmin, async (req, res) => {
  try {
    const sections = await MainSection.find().populate('mangas');
    res.status(200).json({ success: true, data: sections });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/admin/sections
 * @desc    Створити нову секцію (службовий ендпоінт)
 * @access  Private (Admin)
 */
router.post('/sections', protect, isAdmin, async (req, res) => {
  try {
    const section = await MainSection.create(req.body);
    res.status(201).json({ success: true, data: section });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   PUT /api/admin/sections/:key
 * @desc    Оновити список манг у секції
 * @access  Private (Admin)
 */
router.put('/sections/:key', protect, isAdmin, async (req, res) => {
  try {
    const { action, mangaId } = req.body; // action: 'add' або 'remove'

    let section = await MainSection.findOne({ key: req.params.key });

    // Якщо секції ще немає, створюємо її базову версію
    if (!section) {
      const titles = {
        'new_releases': 'Новинки',
        'popular': 'Найпопулярніші',
        'reading_now': 'Читають зараз'
      };
      section = await MainSection.create({ 
        key: req.params.key, 
        title: titles[req.params.key] || req.params.key,
        mangas: [] 
      });
    }

    if (action === 'add') {
      if (!section.mangas.includes(mangaId)) {
        section.mangas.push(mangaId);
      }
    } else if (action === 'remove') {
      section.mangas = section.mangas.filter(id => id.toString() !== mangaId);
    }

    await section.save();
    
    // Повертаємо оновлену секцію з populate
    const updatedSection = await MainSection.findById(section._id).populate('mangas');

    res.status(200).json({ success: true, data: updatedSection });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   DELETE /api/admin/manga/:id
 * @desc    Повне каскадне видалення манґи
 * @access  Private (Admin)
 */
router.delete('/manga/:id', protect, isAdmin, async (req, res) => {
  try {
    const mangaId = req.params.id;
    const manga = await Manga.findById(mangaId);
    
    if (!manga) {
      return res.status(404).json({ success: false, error: 'Манґу не знайдено' });
    }

    // Каскадне видалення всіх пов'язаних даних
    const Comment = require('../models/Comment');
    const Rating = require('../models/Rating');
    const History = require('../models/History');
    const UserList = require('../models/UserList');
    const Literature = require('../models/Literature');
    const LiteratureChapter = require('../models/LiteratureChapter');

    // 1. Знаходимо всі пов'язані фанфіки (Literature)
    const relatedLit = await Literature.find({ manga: mangaId });
    const litIds = relatedLit.map(l => l._id);

    await Promise.all([
      Chapter.deleteMany({ mangaId: mangaId }),
      Comment.deleteMany({ resourceId: mangaId, resourceType: 'Manga' }),
      Rating.deleteMany({ manga: mangaId }),
      History.deleteMany({ manga: mangaId }),
      UserList.deleteMany({ manga: mangaId }),
      Literature.deleteMany({ manga: mangaId }),
      LiteratureChapter.deleteMany({ literature: { $in: litIds } })
    ]);

    // Видалення самої манґи
    await manga.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Admin Manga Delete Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/admin/all-titles
 * @desc    Отримати всі тайтли (Манґа + Фанфіки) для адмін-панелі
 * @access  Private (Admin)
 */
router.get('/all-titles', protect, isAdmin, async (req, res) => {
  try {
    const [mangas, fanfics] = await Promise.all([
      Manga.find().select('title type coverImage createdAt'),
      Literature.find().select('title type direction coverImage createdAt')
    ]);

    // Додаємо мітку ресурсу для фронтенду
    const formattedMangas = mangas.map(m => ({
      ...m.toObject(),
      resourceType: 'manga'
    }));

    const formattedFanfics = fanfics.map(f => ({
      ...f.toObject(),
      resourceType: 'literature',
      type: f.type || 'Фанфік'
    }));

    res.status(200).json({ 
      success: true, 
      data: [...formattedMangas, ...formattedFanfics].sort((a, b) => b.createdAt - a.createdAt)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
