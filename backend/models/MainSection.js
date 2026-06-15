const mongoose = require('mongoose');

const MainSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Назва секції обов\'язкова']
  },
  key: {
    type: String,
    required: [true, 'Унікальний ключ обов\'язковий'],
    unique: true
  },
  mangas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manga'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('MainSection', MainSectionSchema);
