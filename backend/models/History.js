const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  manga: {
    type: mongoose.Schema.ObjectId,
    ref: 'Manga',
    required: true
  },
  chapter: {
    type: mongoose.Schema.ObjectId,
    ref: 'Chapter',
    required: true
  },
  readAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Один запис на одну манґу для одного користувача (оновлюємо останній прочитаний розділ)
HistorySchema.index({ user: 1, manga: 1 }, { unique: true });

module.exports = mongoose.model('History', HistorySchema);
