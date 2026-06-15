const express = require('express');
const router = express.Router();
const Manga = require('../models/Manga');
const { protect, authorize } = require('../middleware/authMiddleware');
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
    
    // Сортуємо за датою створення (спочатку нові)
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
 * @route   POST /api/manga
 * @desc    Створити новий тайтл
 * @access  Private (Admin, Author)
 */
router.post('/', protect, authorize('admin', 'author'), upload.any(), async (req, res) => {
  try {
    console.log('Manga Creation Request:', {
      body: req.body,
      files: req.files ? req.files.map(f => ({ fieldname: f.fieldname, filename: f.filename })) : 'none',
      user: req.user ? req.user.id : 'none'
    });

    // Обробка файлів (тепер через req.files як масив)
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

    // Обробимо жанри, якщо вони прийшли рядком (через кому) від FormData
    if (req.body.genres && typeof req.body.genres === 'string') {
      req.body.genres = req.body.genres.split(',').map(g => g.trim());
    }

    const manga = await Manga.create(req.body);
    console.log('Manga created successfully:', manga._id);

    res.status(201).json({ success: true, data: manga });
  } catch (error) {
    console.error('Manga Creation Error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   PUT /api/manga/:id
 * @desc    Редагувати тайтл
 * @access  Private (Admin, Author)
 */
router.put('/:id', protect, authorize('admin', 'author'), upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'bannerImage', maxCount: 1 }
]), async (req, res) => {
  try {
    let manga = await Manga.findById(req.params.id);

    if (!manga) {
      return res.status(404).json({ success: false, error: 'Твір не знайдено' });
    }

    // Перевірка прав (тільки автор або адмін)
    if (manga.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'У вас немає прав для редагування цього твору' });
    }

    // Якщо завантажено нові файли
    if (req.files) {
      if (req.files.coverImage) {
        req.body.coverImage = `/uploads/${req.files.coverImage[0].filename}`;
      }
      if (req.files.bannerImage) {
        req.body.bannerImage = `/uploads/${req.files.bannerImage[0].filename}`;
      }
    }

    // Обробимо жанри, якщо вони прийшли рядком
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
router.delete('/:id', protect, authorize('admin', 'author'), async (req, res) => {
  try {
    const manga = await Manga.findById(req.params.id);

    if (!manga) {
      return res.status(404).json({ success: false, error: 'Твір не знайдено' });
    }

    // Перевірка прав (тільки автор або адмін)
    if (manga.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'У вас немає прав для видалення цього твору' });
    }

    await manga.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
