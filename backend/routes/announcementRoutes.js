const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const Manga = require('../models/Manga');
const { protect, authorize, isOwnerOrAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/announcements
 * @desc    Отримати список усіх новин
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('author', 'username avatar')
      .populate('manga', 'title coverImage type')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/announcements/manga/:mangaId
 * @desc    Отримати новини конкретного тайтлу
 * @access  Public
 */
router.get('/manga/:mangaId', async (req, res) => {
  try {
    const announcements = await Announcement.find({ manga: req.params.mangaId })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/announcements
 * @desc    Створити нову новину
 * @access  Private (Author, Admin)
 */
router.post('/', protect, authorize('author', 'admin'), async (req, res) => {
  try {
    const { manga, category } = req.body;

    // Якщо це новина тайтлу, перевіряємо чи користувач є його автором
    if (category === 'manga_update' || !category) {
      if (!manga) {
        return res.status(400).json({ success: false, error: 'Для новини тайтлу необхідно вказати сам тайтл' });
      }

      const title = await Manga.findById(manga);
      if (!title) {
        return res.status(404).json({ success: false, error: 'Тайтл не знайдено' });
      }

      if (title.author.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Ви можете додавати новини тільки до власних тайтлів' });
      }
    }

    // Тільки адмін може створювати системні новини
    if (category === 'system' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Тільки адміністратор може створювати системні новини' });
    }

    req.body.author = req.user.id;
    const announcement = await Announcement.create(req.body);

    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   PUT /api/announcements/:id
 * @desc    Редагувати новину
 * @access  Private (Owner, Admin)
 */
router.put('/:id', protect, isOwnerOrAdmin('announcement'), async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   DELETE /api/announcements/:id
 * @desc    Видалити новину
 * @access  Private (Owner, Admin)
 */
router.delete('/:id', protect, isOwnerOrAdmin('announcement'), async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    await announcement.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
