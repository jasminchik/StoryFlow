const express = require('express');
const router = express.Router();
const Manga = require('../models/Manga');
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
    const query = { moderationStatus: 'approved' };
    
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
    const approvedQuery = { moderationStatus: 'approved' };

    // 1. Новинки (сортування за датою створення) - дозволяємо бачити всі нові, щоб автори бачили свої твори
    const newArrivals = await Manga.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(8);

    // 2. Популярні/Найкращі (сортування за рейтингом та кількістю оцінок)
    const topRated = await Manga.find(approvedQuery)
      .populate('author', 'username')
      .sort({ averageRating: -1, ratingCount: -1 })
      .limit(8);

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
