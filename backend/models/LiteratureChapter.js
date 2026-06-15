const mongoose = require('mongoose');

const LiteratureChapterSchema = new mongoose.Schema({
  literature: {
    type: mongoose.Schema.ObjectId,
    ref: 'Literature',
    required: [true, 'Будь ласка, вкажіть до якого твору належить цей розділ']
  },
  title: {
    type: String,
    required: [true, 'Будь ласка, додайте назву розділу'],
    trim: true
  },
  chapterNumber: {
    type: Number,
    required: [true, 'Будь ласка, вкажіть номер розділу']
  },
  content: {
    type: String,
    required: [true, 'Розділ не може бути порожнім']
  }
}, {
  timestamps: true
});

// Унікальний індекс для розділів одного твору
LiteratureChapterSchema.index({ literature: 1, chapterNumber: 1 }, { unique: true });

module.exports = mongoose.model('LiteratureChapter', LiteratureChapterSchema);
