const express = require('express');
const router = express.Router();
const Literature = require('../models/Literature');
const Manga = require('../models/Manga');
const LiteratureChapter = require('../models/LiteratureChapter');
const { protect, authorize, isOwnerOrAdmin } = require('../middleware/auth');
const upload = require('../config/upload');

/**
 * @route   GET /api/literature
 * @desc    Отримати всі літературні твори
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const literature = await Literature.find()
      .populate('author', 'username')
      .populate('manga', 'title author')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: literature.length, data: literature });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/literature/manga/:mangaId
 * @desc    Отримати всі фанфіки для конкретної манґи
 * @access  Public
 */
router.get('/manga/:mangaId', async (req, res) => {
  try {
    const literature = await Literature.find({ 
      manga: req.params.mangaId
    }).populate('author', 'username');
    
    res.status(200).json({ success: true, count: literature.length, data: literature });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/literature/:id
 * @desc    Отримати один твір за ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const literature = await Literature.findById(req.params.id)
      .populate('author', 'username')
      .populate('manga', 'title author');
      
    if (!literature) return res.status(404).json({ success: false, error: 'Твір не знайдено' });
    res.status(200).json({ success: true, data: literature });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/literature/:id/like
 * @desc    Переключити лайк для твору
 * @access  Private
 */
router.post('/:id/like', protect, async (req, res) => {
  try {
    const literature = await Literature.findById(req.params.id);

    if (!literature) {
      return res.status(404).json({ success: false, error: 'Твір не знайдено' });
    }

    // Перевіряємо чи є вже лайк
    const isLiked = literature.likes.includes(req.user.id);

    if (isLiked) {
      // Видаляємо лайк
      literature.likes = literature.likes.filter(id => id.toString() !== req.user.id.toString());
    } else {
      // Додаємо лайк
      literature.likes.push(req.user.id);
    }

    await literature.save();

    res.status(200).json({
      success: true,
      data: literature.likes,
      isLiked: !isLiked
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/literature
 * @desc    Створити новий літературний твір
 * @access  Private
 */
router.post('/', protect, upload.single('coverImage'), async (req, res) => {
  try {
    req.body.author = req.user.id;
    if (req.file) req.body.coverImage = `/uploads/${req.file.filename}`;
    
    if (req.body.genres && typeof req.body.genres === 'string') {
      req.body.genres = req.body.genres.split(',').map(g => g.trim());
    }

    // Логіка офіційного фанфіка (Канон)
    if (req.body.manga) {
      const manga = await Manga.findById(req.body.manga);
      if (manga && manga.author.toString() === req.user.id.toString()) {
        req.body.isOfficial = true;
      }
    }

    const literature = await Literature.create(req.body);
    res.status(201).json({ success: true, data: literature });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   PUT /api/literature/:id
 * @desc    Оновити твір (шапку)
 * @access  Private (Owner/Admin)
 */
router.put('/:id', protect, isOwnerOrAdmin('Literature'), upload.single('coverImage'), async (req, res) => {
  try {
    if (req.file) req.body.coverImage = `/uploads/${req.file.filename}`;
    if (req.body.genres && typeof req.body.genres === 'string') {
      req.body.genres = req.body.genres.split(',').map(g => g.trim());
    }

    const literature = await Literature.findByIdAndUpdate(req.params.id, req.body, { 
      new: true, 
      runValidators: true 
    });
    
    res.status(200).json({ success: true, data: literature });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   DELETE /api/literature/:id
 * @desc    Видалити твір
 * @access  Private (Owner/Admin)
 */
router.delete('/:id', protect, isOwnerOrAdmin('Literature'), async (req, res) => {
  try {
    const literature = await Literature.findById(req.params.id);
    
    if (!literature) {
      return res.status(404).json({ success: false, error: 'Твір не знайдено' });
    }

    // Видаляємо всі розділи цього твору
    await LiteratureChapter.deleteMany({ literature: req.params.id });
    
    // Видаляємо сам твір
    await literature.deleteOne();
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   PATCH /api/literature/:id/moderation
 * @desc    Змінити статус модерації твору
 * @access  Private (Admin)
 */
router.patch('/:id/moderation', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Некоректний статус модерації' });
    }

    const literature = await Literature.findByIdAndUpdate(
      req.params.id,
      { moderationStatus: status },
      { new: true, runValidators: true }
    );

    if (!literature) return res.status(404).json({ success: false, error: 'Твір не знайдено' });
    res.status(200).json({ success: true, data: literature });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
