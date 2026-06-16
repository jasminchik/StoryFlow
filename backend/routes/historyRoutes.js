const express = require('express');
const router = express.Router();
const History = require('../models/History');
const Manga = require('../models/Manga');
const Chapter = require('../models/Chapter');
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
      .sort({ readAt: -1 });

    // Фільтруємо "осиротілі" записи
    const validHistory = history.filter(item => item.manga !== null);

    res.status(200).json({ success: true, data: validHistory });
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

    // Фільтруємо "осиротілі" записи перед відправкою на клієнт
    const validHistory = history.filter(item => item.manga !== null);

    res.status(200).json({ success: true, data: validHistory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   DELETE /api/history/:id
 * @desc    Видалити запис з історії
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    // Видаляємо суто за ID запису історії, не перевіряючи чи існує ще сама манґа
    const historyRecord = await History.findById(req.params.id);

    if (!historyRecord) {
      return res.status(404).json({ success: false, error: 'Запис не знайдено' });
    }

    // Перевіряємо чи це історія саме цього користувача
    if (historyRecord.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Ви не можете видалити чужу історію' });
    }

    await historyRecord.deleteOne();
    res.status(200).json({ success: true, message: 'Запис видалено' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
