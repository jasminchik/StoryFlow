const express = require('express');
const router = express.Router();
const News = require('../models/News');

/**
 * @route   GET /api/news
 * @desc    Отримати список новин сайту
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
