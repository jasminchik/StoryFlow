const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Manga = require('../models/Manga');
const UserList = require('../models/UserList');
const Comment = require('../models/Comment');
const Rating = require('../models/Rating');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all users
// @route   GET /api/users
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Get authors list
// @route   GET /api/users/authors
router.get('/authors', async (req, res) => {
  try {
    const { limit } = req.query;
    let query = User.find({ role: 'author' }).select('username avatar createdAt aboutMe');
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const authors = await query;
    
    // Отримуємо кількість тайтлів для кожного автора
    const authorsWithStats = await Promise.all(authors.map(async (author) => {
      const titlesCount = await Manga.countDocuments({ author: author._id });
      return {
        ...author.toObject(),
        titlesCount
      };
    }));

    res.status(200).json({ success: true, data: authorsWithStats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Get user profile by username with dynamic stats
// @route   GET /api/users/profile/:username
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password -email');
    if (!user) {
      return res.status(404).json({ success: false, error: 'Користувача не знайдено' });
    }

    // Підрахунок динамічної статистики
    const [titlesCount, commentsCount, ratingsCount, readCount] = await Promise.all([
      UserList.countDocuments({ user: user._id }),
      Comment.countDocuments({ author: user._id }),
      Rating.countDocuments({ user: user._id }),
      UserList.countDocuments({ user: user._id, status: 'read' })
    ]);

    // Додаємо згенеровані статси до відповіді
    const userWithStats = {
      ...user.toObject(),
      stats: {
        titles: titlesCount,
        comments: commentsCount,
        ratings: ratingsCount,
        readCount: readCount
      }
    };

    res.status(200).json({ success: true, data: userWithStats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Get user reading analytics
// @route   GET /api/users/profile/:username/analytics
router.get('/profile/:username/analytics', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Користувача не знайдено' });
    }

    // Отримуємо всі записи користувача зі списку
    const userLists = await UserList.find({ user: user._id });

    // Підраховуємо загальну кількість прочитаних розділів
    const totalChaptersRead = userLists.reduce((sum, item) => sum + (item.chaptersRead || 0), 0);

    // Розраховуємо кількість годин (приблизно 15 хв на розділ)
    const totalHoursRead = (totalChaptersRead * 15) / 60;

    // Створюємо дані для графіка (оскільки немає погодинної історії, зробимо базовий розподіл останніх днів на основі totalChaptersRead)
    // У майбутньому тут можна зробити реальну агрегацію по датах оновлення
    const days = ['Пн', 'Вв', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
    const currentDayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // 0 = Понеділок

    const chartData = days.map((day, index) => {
      // Імітуємо активність для графіка: більша частина активності ближче до сьогоднішнього дня
      let baseValue = 0;
      if (totalChaptersRead > 0) {
        if (index === currentDayIndex) baseValue = Math.ceil(totalChaptersRead * 0.4);
        else if (index === currentDayIndex - 1 || index === currentDayIndex + 6) baseValue = Math.ceil(totalChaptersRead * 0.2);
        else baseValue = Math.ceil(totalChaptersRead * 0.05);
      }
      return {
        name: day,
        rozdivly: baseValue
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalChaptersRead,
        totalHoursRead: parseFloat(totalHoursRead.toFixed(1)),
        chartData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Update current user profile
// @route   PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { username, avatar, banner, aboutMe, gender } = req.body;
    
    // Перевірка на унікальність нікнейму, якщо він змінюється
    if (username && username !== req.user.username) {
      const userExists = await User.findOne({ username });
      if (userExists) {
        return res.status(400).json({ success: false, error: 'Цей нікнейм вже зайнятий' });
      }
    }

    const fieldsToUpdate = {};
    if (username) fieldsToUpdate.username = username;
    if (avatar !== undefined) fieldsToUpdate.avatar = avatar;
    if (banner !== undefined) fieldsToUpdate.banner = banner;
    if (aboutMe !== undefined) fieldsToUpdate.aboutMe = aboutMe;
    if (gender) fieldsToUpdate.gender = gender;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({ 
      success: true, 
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        banner: user.banner,
        aboutMe: user.aboutMe,
        gender: user.gender
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Create new user
// @route   POST /api/users
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { username, email, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
