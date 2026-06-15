const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Manga = require('../models/Manga');
const Literature = require('../models/Literature');
const Announcement = require('../models/Announcement');
const LiteratureChapter = require('../models/LiteratureChapter');

/**
 * Мідлвара для захисту маршрутів (тільки для авторизованих користувачів)
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_for_dev_only');
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }
};

/**
 * Мідлвара для перевірки ролей (наприклад, 'admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user ? req.user.role : 'unknown'} is not authorized to access this route`
      });
    }
    next();
  };
};

/**
 * Мідлвара для перевірки прав власності або прав адміністратора
 * @param {string} resourceType - Тип ресурсу ('manga', 'literature', 'fanfic', 'literaturechapter')
 */
const isOwnerOrAdmin = (resourceType) => {
  return async (req, res, next) => {
    try {
      // 1. Якщо адмін — дозволяємо все
      if (req.user.role === 'admin') {
        return next();
      }

      // 2. Визначаємо модель
      const type = resourceType.toLowerCase();
      let Model;
      
      if (type === 'manga') {
        Model = Manga;
      } else if (type === 'literature' || type === 'fanfic') {
        Model = Literature;
      } else if (type === 'announcement' || type === 'news') {
        Model = Announcement;
      } else if (type === 'literaturechapter') {
        Model = LiteratureChapter;
      } else {
        return res.status(500).json({ success: false, error: 'Invalid resource type in middleware' });
      }

      // 3. Шукаємо ресурс
      let resource;
      if (type === 'literaturechapter') {
        // Для глав потрібно підтягнути автора батьківського твору
        resource = await Model.findById(req.params.id).populate('literature');
      } else {
        resource = await Model.findById(req.params.id);
      }

      if (!resource) {
        return res.status(404).json({ success: false, error: 'Not Found: Ресурс не знайдено' });
      }

      // 4. Перевіряємо власника
      let isOwner = false;
      if (type === 'literaturechapter') {
        // Власник глави — це автор твору
        isOwner = resource.literature && resource.literature.author.toString() === req.user.id.toString();
      } else {
        isOwner = resource.author && resource.author.toString() === req.user.id.toString();
      }

      if (!isOwner) {
        return res.status(403).json({ 
          success: false, 
          error: 'У вас немає прав для редагування або видалення цього контенту' 
        });
      }

      // 5. Все ок
      next();
    } catch (error) {
      console.error('Authorization Error:', error);
      return res.status(500).json({ success: false, error: 'Помилка сервера при перевірці прав' });
    }
  };
};

module.exports = { protect, authorize, isOwnerOrAdmin };
