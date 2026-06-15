const mongoose = require('mongoose');

const ChapterSchema = new mongoose.Schema({
  manga: {
    type: mongoose.Schema.ObjectId,
    ref: 'Manga',
    required: [true, 'Будь ласка, вкажіть до якого твору належить цей розділ']
  },
  volume: {
    type: Number,
    default: 1
  },
  chapterNumber: {
    type: Number,
    required: [true, 'Будь ласка, вкажіть номер глави']
  },
  title: {
    type: String,
    trim: true
  },
  pages: {
    type: [String],
    required: [true, 'Будь ласка, додайте посилання на сторінки глави']
  }
}, {
  timestamps: true
});

// Додаємо індекс для швидкого пошуку глав конкретної манґи
ChapterSchema.index({ manga: 1, chapterNumber: 1 }, { unique: true });

module.exports = mongoose.model('Chapter', ChapterSchema);
