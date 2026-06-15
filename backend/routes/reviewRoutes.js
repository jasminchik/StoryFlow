const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

/**
 * @route   GET /api/reviews/user/:userId
 * @desc    Отримати всі відгуки конкретного користувача
 * @access  Public
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Comment.find({ 
      author: req.params.userId,
      interactionType: 'review'
    })
      .populate('resourceId', 'title type')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
