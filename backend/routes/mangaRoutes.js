const express = require('express');
const router = express.Router();
const Manga = require('../models/Manga');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/manga
 * @desc    Отримати список усіх тайтлів
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const manga = await Manga.find().populate('author', 'username');
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
router.post('/', protect, authorize('admin', 'author'), async (req, res) => {
  try {
    // Автоматично додаємо ID поточного користувача як автора
    req.body.author = req.user.id;

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
router.put('/:id', protect, authorize('admin', 'author'), async (req, res) => {
  try {
    let manga = await Manga.findById(req.params.id);

    if (!manga) {
      return res.status(404).json({ success: false, error: 'Твір не знайдено' });
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

    await manga.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
