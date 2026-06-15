const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Заголовок новини обов\'язковий'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Текст новини обов\'язковий']
  },
  category: {
    type: String,
    enum: ['Системні', 'Оновлення', 'Важливе', 'Інше'],
    default: 'Інше'
  },
  coverUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('News', NewsSchema);
