const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Manga = require('../models/Manga');
const Literature = require('../models/Literature');

// Protect routes
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
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_for_dev_only');

    // Get user from the token and attach to request
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }
};

// Grant access to specific roles
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

// Check if user is the owner of the resource or an admin
const isOwnerOrAdmin = (modelName) => {
  return async (req, res, next) => {
    try {
      if (req.user.role === 'admin') {
        return next();
      }

      const lowerModelName = modelName.toLowerCase();
      let Model;
      if (lowerModelName === 'manga') Model = Manga;
      else if (lowerModelName === 'literature' || lowerModelName === 'fanfic') Model = Literature;
      else return res.status(500).json({ success: false, error: 'Invalid model type in middleware' });

      const resource = await Model.findById(req.params.id);

      if (!resource) {
        return res.status(404).json({ success: false, error: 'Контент не знайдено' });
      }

      // Check if user is the owner (author field in our models)
      if (resource.author && resource.author.toString() !== req.user.id.toString()) {
        return res.status(403).json({ success: false, error: 'У вас немає прав для редагування або видалення цього контенту' });
      }

      next();
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Помилка сервера при перевірці прав' });
    }
  };
};

module.exports = { protect, authorize, isOwnerOrAdmin };
