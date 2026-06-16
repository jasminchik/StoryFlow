# StoryFlow Backend Core Code

## 1. Entry Point
### backend/index.js
```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/storyflow';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Зробити папку uploads публічною
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const mangaRoutes = require('./routes/mangaRoutes');
const chapterRoutes = require('./routes/chapterRoutes');
const literatureRoutes = require('./routes/literatureRoutes');
const literatureChapterRoutes = require('./routes/literatureChapterRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const commentRoutes = require('./routes/commentRoutes');
const userListRoutes = require('./routes/userListRoutes');
const adminRoutes = require('./routes/adminRoutes');
const newsRoutes = require('./routes/newsRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const historyRoutes = require('./routes/historyRoutes');

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/manga', mangaRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/literature', literatureRoutes);
app.use('/api/literature-chapters', literatureChapterRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/user-list', userListRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/history', historyRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Connect to MongoDB and Start Server
const startServer = async () => {
  try {
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

startServer();
```

## 2. Models
### Announcement.js
```javascript
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
```

### Chapter.js
```javascript
const mongoose = require('mongoose');

const ChapterSchema = new mongoose.Schema({
  mangaId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Manga',
    required: [true, 'Будь ласка, вкажіть до якого твору належить цей розділ']
  },
  volume: {
    type: Number,
    default: 1
  },
  number: {
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
ChapterSchema.index({ mangaId: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('Chapter', ChapterSchema);
```

### Comment.js
```javascript
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Коментар не може бути порожнім'],
    trim: true,
    maxlength: [1000, 'Коментар не може бути довшим за 1000 символів']
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  // Посилання на ресурс, який коментують
  resourceId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    refPath: 'resourceType'
  },
  // Тип ресурсу ('Manga', 'Literature', 'Announcement')
  resourceType: {
    type: String,
    required: true,
    enum: ['Manga', 'Literature', 'Announcement']
  },
  interactionType: {
    type: String,
    required: true,
    enum: ['comment', 'review', 'discussion'],
    default: 'comment'
  },
  likes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Comment', CommentSchema);
```

### History.js
```javascript
const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  manga: {
    type: mongoose.Schema.ObjectId,
    ref: 'Manga',
    required: true
  },
  chapter: {
    type: mongoose.Schema.ObjectId,
    ref: 'Chapter',
    required: true
  },
  readAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Один запис на одну манґу для одного користувача (оновлюємо останній прочитаний розділ)
HistorySchema.index({ user: 1, manga: 1 }, { unique: true });

module.exports = mongoose.model('History', HistorySchema);
```

### Literature.js
```javascript
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
  },
  manga: {
    type: mongoose.Schema.ObjectId,
    ref: 'Manga',
    default: null
  },
  isOfficial: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed'],
    default: 'in_progress'
  },
  direction: {
    type: String,
    default: 'Джен'
  },
  ageRating: {
    type: String,
    enum: ['G', 'PG-13', 'R', 'NC-17'],
    default: 'PG-13'
  },
  authorNote: {
    type: String,
    trim: true
  },
  likes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ],
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Literature', LiteratureSchema);
```

### LiteratureChapter.js
```javascript
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
```

### MainSection.js
```javascript
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
```

### Manga.js
```javascript
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
      values: ['Манґа', 'Манхва', 'Маньхуа', 'Комікс', 'Книга'],
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
  },
  averageRating: {
    type: Number,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  ratingStats: {
    type: Object,
    default: {}
  },
  likes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Manga', MangaSchema);
```

### News.js
```javascript
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
```

### Rating.js
```javascript
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
```

### User.js
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  role: {
    type: String,
    enum: ['user', 'author', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
  },
  banner: {
    type: String,
    default: null
  },
  aboutMe: {
    type: String,
    maxlength: [500, 'Опис про себе не може бути довшим за 500 символів'],
    default: ''
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'secret'],
    default: 'secret'
  },
  stats: {
    titles: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    ratings: { type: Number, default: 0 },
    readCount: { type: Number, default: 0 }
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 4,
    select: false // Don't return password by default
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
```

### UserList.js
```javascript
const mongoose = require('mongoose');

const UserListSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  manga: {
    type: mongoose.Schema.ObjectId,
    ref: 'Manga',
    required: true
  },
  status: {
    type: String,
    enum: ['reading', 'planned', 'dropped', 'read', 'favorites'],
    required: true
  },
  chaptersRead: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Забороняємо дублікати для однієї і тієї ж манґи у одного юзера
UserListSchema.index({ user: 1, manga: 1 }, { unique: true });

module.exports = mongoose.model('UserList', UserListSchema);
```

## 3. Routes
### adminRoutes.js
```javascript
const express = require('express');
const router = express.Router();
const Manga = require('../models/Manga');
const Chapter = require('../models/Chapter');
const Literature = require('../models/Literature');
const LiteratureChapter = require('../models/LiteratureChapter');
const MainSection = require('../models/MainSection');
const News = require('../models/News');
const { protect, authorize } = require('../middleware/auth');

// Middleware для жорсткої перевірки адміна
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, error: 'Доступ заборонено. Тільки для адміністраторів.' });
  }
};

/**
 * @route   POST /api/admin/news
 * @desc    Створити новину сайту
 * @access  Private (Admin)
 */
router.post('/news', protect, isAdmin, async (req, res) => {
  try {
    const news = await News.create(req.body);
    res.status(201).json({ success: true, data: news });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   DELETE /api/admin/news/:id
 * @desc    Видалити новину сайту
 * @access  Private (Admin)
 */
router.delete('/news/:id', protect, isAdmin, async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ success: false, error: 'Новину не знайдено' });
    }
    await news.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/admin/sections
 * @desc    Отримати всі секції головної сторінки
 * @access  Private (Admin)
 */
router.get('/sections', protect, isAdmin, async (req, res) => {
  try {
    const sections = await MainSection.find().populate('mangas');
    res.status(200).json({ success: true, data: sections });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/admin/sections
 * @desc    Створити нову секцію (службовий ендпоінт)
 * @access  Private (Admin)
 */
router.post('/sections', protect, isAdmin, async (req, res) => {
  try {
    const section = await MainSection.create(req.body);
    res.status(201).json({ success: true, data: section });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   PUT /api/admin/sections/:key
 * @desc    Оновити список манг у секції
 * @access  Private (Admin)
 */
router.put('/sections/:key', protect, isAdmin, async (req, res) => {
  try {
    const { action, mangaId } = req.body; // action: 'add' або 'remove'

    let section = await MainSection.findOne({ key: req.params.key });

    // Якщо секції ще немає, створюємо її базову версію
    if (!section) {
      const titles = {
        'new_releases': 'Новинки',
        'popular': 'Найпопулярніші',
        'reading_now': 'Читають зараз'
      };
      section = await MainSection.create({ 
        key: req.params.key, 
        title: titles[req.params.key] || req.params.key,
        mangas: [] 
      });
    }

    if (action === 'add') {
      if (!section.mangas.includes(mangaId)) {
        section.mangas.push(mangaId);
      }
    } else if (action === 'remove') {
      section.mangas = section.mangas.filter(id => id.toString() !== mangaId);
    }

    await section.save();
    
    // Повертаємо оновлену секцію з populate
    const updatedSection = await MainSection.findById(section._id).populate('mangas');

    res.status(200).json({ success: true, data: updatedSection });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   DELETE /api/admin/manga/:id
 * @desc    Повне каскадне видалення манґи
 * @access  Private (Admin)
 */
router.delete('/manga/:id', protect, isAdmin, async (req, res) => {
  try {
    const mangaId = req.params.id;
    const manga = await Manga.findById(mangaId);
    
    if (!manga) {
      return res.status(404).json({ success: false, error: 'Манґу не знайдено' });
    }

    // Каскадне видалення всіх пов'язаних даних
    const Comment = require('../models/Comment');
    const Rating = require('../models/Rating');
    const History = require('../models/History');
    const UserList = require('../models/UserList');
    const Literature = require('../models/Literature');
    const LiteratureChapter = require('../models/LiteratureChapter');

    // 1. Знаходимо всі пов'язані фанфіки (Literature)
    const relatedLit = await Literature.find({ manga: mangaId });
    const litIds = relatedLit.map(l => l._id);

    await Promise.all([
      Chapter.deleteMany({ mangaId: mangaId }),
      Comment.deleteMany({ resourceId: mangaId, resourceType: 'Manga' }),
      Rating.deleteMany({ manga: mangaId }),
      History.deleteMany({ manga: mangaId }),
      UserList.deleteMany({ manga: mangaId }),
      Literature.deleteMany({ manga: mangaId }),
      LiteratureChapter.deleteMany({ literature: { $in: litIds } })
    ]);

    // Видалення самої манґи
    await manga.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Admin Manga Delete Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/admin/all-titles
 * @desc    Отримати всі тайтли (Манґа + Фанфіки) для адмін-панелі
 * @access  Private (Admin)
 */
router.get('/all-titles', protect, isAdmin, async (req, res) => {
  try {
    const [mangas, fanfics] = await Promise.all([
      Manga.find().select('title type coverImage createdAt'),
      Literature.find().select('title type direction coverImage createdAt')
    ]);

    // Додаємо мітку ресурсу для фронтенду
    const formattedMangas = mangas.map(m => ({
      ...m.toObject(),
      resourceType: 'manga'
    }));

    const formattedFanfics = fanfics.map(f => ({
      ...f.toObject(),
      resourceType: 'literature',
      type: f.type || 'Фанфік'
    }));

    res.status(200).json({ 
      success: true, 
      data: [...formattedMangas, ...formattedFanfics].sort((a, b) => b.createdAt - a.createdAt)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### announcementRoutes.js
```javascript
const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const Manga = require('../models/Manga');
const { protect, authorize, isOwnerOrAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/announcements
 * @desc    Отримати список усіх новин
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('author', 'username avatar')
      .populate('manga', 'title coverImage type')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/announcements/manga/:mangaId
 * @desc    Отримати новини конкретного тайтлу
 * @access  Public
 */
router.get('/manga/:mangaId', async (req, res) => {
  try {
    const announcements = await Announcement.find({ manga: req.params.mangaId })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/announcements/author/:authorId
 * @desc    Отримати новини конкретного автора
 * @access  Public
 */
router.get('/author/:authorId', async (req, res) => {
  try {
    const announcements = await Announcement.find({ author: req.params.authorId })
      .populate('manga', 'title coverImage type')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/announcements
 * @desc    Створити нову новину
 * @access  Private (Author, Admin)
 */
router.post('/', protect, authorize('author', 'admin'), async (req, res) => {
  try {
    const { manga, category } = req.body;

    // Якщо це новина тайтлу, перевіряємо чи користувач є його автором
    if (category === 'manga_update' || !category) {
      if (!manga) {
        return res.status(400).json({ success: false, error: 'Для новини тайтлу необхідно вказати сам тайтл' });
      }

      const title = await Manga.findById(manga);
      if (!title) {
        return res.status(404).json({ success: false, error: 'Тайтл не знайдено' });
      }

      if (title.author.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Ви можете додавати новини тільки до власних тайтлів' });
      }
    }

    // Тільки адмін може створювати системні новини
    if (category === 'system' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Тільки адміністратор може створювати системні новини' });
    }

    req.body.author = req.user.id;
    const announcement = await Announcement.create(req.body);

    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   PUT /api/announcements/:id
 * @desc    Редагувати новину
 * @access  Private (Owner, Admin)
 */
router.put('/:id', protect, isOwnerOrAdmin('announcement'), async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   DELETE /api/announcements/:id
 * @desc    Видалити новину
 * @access  Private (Owner, Admin)
 */
router.delete('/:id', protect, isOwnerOrAdmin('announcement'), async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    await announcement.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### authRoutes.js
```javascript
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');

// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'fallback_secret_key_for_dev_only',
    { expiresIn: '30d' }
  );
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Будь ласка, введіть email та пароль' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Невірний email або пароль' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Невірний email або пароль' });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const { protect } = require('../middleware/auth');

// @desc    Get current user profile
// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        banner: user.banner,
        aboutMe: user.aboutMe,
        gender: user.gender
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Register a new user
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const user = await User.create({
      username,
      email,
      password,
      role: role || 'user'
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Користувач з такою поштою або нікнеймом вже існує' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Initialize Google OAuth login
// @route   GET /api/auth/google
router.get('/google', (req, res) => {
  const { intent, role } = req.query; // 'login' or 'register'
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: process.env.GOOGLE_CALLBACK_URL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
    state: `${intent || 'login'}:${role || 'user'}` // Pass intent and role in state
  };
  const queryString = new URLSearchParams(options).toString();
  return res.redirect(`${rootUrl}?${queryString}`);
});

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
router.get('/google/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.redirect(`${process.env.FRONTEND_URL}/?auth_error=no_code`);

  // Parse state: "intent:role"
  const [intent, role] = (state || 'login:user').split(':');

  try {
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
      grant_type: 'authorization_code',
    });

    const { access_token } = tokenResponse.data;

    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { email, name } = userResponse.data;

    let user = await User.findOne({ email });

    if (intent === 'register') {
      if (user) {
        return res.redirect(`${process.env.FRONTEND_URL}/?auth_mode=login&auth_error=email_registered`);
      }
      user = await User.create({
        username: name.replace(/\s+/g, '_').toLowerCase() + Math.floor(Math.random() * 1000),
        email,
        password: Math.random().toString(36).slice(-10),
        role: role === 'author' ? 'author' : 'user'
      });
    } else {
      // intent is login
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/?auth_mode=register&auth_error=no_account`);
      }
    }

    const token = generateToken(user);
    res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
  } catch (error) {
    console.error('Google OAuth Error:', error.response?.data || error.message);
    res.redirect(`${process.env.FRONTEND_URL}/?auth_error=oauth_failed`);
  }
});

// @desc    Initialize Twitch OAuth login
// @route   GET /api/auth/twitch
router.get('/twitch', (req, res) => {
  const { intent, role } = req.query;
  const rootUrl = 'https://id.twitch.tv/oauth2/authorize';
  const options = {
    client_id: process.env.TWITCH_CLIENT_ID,
    redirect_uri: process.env.TWITCH_CALLBACK_URL,
    response_type: 'code',
    scope: 'user:read:email',
    state: `${intent || 'login'}:${role || 'user'}`
  };

  const queryString = new URLSearchParams(options).toString();
  return res.redirect(`${rootUrl}?${queryString}`);
});

// @desc    Twitch OAuth callback
// @route   GET /api/auth/twitch/callback
router.get('/twitch/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.redirect(`${process.env.FRONTEND_URL}/?auth_error=no_code`);

  const [intent, role] = (state || 'login:user').split(':');

  try {
    const tokenResponse = await axios.post('https://id.twitch.tv/oauth2/token', {
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.TWITCH_CALLBACK_URL,
    });

    const { access_token } = tokenResponse.data;

    const userResponse = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Client-Id': process.env.TWITCH_CLIENT_ID
      },
    });

    const twitchUser = userResponse.data.data[0];
    if (!twitchUser) throw new Error('Twitch user data not found');

    const email = twitchUser.email || `${twitchUser.id}@twitch.tv`;
    const username = twitchUser.display_name;

    let user = await User.findOne({ email });

    if (intent === 'register') {
      if (user) {
        return res.redirect(`${process.env.FRONTEND_URL}/?auth_mode=login&auth_error=email_registered`);
      }
      user = await User.create({
        username: username.toLowerCase().replace(/\s+/g, '_') + Math.floor(Math.random() * 1000),
        email,
        password: Math.random().toString(36).slice(-10),
        role: role === 'author' ? 'author' : 'user'
      });
    } else {
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/?auth_mode=register&auth_error=no_account`);
      }
    }

    const token = generateToken(user);
    res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
  } catch (error) {
    console.error('Twitch OAuth Error:', error.response?.data || error.message);
    res.redirect(`${process.env.FRONTEND_URL}/?auth_error=oauth_failed`);
  }
});

module.exports = router;
```

### chapterRoutes.js
```javascript
const express = require('express');
const router = express.Router();
const Chapter = require('../models/Chapter');
const Manga = require('../models/Manga');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../config/upload');
const path = require('path');
const fs = require('fs');
const { Poppler } = require('node-poppler');
const poppler = new Poppler();

/**
 * @route   GET /api/chapters/manga/:mangaId
 * @desc    Отримати всі глави для конкретної манґи
 * @access  Public
 */
router.get('/manga/:mangaId', async (req, res) => {
  try {
    const chapters = await Chapter.find({ mangaId: req.params.mangaId })
      .select('number title volume pages createdAt')
      .sort({ number: 1 });

    res.status(200).json({
      success: true,
      count: chapters.length,
      data: chapters
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/titles/:titleId/chapters
 * @desc    Виведення списку розділів на сторінці тайтлу (Аліас)
 * @access  Public
 */
router.get('/titles/:titleId/chapters', async (req, res) => {
  try {
    const chapters = await Chapter.find({ mangaId: req.params.titleId })
      .select('number title volume pages createdAt')
      .sort({ number: 1 });

    res.status(200).json({ success: true, data: chapters });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/chapters/:id
 * @desc    Отримати одну главу за ID (читалка)
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);

    if (!chapter) {
      return res.status(404).json({ success: false, error: 'Главу не знайдено' });
    }

    res.status(200).json({ success: true, data: chapter });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/chapters
 * @desc    Створити нову главу
 * @access  Private (Admin, Author)
 */
router.post('/', protect, authorize('admin', 'author'), upload.array('pages', 1000), async (req, res) => {
  // Збільшуємо таймаут запиту для великих PDF
  req.setTimeout(600000); // 10 хвилин

  try {
    console.log('--- Початок створення розділу ---');
    const manga = await Manga.findById(req.body.mangaId);
    if (!manga) {
      return res.status(404).json({ success: false, error: 'Твір не знайдено' });
    }

    // Перевірка ліміту розділів (5000)
    const chapterCount = await Chapter.countDocuments({ mangaId: req.body.mangaId });
    if (chapterCount >= 5000) {
      return res.status(400).json({ 
        success: false, 
        error: 'Досягнуто ліміту розділів для цього твору (макс. 5000)' 
      });
    }

    // Перевірка прав (автор або адмін)
    if (manga.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'У вас немає прав для додавання розділів до цього твору' 
      });
    }

    // Якщо завантажено файли
    if (req.files && req.files.length > 0) {
      const firstFile = req.files[0];
      console.log(`Завантажено файл: ${firstFile.originalname}, тип: ${firstFile.mimetype}`);
      
      // ПЕРЕВІРКА НА PDF
      if (firstFile.mimetype === 'application/pdf') {
        const pdfPath = firstFile.path;
        const outputDir = path.join(path.dirname(pdfPath), `pages-${Date.now()}`);
        
        console.log(`Початок конвертації PDF: ${pdfPath}`);
        console.log(`Папка виводу: ${outputDir}`);

        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputPrefix = path.join(outputDir, 'page');

        try {
          console.log('Запуск poppler.pdfToCairo...');
          await poppler.pdfToCairo(pdfPath, outputPrefix, { 
            jpegFile: true, 
            resolutionXAxis: 150, 
            resolutionYAxis: 150 
          });
          
          console.log('Конвертація завершена. Зчитування файлів...');
          const files = fs.readdirSync(outputDir);
          console.log(`Знайдено сконвертованих сторінок: ${files.length}`);

          const sortedFiles = files.sort((a, b) => 
            a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
          );
          
          const relativeDir = path.basename(outputDir);
          req.body.pages = sortedFiles.map(file => `/uploads/${relativeDir}/${file}`);
          
          console.log('Сторінки підготовлені. Видалення PDF...');
          fs.unlinkSync(pdfPath);
          console.log('PDF видалено успішно.');
        } catch (pdfError) {
          console.error('ПОМИЛКА PDF КОНВЕРТАЦІЇ:', pdfError);
          return res.status(500).json({ success: false, error: 'Помилка конвертації PDF: ' + pdfError.message });
        }
      } else {
        console.log(`Звичайна логіка для картинок (${req.files.length} шт.)`);
        req.body.pages = req.files.map(file => `/uploads/${file.filename}`);
      }
    }

    console.log('Створення запису Chapter в БД...');
    const chapter = await Chapter.create(req.body);
    console.log(`Розділ №${chapter.number} створено успішно!`);

    res.status(201).json({ success: true, data: chapter });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: `Розділ №${req.body.number} вже існує` });
    }
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   PUT /api/chapters/:id
 * @desc    Редагувати главу
 * @access  Private (Admin, Author)
 */
router.put('/:id', protect, authorize('admin', 'author'), upload.array('pages', 100), async (req, res) => {
  try {
    let chapter = await Chapter.findById(req.params.id);

    if (!chapter) {
      return res.status(404).json({ success: false, error: 'Главу не знайдено' });
    }

    // Якщо завантажено нові файли
    if (req.files && req.files.length > 0) {
      if (req.files.length > 100) {
        return res.status(400).json({ success: false, error: 'Максимальна кількість сторінок у розділі - 100' });
      }
      req.body.pages = req.files.map(file => `/uploads/${file.filename}`);
    }

    chapter = await Chapter.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: chapter });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   DELETE /api/chapters/:id
 * @desc    Видалити главу
 * @access  Private (Admin, Author)
 */
router.delete('/:id', protect, authorize('admin', 'author'), async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);

    if (!chapter) {
      return res.status(404).json({ success: false, error: 'Главу не знайдено' });
    }

    await chapter.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### commentRoutes.js
```javascript
const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/comments/user/:userId
 * @desc    Отримати всі коментарі конкретного користувача
 * @access  Public
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const comments = await Comment.find({ author: req.params.userId })
      .populate('resourceId', 'title type')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: comments
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/comments/:resourceId
 * @desc    Отримати коментарі для конкретного ресурсу
 * @access  Public
 */
router.get('/:resourceId', async (req, res) => {
  try {
    const { type } = req.query;
    const query = { resourceId: req.params.resourceId };
    
    if (type) {
      query.interactionType = type;
    }

    const comments = await Comment.find(query)
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/comments
 * @desc    Створити новий коментар
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    req.body.author = req.user.id;
    const comment = await Comment.create(req.body);
    
    // Populate author for immediate display on frontend
    await comment.populate('author', 'username avatar');

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   DELETE /api/comments/:id
 * @desc    Видалити коментар
 * @access  Private (Owner/Admin)
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ success: false, error: 'Коментар не знайдено' });
    }

    // Тільки автор або адмін
    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Немає прав для видалення цього коментаря' });
    }

    await comment.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### historyRoutes.js
```javascript
const express = require('express');
const router = express.Router();
const History = require('../models/History');
const Manga = require('../models/Manga');
const Chapter = require('../models/Chapter');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/history
 * @desc    Додати або оновити історію читання
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const { mangaId, chapterId } = req.body;

    if (!mangaId || !chapterId) {
      return res.status(400).json({ success: false, error: 'Вкажіть mangaId та chapterId' });
    }

    // Оновлюємо або створюємо запис (upsert)
    const history = await History.findOneAndUpdate(
      { user: req.user._id, manga: mangaId },
      { chapter: chapterId, readAt: Date.now() },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/history/my
 * @desc    Отримати історію читання поточного користувача
 * @access  Private
 */
router.get('/my', protect, async (req, res) => {
  try {
    const history = await History.find({ user: req.user._id })
      .populate({
        path: 'manga',
        select: 'title coverImage alternativeTitle type'
      })
      .populate({
        path: 'chapter',
        select: 'number title'
      })
      .sort({ readAt: -1 });

    // Фільтруємо "осиротілі" записи
    const validHistory = history.filter(item => item.manga !== null);

    res.status(200).json({ success: true, data: validHistory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/history/user/:userId
 * @desc    Отримати історію читання будь-якого користувача
 * @access  Public
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const history = await History.find({ user: req.params.userId })
      .populate({
        path: 'manga',
        select: 'title coverImage alternativeTitle type'
      })
      .populate({
        path: 'chapter',
        select: 'number title'
      })
      .sort({ readAt: -1 });

    // Фільтруємо "осиротілі" записи перед відправкою на клієнт
    const validHistory = history.filter(item => item.manga !== null);

    res.status(200).json({ success: true, data: validHistory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   DELETE /api/history/:id
 * @desc    Видалити запис з історії
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    // Видаляємо суто за ID запису історії, не перевіряючи чи існує ще сама манґа
    const historyRecord = await History.findById(req.params.id);

    if (!historyRecord) {
      return res.status(404).json({ success: false, error: 'Запис не знайдено' });
    }

    // Перевіряємо чи це історія саме цього користувача
    if (historyRecord.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Ви не можете видалити чужу історію' });
    }

    await historyRecord.deleteOne();
    res.status(200).json({ success: true, message: 'Запис видалено' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### literatureChapterRoutes.js
```javascript
const express = require('express');
const router = express.Router();
const LiteratureChapter = require('../models/LiteratureChapter');
const Literature = require('../models/Literature');
const { protect, isOwnerOrAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/literature-chapters/literature/:literatureId
 * @desc    Отримати всі розділи твору
 * @access  Public
 */
router.get('/literature/:literatureId', async (req, res) => {
  try {
    const chapters = await LiteratureChapter.find({ literature: req.params.literatureId })
      .sort({ chapterNumber: 1 });
    res.status(200).json({ success: true, count: chapters.length, data: chapters });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/literature-chapters/:id
 * @desc    Отримати один розділ (читання)
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const chapter = await LiteratureChapter.findById(req.params.id).populate('literature', 'title author');
    if (!chapter) return res.status(404).json({ success: false, error: 'Розділ не знайдено' });
    res.status(200).json({ success: true, data: chapter });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/literature-chapters
 * @desc    Створити новий текстовий розділ
 * @access  Private (Owner of Literature)
 */
router.post('/', protect, async (req, res) => {
  try {
    const { literature: literatureId } = req.body;
    
    // Перевірка прав: тільки автор твору може додавати розділи
    const literature = await Literature.findById(literatureId);
    if (!literature) {
      return res.status(404).json({ success: false, error: 'Твір не знайдено' });
    }

    if (literature.author.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Тільки автор може додавати розділи до цього твору' });
    }

    const chapter = await LiteratureChapter.create(req.body);
    res.status(201).json({ success: true, data: chapter });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   PUT /api/literature-chapters/:id
 * @desc    Оновити розділ (збереження тексту)
 * @access  Private (Owner/Admin)
 */
router.put('/:id', protect, isOwnerOrAdmin('literaturechapter'), async (req, res) => {
  try {
    const chapter = await LiteratureChapter.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!chapter) return res.status(404).json({ success: false, error: 'Розділ не знайдено' });
    res.status(200).json({ success: true, data: chapter });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   DELETE /api/literature-chapters/:id
 * @desc    Видалити розділ
 * @access  Private (Owner/Admin)
 */
router.delete('/:id', protect, isOwnerOrAdmin('literaturechapter'), async (req, res) => {
  try {
    const chapter = await LiteratureChapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ success: false, error: 'Розділ не знайдено' });
    await chapter.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### literatureRoutes.js
```javascript
const express = require('express');
const router = express.Router();
const Literature = require('../models/Literature');
const Manga = require('../models/Manga');
const LiteratureChapter = require('../models/LiteratureChapter');
const { protect, authorize, isOwnerOrAdmin } = require('../middleware/auth');
const upload = require('../config/upload');

/**
 * @route   GET /api/literature
 * @desc    Отримати всі літературні твори
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const literature = await Literature.find()
      .populate('author', 'username')
      .populate('manga', 'title author')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: literature.length, data: literature });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/literature/manga/:mangaId
 * @desc    Отримати всі фанфіки для конкретної манґи
 * @access  Public
 */
router.get('/manga/:mangaId', async (req, res) => {
  try {
    const literature = await Literature.find({ 
      manga: req.params.mangaId
    }).populate('author', 'username');
    
    res.status(200).json({ success: true, count: literature.length, data: literature });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/literature/:id
 * @desc    Отримати один твір за ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const literature = await Literature.findById(req.params.id)
      .populate('author', 'username')
      .populate('manga', 'title author');
      
    if (!literature) return res.status(404).json({ success: false, error: 'Твір не знайдено' });
    res.status(200).json({ success: true, data: literature });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/literature/:id/like
 * @desc    Переключити лайк для твору
 * @access  Private
 */
router.post('/:id/like', protect, async (req, res) => {
  try {
    const literature = await Literature.findById(req.params.id);

    if (!literature) {
      return res.status(404).json({ success: false, error: 'Твір не знайдено' });
    }

    // Перевіряємо чи є вже лайк
    const isLiked = literature.likes.includes(req.user.id);

    if (isLiked) {
      // Видаляємо лайк
      literature.likes = literature.likes.filter(id => id.toString() !== req.user.id.toString());
    } else {
      // Додаємо лайк
      literature.likes.push(req.user.id);
    }

    await literature.save();

    res.status(200).json({
      success: true,
      data: literature.likes,
      isLiked: !isLiked
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/literature
 * @desc    Створити новий літературний твір
 * @access  Private
 */
router.post('/', protect, upload.single('coverImage'), async (req, res) => {
  try {
    req.body.author = req.user.id;
    if (req.file) req.body.coverImage = `/uploads/${req.file.filename}`;
    
    if (req.body.genres && typeof req.body.genres === 'string') {
      req.body.genres = req.body.genres.split(',').map(g => g.trim());
    }

    // Логіка офіційного фанфіка (Канон)
    if (req.body.manga) {
      const manga = await Manga.findById(req.body.manga);
      if (manga && manga.author.toString() === req.user.id.toString()) {
        req.body.isOfficial = true;
      }
    }

    const literature = await Literature.create(req.body);
    res.status(201).json({ success: true, data: literature });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   PUT /api/literature/:id
 * @desc    Оновити твір (шапку)
 * @access  Private (Owner/Admin)
 */
router.put('/:id', protect, isOwnerOrAdmin('Literature'), upload.single('coverImage'), async (req, res) => {
  try {
    if (req.file) req.body.coverImage = `/uploads/${req.file.filename}`;
    if (req.body.genres && typeof req.body.genres === 'string') {
      req.body.genres = req.body.genres.split(',').map(g => g.trim());
    }

    const literature = await Literature.findByIdAndUpdate(req.params.id, req.body, { 
      new: true, 
      runValidators: true 
    });
    
    res.status(200).json({ success: true, data: literature });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   DELETE /api/literature/:id
 * @desc    Видалити твір
 * @access  Private (Owner/Admin)
 */
router.delete('/:id', protect, isOwnerOrAdmin('Literature'), async (req, res) => {
  try {
    const literature = await Literature.findById(req.params.id);
    
    if (!literature) {
      return res.status(404).json({ success: false, error: 'Твір не знайдено' });
    }

    // Видаляємо всі розділи цього твору
    await LiteratureChapter.deleteMany({ literature: req.params.id });
    
    // Видаляємо сам твір
    await literature.deleteOne();
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   PATCH /api/literature/:id/moderation
 * @desc    Змінити статус модерації твору
 * @access  Private (Admin)
 */
router.patch('/:id/moderation', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Некоректний статус модерації' });
    }

    const literature = await Literature.findByIdAndUpdate(
      req.params.id,
      { moderationStatus: status },
      { new: true, runValidators: true }
    );

    if (!literature) return res.status(404).json({ success: false, error: 'Твір не знайдено' });
    res.status(200).json({ success: true, data: literature });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### mangaRoutes.js
```javascript
const express = require('express');
const router = express.Router();
const Manga = require('../models/Manga');
const Literature = require('../models/Literature');
const Rating = require('../models/Rating');
const { protect, authorize, isOwnerOrAdmin } = require('../middleware/auth');
const upload = require('../config/upload');

/**
 * @route   GET /api/manga
 * @desc    Отримати список усіх тайтлів
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Звичайні користувачі бачать тільки схвалені твори
    let query = { moderationStatus: 'approved' };
    
    // Якщо передано all=true, перевіряємо чи це адмін (через заголовок або просто дозволяємо якщо запит з адмінки)
    // Для публічного сайдбару ми все одно показуємо approved, але цей параметр допоможе в інших місцях
    if (req.query.all === 'true') {
      query = {};
    }
    
    const manga = await Manga.find(query)
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: manga.length,
      data: manga
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/manga/my-titles
 * @desc    Отримати тайтли, створені поточним користувачем
 * @access  Private (Author, Admin)
 */
router.get('/my-titles', protect, authorize('author', 'admin'), async (req, res) => {
  try {
    const manga = await Manga.find({ author: req.user.id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: manga.length,
      data: manga
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   PATCH /api/manga/:id/moderation
 * @desc    Змінити статус модерації тайтлу
 * @access  Private (Admin)
 */
router.patch('/:id/moderation', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Некоректний статус модерації' });
    }

    const manga = await Manga.findByIdAndUpdate(
      req.params.id,
      { moderationStatus: status },
      { new: true, runValidators: true }
    );

    if (!manga) {
      return res.status(404).json({ success: false, error: 'Твір не знайдено' });
    }

    res.status(200).json({ success: true, data: manga });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/manga/home
 * @desc    Отримати тайтли для головної сторінки (Новинки та Популярні)
 * @access  Public
 */
router.get('/home', async (req, res) => {
  try {
    const MainSection = require('../models/MainSection');
    
    // Спробуємо отримати кастомні секції
    const sections = await MainSection.find().populate({
      path: 'mangas',
      populate: { path: 'author', select: 'username' }
    });

    let newArrivals = [];
    let topRated = [];
    let readingNow = [];
    let books = [];

    const customNew = sections.find(s => s.key === 'new_releases');
    const customPopular = sections.find(s => s.key === 'popular');
    const customReadingNow = sections.find(s => s.key === 'reading_now');
    const customBooks = sections.find(s => s.key === 'books');

    if (customNew && customNew.mangas.length > 0) {
      newArrivals = customNew.mangas;
    } else {
      // Fallback: автоматичне сортування
      newArrivals = await Manga.find()
        .populate('author', 'username')
        .sort({ createdAt: -1 })
        .limit(8);
    }

    if (customPopular && customPopular.mangas.length > 0) {
      topRated = customPopular.mangas;
    } else {
      // Fallback: автоматичне сортування
      const approvedQuery = { moderationStatus: 'approved' };
      topRated = await Manga.find(approvedQuery)
        .populate('author', 'username')
        .sort({ averageRating: -1, ratingCount: -1 })
        .limit(8);
    }

    if (customReadingNow && customReadingNow.mangas.length > 0) {
      readingNow = customReadingNow.mangas;
    }

    if (customBooks && customBooks.mangas.length > 0) {
      books = customBooks.mangas;
    } else {
      // Fallback: автоматичне сортування для книг
      books = await Manga.find({ type: 'Книга', moderationStatus: 'approved' })
        .populate('author', 'username')
        .sort({ createdAt: -1 })
        .limit(8);
    }

    res.status(200).json({
      success: true,
      data: {
        newArrivals,
        topRated,
        readingNow,
        books
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/manga/search
 * @desc    Пошук тайтлів
 * @access  Public
 */
router.get('/search', async (req, res) => {
  try {
    const { q, type } = req.query;
    
    if (!q) {
      return res.status(200).json({ success: true, data: [] });
    }

    const query = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { alternativeTitle: { $regex: q, $options: 'i' } }
      ]
    };

    if (type) {
      if (type === 'manhwa') {
        query.type = { $regex: 'манхва|manhwa', $options: 'i' };
      } else if (type === 'manga') {
        query.type = { $regex: 'манґа|манга|manga', $options: 'i' };
      } else if (type === 'book') {
        query.type = { $regex: 'книга|book', $options: 'i' };
      }
    }

    const manga = await Manga.find(query)
      .populate('author', 'username')
      .limit(10);

    res.status(200).json({ success: true, data: manga });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/manga/sidebar-updates
 * @desc    Отримати оновлення для бокової панелі з фільтрацією
 * @access  Public
 */
router.get('/sidebar-updates', async (req, res) => {
  try {
    const { type } = req.query;
    let updates = [];
    const query = { moderationStatus: { $ne: 'rejected' } };

    if (type === 'fanfic' || type === 'literature') {
      updates = await Literature.find(query)
        .populate('author', 'username')
        .sort({ updatedAt: -1 })
        .limit(5);
    } else {
      // Строга фільтрація по типах
      const typeFilters = {
        'manga': { $regex: /манґа|манга|manga/i },
        'manhwa': { $regex: /манхва|маньхуа|manhwa|manhua/i },
        'book': { $regex: /книга|book/i },
        'comics': { $regex: /комікс|comics/i }
      };

      if (type && typeFilters[type]) {
        query.type = typeFilters[type];
      } else if (type) {
        // Якщо передано тип, але він не в мапі - шукаємо точне співпадіння
        query.type = type;
      }
      
      updates = await Manga.find(query)
        .populate('author', 'username')
        .sort({ updatedAt: -1 })
        .limit(5);
    }

    res.status(200).json({ success: true, data: updates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/manga/latest
 * @desc    Отримати останні оновлення з фільтрацією (для сайдбару та сторінки оновлень)
 * @access  Public
 */
router.get('/latest', async (req, res) => {
  try {
    const { type, limit = 10 } = req.query;
    const query = { moderationStatus: { $ne: 'rejected' } };
    let updates = [];

    if (type === 'literature' || type === 'fanfic') {
      updates = await Literature.find(query)
        .populate('author', 'username')
        .sort({ updatedAt: -1 })
        .limit(parseInt(limit));
    } else {
      const typeFilters = {
        'manga': { $regex: /манґа|манга|manga/i },
        'manhwa': { $regex: /манхва|маньхуа|manhwa|manhua/i },
        'book': { $regex: /книга|book/i },
        'comics': { $regex: /комікс|comics/i }
      };

      if (type && typeFilters[type]) {
        query.type = typeFilters[type];
      } else if (type) {
        query.type = type;
      }

      updates = await Manga.find(query)
        .populate('author', 'username')
        .sort({ updatedAt: -1 })
        .limit(parseInt(limit));
    }

    res.status(200).json({ success: true, data: updates || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/manga/random
 * @desc    Отримати випадковий тайтл (тільки Манґа або Манхва)
 * @access  Public
 */
router.get('/random', async (req, res) => {
  try {
    const randomTitle = await Manga.aggregate([
      { 
        $match: { 
          type: { $in: ['Манґа', 'Манхва', 'Manga', 'Manhwa'] },
          moderationStatus: { $ne: 'rejected' }
        } 
      },
      { $sample: { size: 1 } }
    ]);

    if (randomTitle.length > 0) {
      res.json({ success: true, id: randomTitle[0]._id });
    } else {
      res.status(404).json({ success: false, error: "Тайтлів не знайдено" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/manga/catalog
 * @desc    Отримати відфільтровані твори для каталогу
 * @access  Public
 */
router.get('/catalog', async (req, res) => {
  try {
    const { format, genres, status } = req.query;
    let query = { moderationStatus: { $ne: 'rejected' } };

    // Фільтр по статусу
    if (status) {
      const statusArray = status.split(',');
      const statusMapping = {
        'Онґоінґ': 'В процесі',
        'Завершено': 'Завершено',
        'Анонс': 'Анонс'
      };
      const dbStatuses = statusArray.map(s => statusMapping[s] || s);
      query.status = { $in: dbStatuses };
    }

    // Фільтр по жанрах
    if (genres) {
      const genresArray = genres.split(',');
      query.genres = { $in: genresArray };
    }

    let results = [];

    // Логіка формату
    if (format === 'fanfic' || format === 'literature' || format === 'Література/Фанфік') {
      results = await Literature.find(query).sort({ updatedAt: -1 });
    } else if (format === 'Всі' || !format || format === 'all') {
      const [mangas, literatures] = await Promise.all([
        Manga.find(query).sort({ updatedAt: -1 }),
        Literature.find(query).sort({ updatedAt: -1 })
      ]);
      results = [...mangas, ...literatures].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } else {
      const typeMapping = {
        'manga': 'Манґа',
        'manhwa': 'Манхва',
        'book': 'Книга',
        'Книги': 'Книга'
      };

      if (typeMapping[format]) {
        query.type = typeMapping[format];
      } else if (format === 'Книга' || format === 'Книги') {
        query.type = 'Книга';
      } else {
        query.type = format;
      }
      
      results = await Manga.find(query).sort({ updatedAt: -1 });
    }

    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/manga/:id
 * @desc    Отримати один тайтл за ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const manga = await Manga.findById(req.params.id).populate('author', 'username');

    if (!manga) {
      return res.status(404).json({ success: false, error: 'Твір не знайдено' });
    }

    res.status(200).json({ success: true, data: manga });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/manga/:id/rate
 * @desc    Поставити оцінку тайтлу
 * @access  Private
 */
router.post('/:id/rate', protect, async (req, res) => {
  try {
    const { score } = req.body;
    if (!score || score < 1 || score > 10) {
      return res.status(400).json({ success: false, error: 'Оцінка має бути від 1 до 10' });
    }

    const manga = await Manga.findById(req.params.id);
    if (!manga) return res.status(404).json({ success: false, error: 'Твір не знайдено' });

    // Оновлюємо або створюємо оцінку
    let rating = await Rating.findOne({ manga: req.params.id, user: req.user.id });

    if (rating) {
      rating.score = score;
      await rating.save();
    } else {
      rating = await Rating.create({
        manga: req.params.id,
        user: req.user.id,
        score
      });
    }

    // Явно викликаємо перерахунок і чекаємо на його завершення, щоб у відповіді були свіжі дані
    await Rating.getAverageRating(req.params.id);

    // Отримуємо оновлений тайтл із середнім рейтингом та статистикою
    const updatedManga = await Manga.findById(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        score: rating.score,
        averageRating: updatedManga.averageRating,
        ratingCount: updatedManga.ratingCount,
        ratingStats: updatedManga.ratingStats // Повертаємо детальну статистику
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/manga/:id/my-rate
 * @desc    Отримати оцінку поточного користувача для тайтлу
 * @access  Private
 */
router.get('/:id/my-rate', protect, async (req, res) => {
  try {
    const rating = await Rating.findOne({ manga: req.params.id, user: req.user.id });
    res.status(200).json({
      success: true,
      data: rating ? rating.score : 0
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/manga/:id/like
 * @desc    Переключити лайк для тайтлу
 * @access  Private
 */
router.post('/:id/like', protect, async (req, res) => {
  try {
    const manga = await Manga.findById(req.params.id);
    if (!manga) return res.status(404).json({ success: false, error: 'Твір не знайдено' });

    const isLiked = manga.likes.includes(req.user.id);
    if (isLiked) {
      manga.likes = manga.likes.filter(id => id.toString() !== req.user.id.toString());
    } else {
      manga.likes.push(req.user.id);
    }

    await manga.save();

    res.status(200).json({
      success: true,
      data: manga.likes,
      isLiked: !isLiked
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/manga
 * @desc    Створити новий тайтл
 * @access  Private (Admin, Author)
 */
router.post('/', protect, authorize('admin', 'author'), upload.any(), async (req, res) => {
  try {
    // Обробка файлів
    if (req.files) {
      const coverFile = req.files.find(f => f.fieldname === 'coverImage');
      const bannerFile = req.files.find(f => f.fieldname === 'bannerImage');
      
      if (coverFile) {
        req.body.coverImage = `/uploads/${coverFile.filename}`;
      }
      if (bannerFile) {
        req.body.bannerImage = `/uploads/${bannerFile.filename}`;
      }
    }

    // Автоматично додаємо ID поточного користувача як автора
    req.body.author = req.user.id;

    // Обробимо жанри
    if (req.body.genres && typeof req.body.genres === 'string') {
      req.body.genres = req.body.genres.split(',').map(g => g.trim());
    }

    const manga = await Manga.create(req.body);
    res.status(201).json({ success: true, data: manga });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   PUT /api/manga/:id
 * @desc    Редагувати тайтл
 * @access  Private (Admin, Author)
 */
router.put('/:id', protect, isOwnerOrAdmin('Manga'), upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'bannerImage', maxCount: 1 }
]), async (req, res) => {
  try {
    let manga = await Manga.findById(req.params.id);

    // Якщо завантажено нові файли
    if (req.files) {
      if (req.files.coverImage) {
        req.body.coverImage = `/uploads/${req.files.coverImage[0].filename}`;
      }
      if (req.files.bannerImage) {
        req.body.bannerImage = `/uploads/${req.files.bannerImage[0].filename}`;
      }
    }

    // Обробимо жанри
    if (req.body.genres && typeof req.body.genres === 'string') {
      req.body.genres = req.body.genres.split(',').map(g => g.trim());
    }

    // Оновлення
    manga = await Manga.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: manga });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route   DELETE /api/manga/:id
 * @desc    Видалити тайтл
 * @access  Private (Admin, Author)
 */
router.delete('/:id', protect, isOwnerOrAdmin('Manga'), async (req, res) => {
  try {
    const mangaId = req.params.id;
    const manga = await Manga.findById(mangaId);
    
    if (!manga) {
      return res.status(404).json({ success: false, error: 'Твір не знайдено' });
    }

    // КАСКАДНЕ ВИДАЛЕННЯ ВСІХ ПОВ'ЯЗАНИХ ДАНИХ
    const Chapter = require('../models/Chapter');
    const Comment = require('../models/Comment');
    const Rating = require('../models/Rating');
    const History = require('../models/History');
    const Literature = require('../models/Literature');
    const LiteratureChapter = require('../models/LiteratureChapter');
    const UserList = require('../models/UserList');

    console.log(`--- Початок повного каскадного видалення для тайтлу: ${mangaId} ---`);
    
    // 1. Знаходимо всі пов'язані фанфіки (Literature)
    const relatedLit = await Literature.find({ manga: mangaId });
    const litIds = relatedLit.map(l => l._id);

    const results = await Promise.all([
      Chapter.deleteMany({ mangaId }),
      Comment.deleteMany({ resourceId: mangaId }),
      Rating.deleteMany({ manga: mangaId }),
      History.deleteMany({ manga: mangaId }),
      UserList.deleteMany({ manga: mangaId }),
      Literature.deleteMany({ manga: mangaId }),
      LiteratureChapter.deleteMany({ literature: { $in: litIds } })
    ]);

    console.log(`Видалено: Розділів(${results[0].deletedCount}), Коментарів(${results[1].deletedCount}), Оцінок(${results[2].deletedCount}), Історії(${results[3].deletedCount}), Списків(${results[4].deletedCount}), Фанфіків(${results[5].deletedCount}), Розділів фанфіків(${results[6].deletedCount})`);

    await manga.deleteOne();
    
    console.log(`--- Тайтл ${mangaId} та всі його дані успішно видалено ---`);

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Помилка при видаленні тайтлу:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### newsRoutes.js
```javascript
const express = require('express');
const router = express.Router();
const News = require('../models/News');

/**
 * @route   GET /api/news
 * @desc    Отримати список новин сайту
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### reviewRoutes.js
```javascript
const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

/**
 * @route   GET /api/reviews/user/:userId
 * @desc    Отримати всі відгуки конкретного користувача
 * @access  Public
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Comment.find({ 
      author: req.params.userId,
      interactionType: 'review'
    })
      .populate('resourceId', 'title type')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### userListRoutes.js
```javascript
const express = require('express');
const router = express.Router();
const UserList = require('../models/UserList');
const Manga = require('../models/Manga');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/user-list/status
 * @desc    Додати або оновити статус тайтлу в списку користувача
 * @access  Private
 */
router.post('/status', protect, async (req, res) => {
  try {
    const { mangaId, status } = req.body;

    if (!mangaId || !status) {
      return res.status(400).json({ success: false, error: 'Потрібні mangaId та status' });
    }

    const validStatuses = ['reading', 'planned', 'dropped', 'read', 'favorites'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Недійсний статус' });
    }

    // Перевіряємо чи існує манґа
    const manga = await Manga.findById(mangaId);
    if (!manga) {
      return res.status(404).json({ success: false, error: 'Тайтл не знайдено' });
    }

    let userListItem = await UserList.findOne({ user: req.user.id, manga: mangaId });

    if (userListItem) {
      // Оновлюємо існуючий запис
      userListItem.status = status;
      await userListItem.save();
    } else {
      // Створюємо новий запис
      userListItem = await UserList.create({
        user: req.user.id,
        manga: mangaId,
        status: status
      });
    }

    res.status(200).json({ success: true, data: userListItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/user-list
 * @desc    Отримати всі списки поточного користувача
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const lists = await UserList.find({ user: req.user.id }).populate('manga');
    res.status(200).json({ success: true, data: lists });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/user-list/:username
 * @desc    Отримати списки іншого користувача
 * @access  Public
 */
router.get('/user/:username', async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ success: false, error: 'Користувача не знайдено' });

    const lists = await UserList.find({ user: user._id }).populate('manga');
    res.status(200).json({ success: true, data: lists });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   DELETE /api/user-list/:mangaId
 * @desc    Видалити тайтл зі списку
 * @access  Private
 */
router.delete('/:mangaId', protect, async (req, res) => {
  try {
    const item = await UserList.findOneAndDelete({ user: req.user.id, manga: req.params.mangaId });
    if (!item) return res.status(404).json({ success: false, error: 'Запис не знайдено' });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/user-list/favorites
 * @desc    Отримати список "Обране" (favorites) поточного користувача
 * @access  Private
 */
router.get('/favorites', protect, async (req, res) => {
  try {
    const favorites = await UserList.find({ 
      user: req.user.id, 
      status: 'favorites' 
    }).populate('manga');

    res.status(200).json({ 
      success: true, 
      data: favorites.map(item => item.manga).filter(m => m !== null)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### userRoutes.js
```javascript
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Manga = require('../models/Manga');
const UserList = require('../models/UserList');
const Comment = require('../models/Comment');
const Rating = require('../models/Rating');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all users
// @route   GET /api/users
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Get authors list
// @route   GET /api/users/authors
router.get('/authors', async (req, res) => {
  try {
    const { limit } = req.query;
    let query = User.find({ role: 'author' }).select('username avatar createdAt aboutMe');
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const authors = await query;
    
    // Отримуємо кількість тайтлів для кожного автора
    const authorsWithStats = await Promise.all(authors.map(async (author) => {
      const titlesCount = await Manga.countDocuments({ author: author._id });
      return {
        ...author.toObject(),
        titlesCount
      };
    }));

    res.status(200).json({ success: true, data: authorsWithStats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Get user profile by username with dynamic stats
// @route   GET /api/users/profile/:username
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password -email');
    if (!user) {
      return res.status(404).json({ success: false, error: 'Користувача не знайдено' });
    }

    // Підрахунок динамічної статистики
    const [titlesCount, commentsCount, ratingsCount, readCount] = await Promise.all([
      UserList.countDocuments({ user: user._id }),
      Comment.countDocuments({ author: user._id }),
      Rating.countDocuments({ user: user._id }),
      UserList.countDocuments({ user: user._id, status: 'read' })
    ]);

    // Додаємо згенеровані статси до відповіді
    const userWithStats = {
      ...user.toObject(),
      stats: {
        titles: titlesCount,
        comments: commentsCount,
        ratings: ratingsCount,
        readCount: readCount
      }
    };

    res.status(200).json({ success: true, data: userWithStats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Get user reading analytics
// @route   GET /api/users/profile/:username/analytics
router.get('/profile/:username/analytics', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Користувача не знайдено' });
    }

    // Отримуємо всі записи користувача зі списку
    const userLists = await UserList.find({ user: user._id });

    // Підраховуємо загальну кількість прочитаних розділів
    const totalChaptersRead = userLists.reduce((sum, item) => sum + (item.chaptersRead || 0), 0);

    // Розраховуємо кількість годин (приблизно 15 хв на розділ)
    const totalHoursRead = (totalChaptersRead * 15) / 60;

    // Створюємо дані для графіка (оскільки немає погодинної історії, зробимо базовий розподіл останніх днів на основі totalChaptersRead)
    // У майбутньому тут можна зробити реальну агрегацію по датах оновлення
    const days = ['Пн', 'Вв', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
    const currentDayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // 0 = Понеділок

    const chartData = days.map((day, index) => {
      // Імітуємо активність для графіка: більша частина активності ближче до сьогоднішнього дня
      let baseValue = 0;
      if (totalChaptersRead > 0) {
        if (index === currentDayIndex) baseValue = Math.ceil(totalChaptersRead * 0.4);
        else if (index === currentDayIndex - 1 || index === currentDayIndex + 6) baseValue = Math.ceil(totalChaptersRead * 0.2);
        else baseValue = Math.ceil(totalChaptersRead * 0.05);
      }
      return {
        name: day,
        rozdivly: baseValue
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalChaptersRead,
        totalHoursRead: parseFloat(totalHoursRead.toFixed(1)),
        chartData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Update current user profile
// @route   PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { username, avatar, banner, aboutMe, gender } = req.body;
    
    // Перевірка на унікальність нікнейму, якщо він змінюється
    if (username && username !== req.user.username) {
      const userExists = await User.findOne({ username });
      if (userExists) {
        return res.status(400).json({ success: false, error: 'Цей нікнейм вже зайнятий' });
      }
    }

    const fieldsToUpdate = {};
    if (username) fieldsToUpdate.username = username;
    if (avatar !== undefined) fieldsToUpdate.avatar = avatar;
    if (banner !== undefined) fieldsToUpdate.banner = banner;
    if (aboutMe !== undefined) fieldsToUpdate.aboutMe = aboutMe;
    if (gender) fieldsToUpdate.gender = gender;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({ 
      success: true, 
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        banner: user.banner,
        aboutMe: user.aboutMe,
        gender: user.gender
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Create new user
// @route   POST /api/users
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { username, email, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

## 4. Middleware
### auth.js
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Manga = require('../models/Manga');
const Literature = require('../models/Literature');
const Announcement = require('../models/Announcement');
const LiteratureChapter = require('../models/LiteratureChapter');

/**
 * Мідлвара для захисту маршрутів (тільки для авторизованих користувачів)
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_for_dev_only');
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }
};

/**
 * Мідлвара для перевірки ролей (наприклад, 'admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user ? req.user.role : 'unknown'} is not authorized to access this route`
      });
    }
    next();
  };
};

/**
 * Мідлвара для перевірки прав власності або прав адміністратора
 * @param {string} resourceType - Тип ресурсу ('manga', 'literature', 'fanfic', 'literaturechapter')
 */
const isOwnerOrAdmin = (resourceType) => {
  return async (req, res, next) => {
    try {
      // 1. Якщо адмін — дозволяємо все
      if (req.user.role === 'admin') {
        return next();
      }

      // 2. Визначаємо модель
      const type = resourceType.toLowerCase();
      let Model;
      
      if (type === 'manga') {
        Model = Manga;
      } else if (type === 'literature' || type === 'fanfic') {
        Model = Literature;
      } else if (type === 'announcement' || type === 'news') {
        Model = Announcement;
      } else if (type === 'literaturechapter') {
        Model = LiteratureChapter;
      } else {
        return res.status(500).json({ success: false, error: 'Invalid resource type in middleware' });
      }

      // 3. Шукаємо ресурс
      let resource;
      if (type === 'literaturechapter') {
        // Для глав потрібно підтягнути автора батьківського твору
        resource = await Model.findById(req.params.id).populate('literature');
      } else {
        resource = await Model.findById(req.params.id);
      }

      if (!resource) {
        return res.status(404).json({ success: false, error: 'Not Found: Ресурс не знайдено' });
      }

      // 4. Перевіряємо власника
      let isOwner = false;
      if (type === 'literaturechapter') {
        // Власник глави — це автор твору
        isOwner = resource.literature && resource.literature.author.toString() === req.user.id.toString();
      } else {
        isOwner = resource.author && resource.author.toString() === req.user.id.toString();
      }

      if (!isOwner) {
        return res.status(403).json({ 
          success: false, 
          error: 'У вас немає прав для редагування або видалення цього контенту' 
        });
      }

      // 5. Все ок
      next();
    } catch (error) {
      console.error('Authorization Error:', error);
      return res.status(500).json({ success: false, error: 'Помилка сервера при перевірці прав' });
    }
  };
};

module.exports = { protect, authorize, isOwnerOrAdmin };
```

### authMiddleware.js
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Manga = require('../models/Manga');
const Literature = require('../models/Literature');

// Protect routes
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_for_dev_only');

    // Get user from the token and attach to request
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user ? req.user.role : 'unknown'} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user is the owner of the resource or an admin
const isOwnerOrAdmin = (modelName) => {
  return async (req, res, next) => {
    try {
      if (req.user.role === 'admin') {
        return next();
      }

      const lowerModelName = modelName.toLowerCase();
      let Model;
      if (lowerModelName === 'manga') Model = Manga;
      else if (lowerModelName === 'literature' || lowerModelName === 'fanfic') Model = Literature;
      else return res.status(500).json({ success: false, error: 'Invalid model type in middleware' });

      const resource = await Model.findById(req.params.id);

      if (!resource) {
        return res.status(404).json({ success: false, error: 'Контент не знайдено' });
      }

      // Check if user is the owner (author field in our models)
      if (resource.author && resource.author.toString() !== req.user.id.toString()) {
        return res.status(403).json({ success: false, error: 'У вас немає прав для редагування або видалення цього контенту' });
      }

      next();
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Помилка сервера при перевірці прав' });
    }
  };
};

module.exports = { protect, authorize, isOwnerOrAdmin };
```

## 5. Configuration
### upload.js
```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Шлях до папки завантажень
const uploadDir = path.join(__dirname, '../uploads');

// Автоматичне створення папки, якщо її не існує
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Налаштування сховища на диску
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Зберігаємо оригінальне ім'я, замінюючи пробіли на підкреслення
    const originalName = file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueSuffix + '-' + originalName);
  }
});

// Фільтр типів файлів
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && (mimetype || file.mimetype === 'application/pdf')) {
    return cb(null, true);
  } else {
    cb(new Error('Помилка: Дозволені лише зображення (jpeg, jpg, png, webp) та PDF!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 300 * 1024 * 1024 }, // Ліміт 300МБ для PDF
  fileFilter: fileFilter
});

module.exports = upload;
```
