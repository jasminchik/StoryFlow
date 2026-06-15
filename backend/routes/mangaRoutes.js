const express = require('express');
const router = express.Router();
const Manga = require('../models/Manga');
const Literature = require('../models/Literature');
const Rating = require('../models/Rating');
const { protect, authorize, isOwnerOrAdmin } = require('../middleware/auth');
const upload = require('../config/upload');

/**
 * @route   GET /api/manga
 * @desc    Отримати список усіх тайтлів
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Звичайні користувачі бачать тільки схвалені твори
    let query = { moderationStatus: 'approved' };
    
    // Якщо передано all=true, перевіряємо чи це адмін (через заголовок або просто дозволяємо якщо запит з адмінки)
    // Для публічного сайдбару ми все одно показуємо approved, але цей параметр допоможе в інших місцях
    if (req.query.all === 'true') {
      query = {};
    }
    
    const manga = await Manga.find(query)
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: manga.length,
      data: manga
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/manga/my-titles
 * @desc    Отримати тайтли, створені поточним користувачем
 * @access  Private (Author, Admin)
 */
router.get('/my-titles', protect, authorize('author', 'admin'), async (req, res) => {
  try {
    const manga = await Manga.find({ author: req.user.id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: manga.length,
      data: manga
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   PATCH /api/manga/:id/moderation
 * @desc    Змінити статус модерації тайтлу
 * @access  Private (Admin)
 */
router.patch('/:id/moderation', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Некоректний статус модерації' });
    }

    const manga = await Manga.findByIdAndUpdate(
      req.params.id,
      { moderationStatus: status },
      { new: true, runValidators: true }
    );

    if (!manga) {
      return res.status(404).json({ success: false, error: 'Твір не знайдено' });
    }

    res.status(200).json({ success: true, data: manga });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/manga/home
 * @desc    Отримати тайтли для головної сторінки (Новинки та Популярні)
 * @access  Public
 */
router.get('/home', async (req, res) => {
  try {
    const MainSection = require('../models/MainSection');
    
    // Спробуємо отримати кастомні секції
    const sections = await MainSection.find().populate({
      path: 'mangas',
      populate: { path: 'author', select: 'username' }
    });

    let newArrivals = [];
    let topRated = [];

    const customNew = sections.find(s => s.key === 'new_releases');
    const customPopular = sections.find(s => s.key === 'popular');

    if (customNew && customNew.mangas.length > 0) {
      newArrivals = customNew.mangas;
    } else {
      // Fallback: автоматичне сортування
      newArrivals = await Manga.find()
        .populate('author', 'username')
        .sort({ createdAt: -1 })
        .limit(8);
    }

    if (customPopular && customPopular.mangas.length > 0) {
      topRated = customPopular.mangas;
    } else {
      // Fallback: автоматичне сортування
      const approvedQuery = { moderationStatus: 'approved' };
      topRated = await Manga.find(approvedQuery)
        .populate('author', 'username')
        .sort({ averageRating: -1, ratingCount: -1 })
        .limit(8);
    }

    res.status(200).json({
      success: true,
      data: {
        newArrivals,
        topRated
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/manga/search
 * @desc    Пошук тайтлів
 * @access  Public
 */
router.get('/search', async (req, res) => {
  try {
    const { q, type } = req.query;
    
    if (!q) {
      return res.status(200).json({ success: true, data: [] });
    }

    const query = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { alternativeTitle: { $regex: q, $options: 'i' } }
      ]
    };

    if (type) {
      if (type === 'manhwa') {
        query.type = { $regex: 'манхва|manhwa', $options: 'i' };
      } else if (type === 'manga') {
        query.type = { $regex: 'манґа|манга|manga', $options: 'i' };
      }
    }

    const manga = await Manga.find(query)
      .populate('author', 'username')
      .limit(10);

    res.status(200).json({ success: true, data: manga });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/manga/sidebar-updates
 * @desc    Отримати оновлення для бокової панелі з фільтрацією
 * @access  Public
 */
router.get('/sidebar-updates', async (req, res) => {
  try {
    const { type } = req.query;
    let updates = [];
    // Більш лояльний фільтр: показуємо все, крім відхилених
    const query = { moderationStatus: { $ne: 'rejected' } };

    if (type === 'fanfic' || type === 'literature') {
      updates = await Literature.find(query)
        .populate('author', 'username')
        .sort({ updatedAt: -1 })
        .limit(5);
    } else {
      if (type === 'manga') {
        query.type = { $regex: /манґа|манга|manga/i };
      } else if (type === 'manhwa') {
        query.type = { $regex: /манхва|маньхуа|manhwa|manhua/i };
      }
      
      updates = await Manga.find(query)
        .populate('author', 'username')
        .sort({ updatedAt: -1 })
        .limit(5);
    }

    res.status(200).json({ success: true, data: updates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/manga/latest
 * @desc    Отримати останні оновлення з фільтрацією (для сайдбару та сторінки оновлень)
 * @access  Public
 */
router.get('/latest', async (req, res) => {
  try {
    const { type, limit = 10 } = req.query;
    const query = { moderationStatus: { $ne: 'rejected' } };
    let updates = [];

    if (type === 'literature' || type === 'fanfic') {
      updates = await Literature.find(query)
        .populate('author', 'username')
        .sort({ updatedAt: -1 })
        .limit(parseInt(limit));
    } else {
      if (type === 'manhwa') {
        query.type = { $regex: /манхва|маньхуа|manhwa|manhua/i };
      } else if (type === 'manga') {
        query.type = { $regex: /манґа|манга|manga/i };
      } else if (type === 'comics') {
        query.type = { $regex: /комікс|comics/i };
      }

      updates = await Manga.find(query)
        .populate('author', 'username')
        .sort({ updatedAt: -1 })
        .limit(parseInt(limit));
    }

    res.status(200).json({ success: true, data: updates || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/manga/catalog
 * @desc    Отримати відфільтровані твори для каталогу
 * @access  Public
 */
router.get('/catalog', async (req, res) => {
  try {
    const { format, genres, status } = req.query;
    let query = { moderationStatus: { $ne: 'rejected' } };

    // Фільтр по статусу
    if (status) {
      const statusArray = status.split(',');
      const statusMapping = {
        'Онґоінґ': 'В процесі',
        'Завершено': 'Завершено',
        'Анонс': 'Анонс'
      };
      const dbStatuses = statusArray.map(s => statusMapping[s] || s);
      query.status = { $in: dbStatuses };
    }

    // Фільтр по жанрах
    if (genres) {
      const genresArray = genres.split(',');
      query.genres = { $in: genresArray };
    }

    let results = [];

    // Логіка формату
    if (format === 'fanfic' || format === 'literature' || format === 'Література/Фанфік') {
      results = await Literature.find(query).sort({ updatedAt: -1 });
    } else if (format === 'Всі' || !format || format === 'all') {
      const [mangas, literatures] = await Promise.all([
        Manga.find(query).sort({ updatedAt: -1 }),
        Literature.find(query).sort({ updatedAt: -1 })
      ]);
      // Об'єднуємо та сортуємо за часом оновлення
      results = [...mangas, ...literatures].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } else {
      // Специфічні типи манґи
      const typeMapping = {
        'manga': 'Манґа',
        'manhwa': 'Манхва',
        'manhua': 'Маньхуа',
        'comics': 'Комікс',
        'Манґа': 'Манґа',
        'Манхва': 'Манхва',
        'Маньхуа': 'Маньхуа',
        'Комікс': 'Комікс'
      };
      if (typeMapping[format]) {
        query.type = typeMapping[format];
      } else {
        query.type = { $regex: new RegExp(format, 'i') };
      }
      results = await Manga.find(query).sort({ updatedAt: -1 });
    }

    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/manga/:id
 * @desc    Отримати один тайтл за ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const manga = await Manga.findById(req.params.id).populate('author', 'username');

    if (!manga) {
      return res.status(404).json({ success: false, error: 'Твір не знайдено' });
    }

    res.status(200).json({ success: true, data: manga });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/manga/:id/rate
 * @desc    Поставити оцінку тайтлу
 * @access  Private
 */
router.post('/:id/rate', protect, async (req, res) => {
  try {
    const { score } = req.body;
    if (!score || score < 1 || score > 10) {
      return res.status(400).json({ success: false, error: 'Оцінка має бути від 1 до 10' });
    }

    const manga = await Manga.findById(req.params.id);
    if (!manga) return res.status(404).json({ success: false, error: 'Твір не знайдено' });

    // Оновлюємо або створюємо оцінку
    let rating = await Rating.findOne({ manga: req.params.id, user: req.user.id });

    if (rating) {
      rating.score = score;
      await rating.save();
    } else {
      rating = await Rating.create({
        manga: req.params.id,
        user: req.user.id,
        score
      });
    }

    // Явно викликаємо перерахунок і чекаємо на його завершення, щоб у відповіді були свіжі дані
    await Rating.getAverageRating(req.params.id);

    // Отримуємо оновлений тайтл із середнім рейтингом та статистикою
    const updatedManga = await Manga.findById(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        score: rating.score,
        averageRating: updatedManga.averageRating,
        ratingCount: updatedManga.ratingCount,
        ratingStats: updatedManga.ratingStats // Повертаємо детальну статистику
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/manga/:id/my-rate
 * @desc    Отримати оцінку поточного користувача для тайтлу
 * @access  Private
 */
router.get('/:id/my-rate', protect, async (req, res) => {
  try {
    const rating = await Rating.findOne({ manga: req.params.id, user: req.user.id });
    res.status(200).json({
      success: true,
      data: rating ? rating.score : 0
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/manga/:id/like
 * @desc    Переключити лайк для тайтлу
 * @access  Private
 */
router.post('/:id/like', protect, async (req, res) => {
  try {
    const manga = await Manga.findById(req.params.id);
    if (!manga) return res.status(404).json({ success: false, error: 'Твір не знайдено' });

    const isLiked = manga.likes.includes(req.user.id);
    if (isLiked) {
      manga.likes = manga.likes.filter(id => id.toString() !== req.user.id.toString());
    } else {
      manga.likes.push(req.user.id);
    }

    await manga.save();

    res.status(200).json({
      success: true,
      data: manga.likes,
      isLiked: !isLiked
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/manga
 * @desc    Створити новий тайтл
 * @access  Private (Admin, Author)
 */
router.post('/', protect, authorize('admin', 'author'), upload.any(), async (req, res) => {
  try {
    // Обробка файлів
    if (req.files) {
      const coverFile = req.files.find(f => f.fieldname === 'coverImage');
      const bannerFile = req.files.find(f => f.fieldname === 'bannerImage');
      
      if (coverFile) {
        req.body.coverImage = `/uploads/${coverFile.filename}`;
      }
      if (bannerFile) {
        req.body.bannerImage = `/uploads/${bannerFile.filename}`;
      }
    }

    // Автоматично додаємо ID поточного користувача як автора
    req.body.author = req.user.id;

    // Обробимо жанри
    if (req.body.genres && typeof req.body.genres === 'string') {
      req.body.genres = req.body.genres.split(',').map(g => g.trim());
    }

    const manga = await Manga.create(req.body);
    res.status(201).json({ success: true, data: manga });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   PUT /api/manga/:id
 * @desc    Редагувати тайтл
 * @access  Private (Admin, Author)
 */
router.put('/:id', protect, isOwnerOrAdmin('Manga'), upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'bannerImage', maxCount: 1 }
]), async (req, res) => {
  try {
    let manga = await Manga.findById(req.params.id);

    // Якщо завантажено нові файли
    if (req.files) {
      if (req.files.coverImage) {
        req.body.coverImage = `/uploads/${req.files.coverImage[0].filename}`;
      }
      if (req.files.bannerImage) {
        req.body.bannerImage = `/uploads/${req.files.bannerImage[0].filename}`;
      }
    }

    // Обробимо жанри
    if (req.body.genres && typeof req.body.genres === 'string') {
      req.body.genres = req.body.genres.split(',').map(g => g.trim());
    }

    // Оновлення
    manga = await Manga.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: manga });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   DELETE /api/manga/:id
 * @desc    Видалити тайтл
 * @access  Private (Admin, Author)
 */
router.delete('/:id', protect, isOwnerOrAdmin('Manga'), async (req, res) => {
  try {
    const manga = await Manga.findById(req.params.id);
    await manga.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
