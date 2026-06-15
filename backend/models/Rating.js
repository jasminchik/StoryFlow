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

// Статичний метод для розрахунку середнього рейтингу та статистики
RatingSchema.statics.getAverageRating = async function(mangaId) {
  const stats = await this.aggregate([
    {
      $match: { manga: mangaId }
    },
    {
      $group: {
        _id: '$manga',
        averageRating: { $avg: '$score' },
        ratingCount: { $count: {} },
        // Групуємо за оцінками для детальної статистики
        scores: { $push: '$score' }
      }
    }
  ]);

  try {
    if (stats.length > 0) {
      const { scores, averageRating, ratingCount } = stats[0];
      
      // Ініціалізуємо об'єкт статистики оцінок (1-10)
      const ratingStats = {};
      for (let i = 1; i <= 10; i++) {
        const count = scores.filter(s => s === i).length;
        const percentage = ratingCount > 0 ? (count / ratingCount) * 100 : 0;
        ratingStats[i] = {
          count,
          percentage: parseFloat(percentage.toFixed(1))
        };
      }

      await mongoose.model('Manga').findByIdAndUpdate(mangaId, {
        averageRating: parseFloat(averageRating.toFixed(1)),
        ratingCount,
        ratingStats // Додаємо статистику в модель Манґи
      });
    } else {
      await mongoose.model('Manga').findByIdAndUpdate(mangaId, {
        averageRating: 0,
        ratingCount: 0,
        ratingStats: {}
      });
    }
  } catch (err) {
    console.error('Помилка оновлення рейтингу манґи:', err);
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
