const express = require('express');
const router = express.Router();
const LiteratureChapter = require('../models/LiteratureChapter');
const Literature = require('../models/Literature');
const { protect, isOwnerOrAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/literature-chapters/literature/:literatureId
 * @desc    Отримати всі розділи твору
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
 * @desc    Отримати один розділ (читання)
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const chapter = await LiteratureChapter.findById(req.params.id).populate('literature', 'title author');
    if (!chapter) return res.status(404).json({ success: false, error: 'Розділ не знайдено' });
    res.status(200).json({ success: true, data: chapter });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/literature-chapters
 * @desc    Створити новий текстовий розділ
 * @access  Private (Owner of Literature)
 */
router.post('/', protect, async (req, res) => {
  try {
    const { literature: literatureId } = req.body;
    
    // Перевірка прав: тільки автор твору може додавати розділи
    const literature = await Literature.findById(literatureId);
    if (!literature) {
      return res.status(404).json({ success: false, error: 'Твір не знайдено' });
    }

    if (literature.author.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Тільки автор може додавати розділи до цього твору' });
    }

    const chapter = await LiteratureChapter.create(req.body);
    res.status(201).json({ success: true, data: chapter });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   PUT /api/literature-chapters/:id
 * @desc    Оновити розділ (збереження тексту)
 * @access  Private (Owner/Admin)
 */
router.put('/:id', protect, isOwnerOrAdmin('literaturechapter'), async (req, res) => {
  try {
    const chapter = await LiteratureChapter.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!chapter) return res.status(404).json({ success: false, error: 'Розділ не знайдено' });
    res.status(200).json({ success: true, data: chapter });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   DELETE /api/literature-chapters/:id
 * @desc    Видалити розділ
 * @access  Private (Owner/Admin)
 */
router.delete('/:id', protect, isOwnerOrAdmin('literaturechapter'), async (req, res) => {
  try {
    const chapter = await LiteratureChapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ success: false, error: 'Розділ не знайдено' });
    await chapter.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
