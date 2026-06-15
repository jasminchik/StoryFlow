const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Будь ласка, додайте заголовок новини'],
    trim: true,
    maxlength: [100, 'Заголовок не може бути довшим за 100 символів']
  },
  content: {
    type: String,
    required: [true, 'Будь ласка, додайте зміст новини']
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  manga: {
    type: mongoose.Schema.ObjectId,
    ref: 'Manga',
    required: [function() { return this.category === 'manga_update'; }, 'Для новини тайтлу необхідно вказати сам тайтл']
  },
  category: {
    type: String,
    enum: ['system', 'manga_update', 'event'],
    default: 'manga_update'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);
