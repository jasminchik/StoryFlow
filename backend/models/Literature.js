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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Literature', LiteratureSchema);
