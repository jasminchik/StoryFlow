const mongoose = require('mongoose');

const UserListSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['reading', 'planned', 'dropped', 'read', 'favorites'],
    required: true
  },
  chaptersRead: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Забороняємо дублікати для однієї і тієї ж манґи у одного юзера
UserListSchema.index({ user: 1, manga: 1 }, { unique: true });

module.exports = mongoose.model('UserList', UserListSchema);
