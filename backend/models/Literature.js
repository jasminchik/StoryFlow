const mongoose = require('mongoose');

const LiteratureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Будь ласка, додайте назву твору'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Будь ласка, додайте опис твору']
  },
  coverImage: {
    type: String,
    default: '/uploads/no-literature-cover.jpg'
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Твір повинен мати автора']
  },
  genres: {
    type: [String],
    required: [true, 'Будь ласка, додайте принаймні один жанр']
  },
  manga: {
    type: mongoose.Schema.ObjectId,
    ref: 'Manga',
    default: null
  },
  isOfficial: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed'],
    default: 'in_progress'
  },
  direction: {
    type: String,
    default: 'Джен'
  },
  ageRating: {
    type: String,
    enum: ['G', 'PG-13', 'R', 'NC-17'],
    default: 'PG-13'
  },
  authorNote: {
    type: String,
    trim: true
  },
  likes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ],
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Literature', LiteratureSchema);
