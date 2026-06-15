const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  manga: {
    type: mongoose.Schema.ObjectId,
    ref: 'Manga',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  }
}, {
  timestamps: true
});

// Забороняємо дублікати оцінок від одного юзера для одного тайтлу
RatingSchema.index({ manga: 1, user: 1 }, { unique: true });

// Статичний метод для розрахунку середнього рейтингу
RatingSchema.statics.getAverageRating = async function(mangaId) {
  const obj = await this.aggregate([
    {
      $match: { manga: mangaId }
    },
    {
      $group: {
        _id: '$manga',
        averageRating: { $avg: '$score' },
        ratingCount: { $count: {} }
      }
    }
  ]);

  try {
    if (obj.length > 0) {
      await mongoose.model('Manga').findByIdAndUpdate(mangaId, {
        averageRating: parseFloat(obj[0].averageRating.toFixed(1)),
        ratingCount: obj[0].ratingCount
      });
    } else {
      await mongoose.model('Manga').findByIdAndUpdate(mangaId, {
        averageRating: 0,
        ratingCount: 0
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Викликаємо розрахунок після збереження
RatingSchema.post('save', function() {
  this.constructor.getAverageRating(this.manga);
});

// Викликаємо розрахунок перед видаленням (через middleware видалення)
RatingSchema.post('remove', function() {
  this.constructor.getAverageRating(this.manga);
});

module.exports = mongoose.model('Rating', RatingSchema);
