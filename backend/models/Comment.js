const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Коментар не може бути порожнім'],
    trim: true,
    maxlength: [1000, 'Коментар не може бути довшим за 1000 символів']
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  // Посилання на ресурс, який коментують
  resourceId: {
    type: mongoose.Schema.ObjectId,
    required: true
  },
  // Тип ресурсу ('Manga', 'Literature', 'Announcement')
  resourceType: {
    type: String,
    required: true,
    enum: ['Manga', 'Literature', 'Announcement']
  },
  interactionType: {
    type: String,
    required: true,
    enum: ['comment', 'review', 'discussion'],
    default: 'comment'
  },
  likes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Comment', CommentSchema);
