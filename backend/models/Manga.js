const mongoose = require('mongoose');

const MangaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Будь ласка, додайте назву твору'],
    trim: true
  },
  alternativeTitle: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Будь ласка, додайте опис твору']
  },
  coverImage: {
    type: String,
    default: 'no-photo.jpg'
  },
  bannerImage: {
    type: String,
    default: null
  },
  type: {
    type: String,
    required: [true, 'Будь ласка, оберіть тип твору'],
    enum: {
      values: ['Манґа', 'Манхва', 'Маньхуа', 'Комікс'],
      message: '{VALUE} не є підтримуваним типом твору'
    }
  },
  status: {
    type: String,
    required: [true, 'Будь ласка, оберіть статус твору'],
    enum: {
      values: ['Анонс', 'В процесі', 'Завершено', 'Призупинено'],
      message: '{VALUE} не є підтримуваним статусом'
    },
    default: 'Анонс'
  },
  releaseYear: {
    type: Number,
    required: [true, 'Будь ласка, додайте рік випуску']
  },
  genres: {
    type: [String],
    required: [true, 'Будь ласка, додайте принаймні один жанр']
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Твір повинен мати автора (користувача, що його додав)']
  },
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Manga', MangaSchema);
