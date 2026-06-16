const express = require('express');
const router = express.Router();
const History = require('../models/History');
const Manga = require('../models/Manga'); // Додано
const Chapter = require('../models/Chapter'); // Додано
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/history
 * @desc    Додати або оновити історію читання
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const { mangaId, chapterId } = req.body;

    if (!mangaId || !chapterId) {
      return res.status(400).json({ success: false, error: 'Вкажіть mangaId та chapterId' });
    }

    // Оновлюємо або створюємо запис (upsert)
    const history = await History.findOneAndUpdate(
      { user: req.user._id, manga: mangaId },
      { chapter: chapterId, readAt: Date.now() },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/history/my
 * @desc    Отримати історію читання поточного користувача
 * @access  Private
 */
router.get('/my', protect, async (req, res) => {
  try {
    const history = await History.find({ user: req.user._id })
      .populate({
        path: 'manga',
        select: 'title coverImage alternativeTitle type'
      })
      .populate({
        path: 'chapter',
        select: 'number title'
      })
      .sort({ readAt: -1 }); // Найновіші зверху

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/history/user/:userId
 * @desc    Отримати історію читання будь-якого користувача
 * @access  Public
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const history = await History.find({ user: req.params.userId })
      .populate({
        path: 'manga',
        select: 'title coverImage alternativeTitle type'
      })
      .populate({
        path: 'chapter',
        select: 'number title'
      })
      .sort({ readAt: -1 });

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
