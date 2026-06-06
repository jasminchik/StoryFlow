const express = require('express');
const router = express.Router();
const Literature = require('../models/Literature');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../config/upload');

/**
 * @route   GET /api/literature
 * @desc    Отримати всі літературні твори
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const literature = await Literature.find().populate('author', 'username');
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
    const literature = await Literature.findById(req.params.id).populate('author', 'username');
    if (!literature) return res.status(404).json({ success: false, error: 'Твір не знайдено' });
    res.status(200).json({ success: true, data: literature });
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

    const literature = await Literature.create(req.body);
    res.status(201).json({ success: true, data: literature });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   PUT /api/literature/:id
 * @desc    Оновити твір
 * @access  Private
 */
router.put('/:id', protect, upload.single('coverImage'), async (req, res) => {
  try {
    let literature = await Literature.findById(req.params.id);
    if (!literature) return res.status(404).json({ success: false, error: 'Твір не знайдено' });

    if (req.file) req.body.coverImage = `/uploads/${req.file.filename}`;
    if (req.body.genres && typeof req.body.genres === 'string') {
      req.body.genres = req.body.genres.split(',').map(g => g.trim());
    }

    literature = await Literature.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: literature });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   DELETE /api/literature/:id
 * @desc    Видалити твір
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const literature = await Literature.findById(req.params.id);
    if (!literature) return res.status(404).json({ success: false, error: 'Твір не знайдено' });
    await literature.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
