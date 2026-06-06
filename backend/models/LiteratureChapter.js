const mongoose = require('mongoose');

const LiteratureChapterSchema = new mongoose.Schema({
  literature: {
    type: mongoose.Schema.ObjectId,
    ref: 'Literature',
    required: [true, 'Будь ласка, вкажіть до якого твору належить ця глава']
  },
  title: {
    type: String,
    required: [true, 'Будь ласка, додайте назву глави'],
    trim: true
  },
  chapterNumber: {
    type: Number,
    required: [true, 'Будь ласка, вкажіть номер глави']
  },
  content: {
    type: String,
    required: [true, 'Глава не може бути порожньою']
  }
}, {
  timestamps: true
});

// Унікальний індекс для глав одного твору
LiteratureChapterSchema.index({ literature: 1, chapterNumber: 1 }, { unique: true });

module.exports = mongoose.model('LiteratureChapter', LiteratureChapterSchema);
