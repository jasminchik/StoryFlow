const express = require('express');
const router = express.Router();
const UserList = require('../models/UserList');
const Manga = require('../models/Manga');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/user-list/status
 * @desc    Додати або оновити статус тайтлу в списку користувача
 * @access  Private
 */
router.post('/status', protect, async (req, res) => {
  try {
    const { mangaId, status } = req.body;

    if (!mangaId || !status) {
      return res.status(400).json({ success: false, error: 'Потрібні mangaId та status' });
    }

    const validStatuses = ['reading', 'planned', 'dropped', 'read', 'favorites'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Недійсний статус' });
    }

    // Перевіряємо чи існує манґа
    const manga = await Manga.findById(mangaId);
    if (!manga) {
      return res.status(404).json({ success: false, error: 'Тайтл не знайдено' });
    }

    let userListItem = await UserList.findOne({ user: req.user.id, manga: mangaId });

    if (userListItem) {
      // Оновлюємо існуючий запис
      userListItem.status = status;
      await userListItem.save();
    } else {
      // Створюємо новий запис
      userListItem = await UserList.create({
        user: req.user.id,
        manga: mangaId,
        status: status
      });
    }

    res.status(200).json({ success: true, data: userListItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/user-list
 * @desc    Отримати всі списки поточного користувача
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const lists = await UserList.find({ user: req.user.id }).populate('manga');
    res.status(200).json({ success: true, data: lists });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/user-list/:username
 * @desc    Отримати списки іншого користувача
 * @access  Public
 */
router.get('/user/:username', async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ success: false, error: 'Користувача не знайдено' });

    const lists = await UserList.find({ user: user._id }).populate('manga');
    res.status(200).json({ success: true, data: lists });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   DELETE /api/user-list/:mangaId
 * @desc    Видалити тайтл зі списку
 * @access  Private
 */
router.delete('/:mangaId', protect, async (req, res) => {
  try {
    const item = await UserList.findOneAndDelete({ user: req.user.id, manga: req.params.mangaId });
    if (!item) return res.status(404).json({ success: false, error: 'Запис не знайдено' });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/user-list/favorites
 * @desc    Отримати список "Обране" (favorites) поточного користувача
 * @access  Private
 */
router.get('/favorites', protect, async (req, res) => {
  try {
    const favorites = await UserList.find({ 
      user: req.user.id, 
      status: 'favorites' 
    }).populate('manga');

    res.status(200).json({ 
      success: true, 
      data: favorites.map(item => item.manga).filter(m => m !== null)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
