const express = require('express');
const router = express.Router();
const LiteratureChapter = require('../models/LiteratureChapter');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/literature-chapters/literature/:literatureId
 * @desc    Отримати всі глави твору
 * @access  Public
 */
router.get('/literature/:literatureId', async (req, res) => {
  try {
    const chapters = await LiteratureChapter.find({ literature: req.params.literatureId })
      .sort({ chapterNumber: 1 });
    res.status(200).json({ success: true, count: chapters.length, data: chapters });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/literature-chapters/:id
 * @desc    Отримати одну главу (читання Література/Фанфік)
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const chapter = await LiteratureChapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ success: false, error: 'Главу не знайдено' });
    res.status(200).json({ success: true, data: chapter });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/literature-chapters
 * @desc    Створити нову текстову главу
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const chapter = await LiteratureChapter.create(req.body);
    res.status(201).json({ success: true, data: chapter });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   PUT /api/literature-chapters/:id
 * @desc    Оновити главу (збереження тексту з редактора)
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const chapter = await LiteratureChapter.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!chapter) return res.status(404).json({ success: false, error: 'Главу не знайдено' });
    res.status(200).json({ success: true, data: chapter });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   DELETE /api/literature-chapters/:id
 * @desc    Видалити главу
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const chapter = await LiteratureChapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ success: false, error: 'Главу не знайдено' });
    await chapter.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
