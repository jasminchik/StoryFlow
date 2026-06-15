const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/comments/:resourceId
 * @desc    Отримати коментарі для конкретного ресурсу
 * @access  Public
 */
router.get('/:resourceId', async (req, res) => {
  try {
    const { type } = req.query;
    const query = { resourceId: req.params.resourceId };
    
    if (type) {
      query.interactionType = type;
    }

    const comments = await Comment.find(query)
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/comments
 * @desc    Створити новий коментар
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    req.body.author = req.user.id;
    const comment = await Comment.create(req.body);
    
    // Populate author for immediate display on frontend
    await comment.populate('author', 'username avatar');

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   DELETE /api/comments/:id
 * @desc    Видалити коментар
 * @access  Private (Owner/Admin)
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ success: false, error: 'Коментар не знайдено' });
    }

    // Тільки автор або адмін
    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Немає прав для видалення цього коментаря' });
    }

    await comment.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
