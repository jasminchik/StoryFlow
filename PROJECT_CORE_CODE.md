# StoryFlow Project Core Code

## backend\config\upload.js
```js
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
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Помилка: Дозволені лише зображення (jpeg, jpg, png, webp)!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Ліміт 5МБ
  fileFilter: fileFilter
});

module.exports = upload;

```

## backend\download_blue_lock.js
```js
const fs = require('fs');
const path = require('path');
const https = require('https');

const UPLOADS_DIR_BACKEND = path.join(__dirname, 'uploads');
const UPLOADS_DIR_FRONTEND = path.join(__dirname, '..', 'frontend', 'public', 'uploads');

const downloadFile = (url, destPath) => {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Status: ${response.statusCode}`));
        return;
      }
      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    });
    request.on('error', reject);
  });
};

const run = async () => {
  const bDest = path.join(UPLOADS_DIR_BACKEND, 'blue_lock.jpg');
  const fDest = path.join(UPLOADS_DIR_FRONTEND, 'blue_lock.jpg');
  try {
    console.log('Downloading blue_lock.jpg alternative...');
    await downloadFile('https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=500', bDest);
    fs.copyFileSync(bDest, fDest);
    console.log('Successfully processed blue_lock.jpg');
  } catch (err) {
    console.error('Failed to download blue_lock.jpg:', err.message);
  }
};

run();

```

## backend\download_covers.js
```js
const fs = require('fs');
const path = require('path');
const https = require('https');

const UPLOADS_DIR_BACKEND = path.join(__dirname, 'uploads');
const UPLOADS_DIR_FRONTEND = path.join(__dirname, '..', 'frontend', 'public', 'uploads');

// Create directories if they don't exist
if (!fs.existsSync(UPLOADS_DIR_BACKEND)) {
  fs.mkdirSync(UPLOADS_DIR_BACKEND, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR_FRONTEND)) {
  fs.mkdirSync(UPLOADS_DIR_FRONTEND, { recursive: true });
}

const imagesToDownload = [
  { name: 'naruto.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/9/94/NarutoCoverTankobon1.jpg' },
  { name: 'bleach.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/7/72/BleachCoverTankobon1.jpg' },
  { name: 'one_piece.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/a/a3/One_Piece%2C_Volume_1.jpg' },
  { name: 'solo_leveling.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/b/b8/Solo_Leveling_Volume_1_Cover.jpg' },
  { name: 'chainsaw_man.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/c/cd/Chainsaw_Man_volume_1_cover.png' },
  { name: 'jujutsu_kaisen.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/4/46/Jujutsu_Kaisen_volume_1_cover.jpg' },
  { name: 'black_clover.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/5/52/Black_Clover%2C_Volume_1.jpg' },
  { name: 'blue_lock.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Blue_Lock_volume_1_cover.jpg' },
  { name: 'berserk.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/4/45/Berserk_vol_01.jpg' },
  { name: 'tokyo_ghoul.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/a/a3/Tokyo_Ghoul_volume_1_cover.jpg' },
  { name: 'vinland_saga.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/a/ad/Vinland_Saga_volume_1_cover.jpg' },
  { name: 'my_hero_academia.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/5/5a/Boku_no_Hero_Academia_Volume_1.png' },
  { name: 'demon_slayer.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/0/09/Demon_Slayer_-_Kimetsu_no_Yaiba%2C_volume_1.jpg' },
  { name: 'hells_paradise.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/b/b5/Hell%27s_Paradise_-_Jigokuraku%2C_volume_1_cover.jpg' },
  { name: 'spy_x_family.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/e/e4/Spy_x_Family_volume_1_cover.jpg' },
  { name: 'oshi_no_ko.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/f/f6/Oshi_no_Ko_volume_1_cover.jpg' },
  { name: 'attack_on_titan.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/d/d6/Shingeki_no_Kyojin_manga_volume_1.jpg' },
  { name: 'totoro.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/0/02/My_Neighbor_Totoro_-_concept_art.jpg' },
  { name: 'tower_of_god.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/d/df/Tower_of_God_Volume_1_Cover.jpg' },
  { name: 'mavka.png', url: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/POSTER_MAVKA._THE_FOREST_SONG.png' },
  { name: 'carpathians.jpg', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500' },
  { name: 'novel.jpg', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500' }
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const downloadFile = (url, destPath) => {
  return new Promise((resolve, reject) => {
    // Use images.weserv.nl as a caching proxy for Wikipedia images to avoid 429 / 403 errors
    let targetUrl = url;
    if (url.includes('wikimedia.org')) {
      targetUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
    }

    const urlParsed = new URL(targetUrl);
    const options = {
      hostname: urlParsed.hostname,
      path: urlParsed.pathname + urlParsed.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    };

    const request = https.get(options, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download from ${targetUrl}. Status code: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    });

    request.on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
};

const run = async () => {
  console.log(`Starting download of ${imagesToDownload.length} covers using Weserv proxy and saving to backend & frontend...`);
  
  for (const img of imagesToDownload) {
    const backendDest = path.join(UPLOADS_DIR_BACKEND, img.name);
    const frontendDest = path.join(UPLOADS_DIR_FRONTEND, img.name);
    
    // Check if we already have it in both places
    const hasBackend = fs.existsSync(backendDest) && fs.statSync(backendDest).size > 1000;
    const hasFrontend = fs.existsSync(frontendDest) && fs.statSync(frontendDest).size > 1000;
    
    if (hasBackend && hasFrontend) {
      console.log(`${img.name} already exists in both backend and frontend, skipping.`);
      continue;
    }
    
    try {
      if (!hasBackend) {
        console.log(`Downloading ${img.name} to backend...`);
        await downloadFile(img.url, backendDest);
        console.log(`Successfully downloaded ${img.name} to backend.`);
        await sleep(500); // polite delay
      }
      
      // Copy to frontend
      console.log(`Copying ${img.name} to frontend...`);
      fs.copyFileSync(backendDest, frontendDest);
      console.log(`Successfully copied ${img.name} to frontend.`);
      
    } catch (err) {
      console.error(`Error processing ${img.name}:`, err.message);
      await sleep(1000);
    }
  }
  console.log('Finished downloading and copying covers! 🎉');
};

run();

```

## backend\download_failed.js
```js
const fs = require('fs');
const path = require('path');
const https = require('https');

const UPLOADS_DIR_BACKEND = path.join(__dirname, 'uploads');
const UPLOADS_DIR_FRONTEND = path.join(__dirname, '..', 'frontend', 'public', 'uploads');

const failedImages = [
  { name: 'totoro.jpg', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500' },
  { name: 'tower_of_god.jpg', url: 'https://images.unsplash.com/photo-1516315720917-231ef9afe462?w=500' },
  { name: 'mavka.png', url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500' }
];

const downloadFile = (url, destPath) => {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Status: ${response.statusCode}`));
        return;
      }
      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    });
    request.on('error', reject);
  });
};

const run = async () => {
  console.log('Downloading alternative high-quality images for the 3 failed covers...');
  for (const img of failedImages) {
    const bDest = path.join(UPLOADS_DIR_BACKEND, img.name);
    const fDest = path.join(UPLOADS_DIR_FRONTEND, img.name);
    try {
      console.log(`Downloading ${img.name}...`);
      await downloadFile(img.url, bDest);
      fs.copyFileSync(bDest, fDest);
      console.log(`Successfully processed ${img.name}`);
    } catch (err) {
      console.error(`Failed ${img.name}:`, err.message);
    }
  }
  console.log('Finished processing failed covers! 🎉');
};

run();

```

## backend\download_missing.js
```js
const fs = require('fs');
const path = require('path');
const https = require('https');

const UPLOADS_DIR_BACKEND = path.join(__dirname, 'uploads');
const UPLOADS_DIR_FRONTEND = path.join(__dirname, '..', 'frontend', 'public', 'uploads');

// Create directories if they don't exist
if (!fs.existsSync(UPLOADS_DIR_BACKEND)) {
  fs.mkdirSync(UPLOADS_DIR_BACKEND, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR_FRONTEND)) {
  fs.mkdirSync(UPLOADS_DIR_FRONTEND, { recursive: true });
}

const missingImages = [
  { name: 'bleach.jpg', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500' },
  { name: 'solo_leveling.jpg', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500' },
  { name: 'chainsaw_man.jpg', url: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=500' },
  { name: 'jujutsu_kaisen.jpg', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500' },
  { name: 'black_clover.jpg', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500' },
  { name: 'blue_lock.jpg', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500' },
  { name: 'berserk.jpg', url: 'https://images.unsplash.com/photo-1559893088-c0787ebfc084?w=500' },
  { name: 'tokyo_ghoul.jpg', url: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500' },
  { name: 'vinland_saga.jpg', url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500' },
  { name: 'hells_paradise.jpg', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500' },
  { name: 'spy_x_family.jpg', url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500' },
  { name: 'oshi_no_ko.jpg', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500' },
  { name: 'tower_of_god.jpg', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500' }
];

const downloadFile = (url, destPath) => {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed with status: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    });

    request.on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
};

const run = async () => {
  console.log(`Starting download of ${missingImages.length} missing covers to backend and copying to frontend...`);
  
  for (const img of missingImages) {
    const bDest = path.join(UPLOADS_DIR_BACKEND, img.name);
    const fDest = path.join(UPLOADS_DIR_FRONTEND, img.name);
    
    try {
      console.log(`Downloading ${img.name}...`);
      await downloadFile(img.url, bDest);
      fs.copyFileSync(bDest, fDest);
      console.log(`Successfully processed ${img.name}`);
    } catch (err) {
      console.error(`Error processing ${img.name}:`, err.message);
    }
  }
  console.log('Finished downloading all missing covers! 🎉');
};

run();

```

## backend\index.js
```js
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

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('StoryFlow API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

```

## backend\middleware\auth.js
```js
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

## backend\middleware\authMiddleware.js
```js
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

## backend\models\Announcement.js
```js
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

## backend\models\Chapter.js
```js
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

## backend\models\Comment.js
```js
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

## backend\models\History.js
```js
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

## backend\models\Literature.js
```js
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

## backend\models\LiteratureChapter.js
```js
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

## backend\models\MainSection.js
```js
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

## backend\models\Manga.js
```js
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

## backend\models\News.js
```js
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

## backend\models\Rating.js
```js
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

## backend\models\User.js
```js
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
    minlength: 6,
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

## backend\models\UserList.js
```js
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

## backend\routes\adminRoutes.js
```js
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
    const manga = await Manga.findById(req.params.id);
    
    if (!manga) {
      return res.status(404).json({ success: false, error: 'Манґу не знайдено' });
    }

    // Каскадне видалення розділів
    await Chapter.deleteMany({ manga: req.params.id });

    // Видалення самої манґи
    await manga.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
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

    // Додаємо мітку типу для фанфіків, якщо її немає
    const formattedFanfics = fanfics.map(f => ({
      ...f.toObject(),
      type: f.type || 'Фанфік'
    }));

    res.status(200).json({ 
      success: true, 
      data: [...mangas, ...formattedFanfics].sort((a, b) => b.createdAt - a.createdAt)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

```

## backend\routes\announcementRoutes.js
```js
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

## backend\routes\authRoutes.js
```js
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

## backend\routes\chapterRoutes.js
```js
const express = require('express');
const router = express.Router();
const Chapter = require('../models/Chapter');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../config/upload');

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
router.post('/', protect, authorize('admin', 'author'), upload.array('pages', 200), async (req, res) => {
  try {
    const manga = await Manga.findById(req.body.mangaId);
    if (!manga) {
      return res.status(404).json({ success: false, error: 'Твір не знайдено' });
    }

    // Перевірка прав (автор або адмін)
    if (manga.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'У вас немає прав для додавання розділів до цього твору' 
      });
    }

    // Якщо завантажено файли, збираємо їхні шляхи
    if (req.files && req.files.length > 0) {
      req.body.pages = req.files.map(file => `/uploads/${file.filename}`);
    }

    const chapter = await Chapter.create(req.body);

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
router.put('/:id', protect, authorize('admin', 'author'), upload.array('pages', 200), async (req, res) => {
  try {
    let chapter = await Chapter.findById(req.params.id);

    if (!chapter) {
      return res.status(404).json({ success: false, error: 'Главу не знайдено' });
    }

    // Якщо завантажено нові файли
    if (req.files && req.files.length > 0) {
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

## backend\routes\commentRoutes.js
```js
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

## backend\routes\historyRoutes.js
```js
const express = require('express');
const router = express.Router();
const History = require('../models/History');
const Manga = require('../models/Manga'); // Додано
const Chapter = require('../models/Chapter'); // Додано
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
        select: 'title coverImage alternativeTitle'
      })
      .populate({
        path: 'chapter',
        select: 'number title'
      })
      .sort({ readAt: -1 }); // Найновіші зверху

    res.status(200).json({ success: true, data: history });
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
        select: 'title coverImage alternativeTitle'
      })
      .populate({
        path: 'chapter',
        select: 'number title'
      })
      .sort({ readAt: -1 });

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

```

## backend\routes\literatureChapterRoutes.js
```js
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

## backend\routes\literatureRoutes.js
```js
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

## backend\routes\mangaRoutes.js
```js
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

    const customNew = sections.find(s => s.key === 'new_releases');
    const customPopular = sections.find(s => s.key === 'popular');
    const customReadingNow = sections.find(s => s.key === 'reading_now');

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

    res.status(200).json({
      success: true,
      data: {
        newArrivals,
        topRated,
        readingNow
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
    // Більш лояльний фільтр: показуємо все, крім відхилених
    const query = { moderationStatus: { $ne: 'rejected' } };

    if (type === 'fanfic' || type === 'literature') {
      updates = await Literature.find(query)
        .populate('author', 'username')
        .sort({ updatedAt: -1 })
        .limit(5);
    } else {
      if (type === 'manga') {
        query.type = { $regex: /манґа|манга|manga/i };
      } else if (type === 'manhwa') {
        query.type = { $regex: /манхва|маньхуа|manhwa|manhua/i };
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
      if (type === 'manhwa') {
        query.type = { $regex: /манхва|маньхуа|manhwa|manhua/i };
      } else if (type === 'manga') {
        query.type = { $regex: /манґа|манга|manga/i };
      } else if (type === 'comics') {
        query.type = { $regex: /комікс|comics/i };
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
      // Об'єднуємо та сортуємо за часом оновлення
      results = [...mangas, ...literatures].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } else {
      // Специфічні типи манґи
      const typeMapping = {
        'manga': 'Манґа',
        'manhwa': 'Манхва',
        'manhua': 'Маньхуа',
        'comics': 'Комікс',
        'Манґа': 'Манґа',
        'Манхва': 'Манхва',
        'Маньхуа': 'Маньхуа',
        'Комікс': 'Комікс'
      };
      if (typeMapping[format]) {
        query.type = typeMapping[format];
      } else {
        query.type = { $regex: new RegExp(format, 'i') };
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
    const manga = await Manga.findById(req.params.id);
    await manga.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

```

## backend\routes\newsRoutes.js
```js
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

## backend\routes\reviewRoutes.js
```js
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

## backend\routes\userListRoutes.js
```js
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

## backend\routes\userRoutes.js
```js
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

## backend\seeder.js
```js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load models
const User = require('./models/User');
const Manga = require('./models/Manga');
const Chapter = require('./models/Chapter');
const Literature = require('./models/Literature');
const LiteratureChapter = require('./models/LiteratureChapter');

// Load env vars
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/storyflow';

const importData = async () => {
  try {
    console.log('Connecting to database:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    // Clean DB
    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await Manga.deleteMany({});
    await Chapter.deleteMany({});
    await Literature.deleteMany({});
    await LiteratureChapter.deleteMany({});
    console.log('Database cleared.');

    // 1. Seed Users
    console.log('Creating users...');
    
    // We use User.insertMany or create with plain passwords to let the middleware hash them
    // Note: Since we don't have original plain passwords for existing users (except admin_test/admin/author_official), 
    // we'll reset them to standard ones in the seeder for testing.
    
    const users = [
      {
        _id: '6a3034fc4e611934570cf6a9',
        username: 'admin_test',
        email: 'admin@gmail.com',
        password: '123456',
        role: 'admin',
        aboutMe: 'admin test',
        gender: 'secret'
      },
      {
        _id: '6a3034fc4e611934570cf6aa',
        username: 'admin',
        email: 'admin@storyflow.com',
        password: 'password123',
        role: 'admin'
      },
      {
        _id: '6a3034fc4e611934570cf6ab',
        username: 'author_official',
        email: 'author@storyflow.com',
        password: 'password123',
        role: 'author'
      },
      {
        _id: '6a3034fc4e611934570cf6ac',
        username: 'reader_test',
        email: 'reader@storyflow.com',
        password: 'password123',
        role: 'user'
      },
      {
        _id: '6a3035a5a843adf9e12f64b1',
        username: 'mag_ma953',
        email: 'magmablock937@gmail.com',
        password: 'password123',
        role: 'author'
      }
    ];

    await User.create(users);
    console.log('Users created.');

    // 2. Seed Mangas
    console.log('Creating mangas...');
    const mangas = [
      {
        _id: '6a3056f098468975c970b0e0',
        title: 'івфвіф',
        alternativeTitle: 'фівфівіф',
        description: 'віфвфівф',
        coverImage: '/uploads/1781552879985-214607534-cover.jpg',
        bannerImage: '/uploads/1781552879995-174719352-banner.jpg',
        type: 'Манґа',
        status: 'В процесі',
        releaseYear: 2026,
        genres: ['Пригоди'],
        author: '6a3034fc4e611934570cf6a9',
        moderationStatus: 'pending'
      },
      {
        _id: '6a305986e856fdfba5af1d10',
        title: 'тестік1',
        alternativeTitle: '213123',
        description: '211222',
        coverImage: '/uploads/1781553542540-132374249-cover.jpg',
        bannerImage: '/uploads/1781553542553-429705910-banner.jpg',
        type: 'Манхва',
        status: 'Анонс',
        releaseYear: 2026,
        genres: ['Пригоди', 'Романтика', 'Повсякденність', 'Наукова фантастика', 'Містика'],
        author: '6a3035a5a843adf9e12f64b1',
        moderationStatus: 'pending'
      }
    ];

    await Manga.create(mangas);
    console.log('Mangas created.');

    // 3. Seed Literature
    console.log('Creating literature...');
    const literatures = [
      {
        _id: '6a3034fc4e611934570cf6af',
        title: 'Альтернативний кінець',
        description: 'Як би завершилася історія, якби головний герой обрав інший шлях...',
        coverImage: '/uploads/no-literature-cover.jpg',
        author: '6a3034fc4e611934570cf6a9',
        genres: ['Драма', 'Ангст'],
        manga: '6a3034fc4e611934570cf6ae',
        isOfficial: false,
        status: 'completed',
        direction: 'Джен',
        ageRating: 'PG-13',
        moderationStatus: 'approved'
      },
      {
        _id: '6a304311c242716064def6a4',
        title: 'dfgsdfsf',
        description: 'fsdfsdfdsds',
        coverImage: '/uploads/no-literature-cover.jpg',
        author: '6a3034fc4e611934570cf6a9',
        genres: ['Драма', 'Пригоди', 'Повсякденність', 'Флафф'],
        manga: '6a3035eaa843adf9e12f64b2',
        isOfficial: false,
        status: 'in_progress',
        direction: 'Джен',
        ageRating: 'PG-13',
        authorNote: 'fsdfsdfds',
        moderationStatus: 'pending'
      },
      {
        _id: '6a30442da2fbd8e3be72ca71',
        title: 'ФІВІФВФІФІВ',
        description: 'ІУВФІВІФВФІ',
        coverImage: '/uploads/no-literature-cover.jpg',
        author: '6a3034fc4e611934570cf6a9',
        genres: ['Драма', 'Жахи'],
        manga: '6a3034fc4e611934570cf6ad',
        isOfficial: false,
        status: 'in_progress',
        direction: 'Джен',
        ageRating: 'PG-13',
        authorNote: 'ФІВФІВІФВІФ',
        moderationStatus: 'pending'
      },
      {
        _id: '6a305ee42b0539697f786612',
        title: 'віфвіф',
        description: 'фівфіві',
        coverImage: '/uploads/no-literature-cover.jpg',
        author: '6a3035a5a843adf9e12f64b1',
        genres: ['Психологія'],
        manga: null,
        isOfficial: false,
        status: 'in_progress',
        direction: 'Слеш',
        ageRating: 'PG-13',
        authorNote: 'фівфівіф',
        moderationStatus: 'pending'
      },
      {
        _id: '6a305f022b0539697f786613',
        title: 'фівіфвіф',
        description: 'віфвіфіф',
        coverImage: '/uploads/no-literature-cover.jpg',
        author: '6a3035a5a843adf9e12f64b1',
        genres: ['Флафф'],
        manga: '6a305986e856fdfba5af1d10',
        isOfficial: true,
        status: 'in_progress',
        direction: 'Джен',
        ageRating: 'G',
        authorNote: 'фівіф',
        moderationStatus: 'pending'
      }
    ];

    await Literature.create(literatures);
    console.log('Literature created.');

    console.log('Database successfully initialized with current snapshot data! 🌱');
    process.exit(0);
  } catch (error) {
    console.error('Error during data import:', error);
    process.exit(1);
  }
};

importData();

```

## frontend\src\App.jsx
```javascript
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Profile from './pages/Profile';
import Updates from './pages/Updates/Updates';
import MangaDetails from './pages/MangaDetails/MangaDetails';
import Favorites from './pages/Favorites/Favorites';
import Authors from './pages/Authors/Authors';
import ReadingNow from './pages/ReadingNow/ReadingNow';
import Notifications from './pages/Notifications/Notifications';
import CreateManga from './pages/CreateManga/CreateManga';
import EditManga from './pages/CreateManga/EditManga';
import CreateFanfic from './pages/Fanfic/CreateFanfic';
import FanficDetails from './pages/Fanfic/FanficDetails';
import ReadFanfic from './pages/Fanfic/ReadFanfic';
import ReadManga from './pages/Manga/ReadManga';
import AuthSuccess from './pages/AuthSuccess';
import AdminPanel from './pages/Admin/AdminPanel';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import styles from './App.module.scss';

function App() {
  return (
    <div className={styles.appWrapper}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/updates" element={<Updates />} />
        <Route path="/manga/:id" element={<MangaDetails />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/authors" element={<Authors />} />
        <Route path="/reading-now" element={<ReadingNow />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/create-manga" element={<CreateManga />} />
        <Route path="/edit-manga/:id" element={<EditManga />} />
        <Route path="/create-fanfic" element={<CreateFanfic />} />
        <Route path="/fanfic/:id" element={<FanficDetails />} />
        <Route path="/fanfic/:id/read/:chapterId" element={<ReadFanfic />} />
        <Route path="/manga/:titleId/read/:chapterId" element={<ReadManga />} />
        <Route path="/auth-success" element={<AuthSuccess />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
      <Footer />
      <BottomNav />
    </div>
  );
}

export default App;

```

## frontend\src\App.module.scss
```scss
@import './styles/variables';

.appWrapper {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-main);

  @media (max-width: 768px) {
    padding-bottom: 64px; /* Висота BottomNav */
  }
}

```

## frontend\src\components\AuthModal.jsx
```javascript
import React, { useState, useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaTwitch } from 'react-icons/fa';
import styles from './AuthModal.module.scss';

const AuthModal = ({ isOpen, onClose }) => {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState(null); // null | 'user' | 'author'
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Parse URL params for errors from OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('auth_mode');
    const authError = params.get('auth_error');
    const registeredEmail = params.get('registered_email');

    if (mode) setAuthMode(mode);
    
    if (authError === 'no_account') {
      setError('Ваш акаунт ще не зареєстровано. Будь ласка, зареєструйтесь.');
    } else if (authError === 'email_registered') {
      setError('Ця пошта вже зареєстрована. Будь ласка, увійдіть.');
    } else if (authError === 'oauth_failed') {
      setError('Помилка авторизації через сторонній сервіс.');
    }

    if (registeredEmail) setEmail(registeredEmail);
  }, [isOpen]);

  if (!isOpen) return null;

  const API_BASE_URL = 'http://localhost:5000/api/auth';

  const handleGoogleSignIn = () => {
    if (authMode === 'register' && !userRole) {
      setError('Будь ласка, спочатку оберіть, хто ви (Читач чи Автор)');
      return;
    }
    window.location.href = `${API_BASE_URL}/google?intent=${authMode}${userRole ? `&role=${userRole}` : ''}`;
  };

  const handleTwitchSignIn = () => {
    if (authMode === 'register' && !userRole) {
      setError('Будь ласка, спочатку оберіть, хто ви (Читач чи Автор)');
      return;
    }
    window.location.href = `${API_BASE_URL}/twitch?intent=${authMode}${userRole ? `&role=${userRole}` : ''}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (authMode === 'register' && !userRole) {
      setError('Будь ласка, оберіть роль (Читач чи Автор)');
      return;
    }

    setIsLoading(true);

    const endpoint = authMode === 'login' ? '/login' : '/register';
    const payload = authMode === 'login' 
      ? { email, password } 
      : { email, password, username, role: userRole };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Щось пішло не так');
      }

      // Зберігаємо токен та дані юзера
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      console.log(`${authMode === 'login' ? 'Вхід' : 'Реєстрація'} успішна!`, data);
      
      // Закриваємо модалку та переходимо на головну (очищуємо URL)
      onClose();
      window.location.href = '/';

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${authMode === 'login' ? styles.activeTab : ''}`}
            onClick={() => {
              setAuthMode('login');
              setError('');
            }}
          >
            Вхід
          </button>
          <button 
            className={`${styles.tab} ${authMode === 'register' ? styles.activeTab : ''}`}
            onClick={() => {
              setAuthMode('register');
              setError('');
            }}
          >
            Реєстрація
          </button>
        </div>

        <div className={styles.content}>
          <form className={styles.form} onSubmit={handleSubmit}>
            {error && <div className={styles.errorMessage}>{error}</div>}
            
            {authMode === 'register' && (
              <>
                <div className={styles.roleLabel}>Хто ви?</div>
                <div className={styles.roleSelector}>
                  <button 
                    type="button"
                    className={`${styles.roleOption} ${userRole === 'user' ? styles.activeRole : ''}`}
                    onClick={() => setUserRole('user')}
                  >
                    Читач
                  </button>
                  <button 
                    type="button"
                    className={`${styles.roleOption} ${userRole === 'author' ? styles.activeRole : ''}`}
                    onClick={() => setUserRole('author')}
                  >
                    Автор
                  </button>
                </div>

                <div className={styles.formGroup}>
                  <input 
                    type="text" 
                    placeholder="Нікнейм" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <div className={styles.formGroup}>
              <input 
                type="email" 
                placeholder="Електронна пошта" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <input 
                type="password" 
                placeholder="Пароль" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? 'Завантаження...' : (authMode === 'login' ? 'Увійти' : 'Зареєструватися')}
            </button>
          </form>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <div className={styles.oauthSection}>
            <button className={styles.oauthBtn} onClick={handleGoogleSignIn}>
              <FcGoogle className={styles.icon} /> 
              <span>Continue with Google</span>
            </button>
            <button className={styles.oauthBtn} onClick={handleTwitchSignIn}>
              <FaTwitch className={styles.icon} style={{ color: '#9146FF' }} /> 
              <span>Continue with Twitch</span>
            </button>
          </div>

          <div className={styles.footer}>
            {authMode === 'login' ? (
              <p>
                Немає акаунту? {' '}
                <span className={styles.link} onClick={() => setAuthMode('register')}>
                  Зареєструйтеся
                </span>
              </p>
            ) : (
              <p>
                Вже є акаунт? {' '}
                <span className={styles.link} onClick={() => setAuthMode('login')}>
                  Увійдіть
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

```

## frontend\src\components\AuthModal.module.scss
```scss
@import '../styles/variables';

.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--bg-overlay);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: var(--bg-modal);
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-main);
  animation: modalAppear 0.3s ease-out;
}

@keyframes modalAppear {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.closeBtn {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 24px;
  cursor: pointer;
  z-index: 10;
  transition: color 0.2s;

  &:hover {
    color: var(--text-main);
  }
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
}

.tab {
  flex: 1;
  padding: 16px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;

  &:hover {
    color: var(--text-main);
  }
}

.activeTab {
  color: var(--primary-color);
  border-bottom: 2px solid var(--primary-color);
}

.content {
  padding: 32px;
}

.oauthSection {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.oauthBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-card); 
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-main);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--secondary-color);
    border-color: var(--primary-color);
    transform: translateY(-1px);
  }

  .icon {
    font-size: 22px;
  }
}

.divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 400;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--border-color);
  }

  span {
    padding: 0 15px;
    text-transform: lowercase;
  }
}

.footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: var(--text-muted);

  .link {
    color: var(--primary-color);
    font-weight: 600;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      opacity: 0.8;
      text-decoration: underline;
    }
  }
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.errorMessage {
  background: var(--accent-light);
  color: #ff4757;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 71, 87, 0.2);
  font-size: 14px;
  text-align: center;
}

.roleLabel {
  color: var(--text-muted);
  font-size: 14px;
  margin-bottom: -8px;
}

.roleSelector {
  display: flex;
  gap: 8px;
}

.roleOption {
  flex: 1;
  padding: 10px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;

  &:hover {
    border-color: var(--primary-color);
    color: var(--text-main);
  }
}

.activeRole {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: var(--primary-light);
}

.formGroup {
  input {
    width: 100%;
    padding: 12px 16px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-main);
    outline: none;
    transition: all 0.2s;

    &::placeholder {
      color: var(--text-muted);
    }

    &:focus {
      border-color: var(--primary-color);
      background: var(--bg-main);
    }
  }
}

.submitBtn {
  width: 100%;
  padding: 14px;
  background: var(--primary-color);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
}


```

## frontend\src\components\BottomNav.jsx
```javascript
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiGrid, FiHeart, FiBell, FiMenu } from 'react-icons/fi';
import Logo from './Logo/Logo';
import styles from './BottomNav.module.scss';

const BottomNav = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleToggleMenu = (e) => {
    e.preventDefault();
    // Викликаємо кастомну подію для відкриття меню в Header.jsx
    window.dispatchEvent(new CustomEvent('openProfileMenu'));
  };

  return (
    <nav className={styles.bottomNav}>
      <Link to="/favorites" className={`${styles.navItem} ${isActive('/favorites') ? styles.active : ''}`}>
        <FiHeart className={styles.icon} />
        <span className={styles.label}>Закладки</span>
      </Link>

      <Link to="/catalog" className={`${styles.navItem} ${isActive('/catalog') ? styles.active : ''}`}>
        <FiGrid className={styles.icon} />
        <span className={styles.label}>Каталог</span>
      </Link>

      <Link to="/" className={`${styles.navItem} ${styles.homeItem} ${isActive('/') ? styles.active : ''}`}>
        <div className={styles.homeIconWrapper}>
          <Logo className={styles.bottomLogo} />
        </div>
      </Link>

      <Link to="/notifications?tab=news" className={`${styles.navItem} ${isActive('/notifications') ? styles.active : ''}`}>
        <FiBell className={styles.icon} />
        <span className={styles.label}>Новини</span>
      </Link>

      <button onClick={handleToggleMenu} className={styles.navItem}>
        <FiMenu className={styles.icon} />
        <span className={styles.label}>Меню</span>
      </button>
    </nav>
  );
};

export default BottomNav;

```

## frontend\src\components\BottomNav.module.scss
```scss
@import '../styles/variables';

.bottomNav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 64px;
  background-color: var(--bg-card);
  border-top: 1px solid var(--border-color);
  display: none; /* Сховано на десктопі */
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  padding: 0 10px;
  box-sizing: border-box;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  background-color: rgba(30, 30, 30, 0.95);

  @media (max-width: 768px) {
    display: flex;
  }
}

.navItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  background: none;
  border: none;
  color: var(--text-muted);
  gap: 4px;
  flex: 1;
  height: 100%;
  transition: all 0.2s ease;
  font-family: inherit;
  cursor: pointer;

  .icon {
    font-size: 1.4rem;
  }

  .label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  &.active {
    color: var(--primary-color);
  }

  &:active {
    transform: scale(0.95);
  }
}

.homeItem {
  display: flex;
  align-items: center;
  justify-content: center;
  
  .homeIconWrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    transform: translateY(-4px); /* Зменшуємо виступ */

    .bottomLogo {
      width: 40px; /* Трішки збільшуємо, бо немає фону */
      height: 40px;
      color: var(--primary-color); /* Повертаємо основний колір */
    }
  }

  &.active .homeIconWrapper .bottomLogo {
    color: #ff3344;
    filter: drop-shadow(0 0 5px rgba(255, 51, 68, 0.4));
  }
}

```

## frontend\src\components\CommentSection.jsx
```javascript
import React, { useState, useEffect } from 'react';
import { FiSend, FiMessageSquare, FiTrash2, FiUser } from 'react-icons/fi';
import styles from './CommentSection.module.scss';

const CommentSection = ({ resourceId, resourceType }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE = 'http://localhost:5000';
  const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    fetchComments();
  }, [resourceId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/comments/${resourceId}`);
      const data = await response.json();
      if (data.success) {
        setComments(data.data);
      }
    } catch (err) {
      console.error('Помилка завантаження коментарів:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !loggedInUser) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: newComment,
          resourceId,
          resourceType
        })
      });

      const data = await response.json();
      if (data.success) {
        setComments([data.data, ...comments]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Помилка відправки коментаря:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей коментар?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setComments(comments.filter(c => c._id !== commentId));
      }
    } catch (err) {
      console.error('Помилка видалення:', err);
    }
  };

  return (
    <div className={styles.commentSection}>
      <div className={styles.header}>
        <FiMessageSquare size={20} />
        <h3>Коментарі ({comments.length})</h3>
      </div>

      {loggedInUser ? (
        <form onSubmit={handleSubmit} className={styles.commentForm}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Напишіть вашу думку про цей твір..."
            rows="3"
            required
          />
          <button type="submit" disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? '...' : <><FiSend /> <span>Відправити</span></>}
          </button>
        </form>
      ) : (
        <div className={styles.loginPrompt}>
          Будь ласка, увійдіть, щоб залишати коментарі.
        </div>
      )}

      <div className={styles.commentsList}>
        {isLoading ? (
          <div className={styles.loading}>Завантаження коментарів...</div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className={styles.commentItem}>
              <div className={styles.avatarWrapper}>
                {comment.author?.avatar ? (
                  <img src={comment.author.avatar} alt={comment.author.username} />
                ) : (
                  <div className={styles.placeholder}><FiUser /></div>
                )}
              </div>
              <div className={styles.contentWrapper}>
                <div className={styles.commentHeader}>
                  <span className={styles.username}>{comment.author?.username || 'Невідомий'}</span>
                  <span className={styles.date}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                  
                  {/* Перевірка прав на видалення: автор або адмін */}
                  {loggedInUser && (
                    (comment.author?._id === (loggedInUser.id || loggedInUser._id)) || 
                    loggedInUser.role === 'admin'
                  ) && (
                    <button 
                      className={styles.deleteBtn} 
                      onClick={() => handleDelete(comment._id)}
                      title="Видалити коментар"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
                <p className={styles.text}>{comment.content}</p>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.empty}>Коментарів поки що немає. Будьте першим!</div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;

```

## frontend\src\components\CommentSection.module.scss
```scss
@import '../styles/variables';

.commentSection {
  margin-top: 40px;
  background: var(--bg-card);
  padding: 32px;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  color: var(--text-main);

  h3 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 800;
  }
}

.commentForm {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 40px;

  textarea {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    color: var(--text-main);
    padding: 16px;
    border-radius: 12px;
    font-size: 1rem;
    outline: none;
    resize: none;
    transition: all 0.2s;

    &:focus {
      border-color: var(--primary-color);
    }
  }

  button {
    align-self: flex-end;
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;

    &:hover { opacity: 0.9; transform: translateY(-1px); }
    &:disabled { background: #555; cursor: not-allowed; transform: none; }
  }
}

.loginPrompt {
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
  color: var(--text-muted);
  text-align: center;
  margin-bottom: 30px;
}

.commentsList {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.commentItem {
  display: flex;
  gap: 16px;
}

.avatarWrapper {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--bg-secondary);

  img { width: 100%; height: 100%; object-fit: cover; }
  .placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #555; font-size: 1.2rem; }
}

.contentWrapper {
  flex-grow: 1;
  background: var(--bg-secondary);
  padding: 16px;
  border-radius: 16px;
}

.commentHeader {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  position: relative;
}

.username {
  font-weight: 800;
  color: var(--text-main);
}

.date {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.deleteBtn {
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  &:hover { color: #ff4444; background: rgba(255, 68, 68, 0.1); }
}

.text {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.5;
  white-space: pre-wrap;
}

.loading, .empty {
  text-align: center;
  padding: 20px;
  color: var(--text-muted);
}

```

## frontend\src\components\ConfirmationModal.jsx
```javascript
import React from 'react';
import styles from './ConfirmationModal.module.scss';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{title || 'Підтвердження'}</h3>
        </div>
        <div className={styles.content}>
          <p>{message}</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            Скасувати
          </button>
          <button className={styles.confirmBtn} onClick={onConfirm}>
            Видалити
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

```

## frontend\src\components\ConfirmationModal.module.scss
```scss
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease-out;
}

.modal {
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.header {
  margin-bottom: 16px;
  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: #ffffff;
    font-weight: 700;
  }
}

.content {
  margin-bottom: 32px;
  p {
    margin: 0;
    color: #a0a0a0;
    line-height: 1.6;
    font-size: 1rem;
  }
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;

  button {
    padding: 12px 24px;
    border-radius: 10px;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .cancelBtn {
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.1);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  .confirmBtn {
    background: #ff4757;
    color: white;
    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);

    &:hover {
      background: #ff6b81;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(255, 71, 87, 0.4);
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

```

## frontend\src\components\CreateAnnouncementModal.jsx
```javascript
import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiImage, FiAlertCircle } from 'react-icons/fi';
import styles from './CreateAnnouncementModal.module.scss';

const CreateAnnouncementModal = ({ isOpen, onClose, onSaveSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [myTitles, setMyTitles] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    manga: '',
    category: 'manga_update'
  });

  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    if (isOpen) {
      fetchMyTitles();
    }
  }, [isOpen]);

  const fetchMyTitles = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/manga/my-titles`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setMyTitles(data.data);
        if (data.data.length > 0 && !formData.manga) {
          setFormData(prev => ({ ...prev, manga: data.data[0]._id }));
        }
      }
    } catch (err) {
      console.error('Помилка завантаження тайтлів:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Помилка при створенні новини');
      }

      setFormData({
        title: '',
        content: '',
        manga: myTitles.length > 0 ? myTitles[0]._id : '',
        category: 'manga_update'
      });
      
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedManga = myTitles.find(m => m._id === formData.manga);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Додати новину тайтлу</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Закрити">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.errorMessage}>
              <FiAlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className={styles.layout}>
            <div className={styles.leftCol}>
              <div className={styles.mangaSelect}>
                <label>Оберіть тайтл *</label>
                <select 
                  name="manga" 
                  value={formData.manga} 
                  onChange={handleInputChange}
                  required
                >
                  {myTitles.length === 0 && <option value="">У вас немає тайтлів</option>}
                  {myTitles.map(manga => (
                    <option key={manga._id} value={manga._id}>{manga.title}</option>
                  ))}
                </select>
              </div>

              <div className={styles.previewCard}>
                {selectedManga ? (
                  <>
                    <img 
                      src={`${API_BASE}${selectedManga.coverImage}`} 
                      alt={selectedManga.title} 
                      className={styles.previewImage}
                    />
                    <div className={styles.previewInfo}>
                      <span className={styles.previewType}>{selectedManga.type}</span>
                      <h4 className={styles.previewTitle}>{selectedManga.title}</h4>
                    </div>
                  </>
                ) : (
                  <div className={styles.placeholder}>
                    <FiImage size={40} />
                    <span>Тайтл не обрано</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.rightCol}>
              <div className={styles.formGroup}>
                <label>Заголовок новини *</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange} 
                  placeholder="Наприклад: Вийшов новий розділ!"
                  required 
                  maxLength={100}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Зміст новини *</label>
                <textarea 
                  name="content" 
                  value={formData.content} 
                  onChange={handleInputChange} 
                  placeholder="Розкажіть детальніше про оновлення..."
                  rows="8"
                  required 
                ></textarea>
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <button 
              type="button" 
              className={styles.cancelBtn} 
              onClick={onClose}
              disabled={isLoading}
            >
              Скасувати
            </button>
            <button 
              type="submit" 
              className={styles.submitBtn} 
              disabled={isLoading || myTitles.length === 0}
            >
              {isLoading ? 'Публікація...' : (
                <>
                  <FiCheck />
                  <span>Опублікувати</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAnnouncementModal;

```

## frontend\src\components\CreateAnnouncementModal.module.scss
```scss
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background: #1a1a1a;
  width: 100%;
  max-width: 800px;
  border-radius: 16px;
  border: 1px solid #333;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.header {
  padding: 20px 24px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #fff;
    font-weight: 700;
  }
}

.closeBtn {
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #333;
    color: #fff;
  }
}

.form {
  padding: 24px;
}

.errorMessage {
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid #ff4444;
  color: #ff4444;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
}

.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 32px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.leftCol {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.mangaSelect {
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 0.85rem;
    color: #888;
    font-weight: 500;
  }

  select {
    background: #2a2a2a;
    border: 1px solid #444;
    color: #fff;
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 0.95rem;
    width: 100%;
    outline: none;

    &:focus {
      border-color: #ff8c00;
      box-shadow: 0 0 0 2px rgba(255, 140, 0, 0.2);
    }
  }
}

.previewCard {
  background: #252525;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #333;
  aspect-ratio: 2/3;
  position: relative;
  display: flex;
  flex-direction: column;
}

.previewImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.previewInfo {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: linear-gradient(transparent, rgba(0,0,0,0.9));
}

.previewType {
  font-size: 0.7rem;
  color: #ff8c00;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.previewTitle {
  margin: 4px 0 0;
  font-size: 0.9rem;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #555;
  font-size: 0.9rem;
}

.rightCol {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.formGroup {
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 0.85rem;
    color: #888;
    font-weight: 500;
  }

  input, textarea {
    background: #2a2a2a;
    border: 1px solid #444;
    color: #fff;
    padding: 12px;
    border-radius: 8px;
    font-size: 1rem;
    width: 100%;
    outline: none;
    transition: all 0.2s;

    &:focus {
      border-color: #ff8c00;
      box-shadow: 0 0 0 2px rgba(255, 140, 0, 0.2);
    }
  }

  textarea {
    resize: none;
  }
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #333;
  padding-top: 24px;
}

.cancelBtn {
  background: transparent;
  border: 1px solid #444;
  color: #fff;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #333;
    border-color: #555;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.submitBtn {
  background: #ff8c00;
  border: none;
  color: #000;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #ffa500;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 140, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #555;
    color: #888;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
}

```

## frontend\src\components\Footer.jsx
```javascript
import React from 'react';
import styles from './Footer.module.scss';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        <span className={styles.logo}>StoryFlow</span>
        <span className={styles.copyright}>© 2026 StoryFlow. Всі права захищені.</span>
      </div>
      <div className={styles.right}>
        <span className={styles.contact}>
          Для зв'язку: <a href="mailto:jecamenlpl@gmail.com">jecamenlpl@gmail.com</a>
        </span>
      </div>
    </footer>
  );
};

export default Footer;

```

## frontend\src\components\Footer.module.scss
```scss
.footer {
  background-color: #0f0f0f;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #888;
  font-size: 14px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    text-align: center;
    padding: 20px;
  }
}

.left {
  display: flex;
  align-items: center;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 5px;
  }
}

.logo {
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
}

.contact {
  a {
    color: inherit;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: #ff4d00; // Наш акцентний червоний/помаранчевий
    }
  }
}

```

## frontend\src\components\Header.jsx
```javascript
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiHeart, FiChevronDown, FiShuffle, FiUser } from 'react-icons/fi';
import SearchOverlay from './SearchOverlay';
import AuthModal from './AuthModal';
import ProfileDropdown from './ProfileDropdown';
import Logo from './Logo/Logo';
import styles from './Header.module.scss';

const AVAILABLE_IDS = [1, 2, 3, 4, 5, 6];

const Header = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const catalogRef = useRef(null);
  const navigate = useNavigate();

  // Авто-вхід при завантаженні (відновлення сесії)
  useEffect(() => {
    const refreshUser = () => {
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (token && user) {
          setIsAuth(true);
          setCurrentUser(JSON.parse(user));
        } else {
          setIsAuth(false);
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Failed to parse user from localStorage:', err);
        setIsAuth(false);
        setCurrentUser(null);
      }
    };

    const handleOpenMenu = () => setIsProfileMenuOpen(true);

    refreshUser();

    // Слухаємо оновлення профілю
    window.addEventListener('profileUpdate', refreshUser);
    // Слухаємо команду відкриття меню (з BottomNav)
    window.addEventListener('openProfileMenu', handleOpenMenu);

    // Відкриваємо модалку, якщо є параметри помилки або режиму авторизації
    // АЛЕ тільки якщо користувач ще не авторизований
    const params = new URLSearchParams(window.location.search);
    const hasAuthParams = params.get('auth_mode') || params.get('auth_error');
    if (hasAuthParams && !localStorage.getItem('token')) {
      setIsModalOpen(true);
    }

    return () => {
      window.removeEventListener('profileUpdate', refreshUser);
      window.removeEventListener('openProfileMenu', handleOpenMenu);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (catalogRef.current && !catalogRef.current.contains(event.target)) {
        setIsCatalogOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLoginClick = () => {
    setAuthMessage('');
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleLoginSuccess = (userData) => {
    setIsAuth(true);
    setCurrentUser(userData);
    setIsModalOpen(false);
  };

  const handleLogout = () => {
    // Очищення сесії
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setIsAuth(false);
    setCurrentUser(null);
    setIsProfileMenuOpen(false);
  };

  const handleRandomClick = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/manga/random');
      const data = await response.json();
      if (data.success && data.id) {
        setIsCatalogOpen(false);
        navigate(`/manga/${data.id}`);
      }
    } catch (err) {
      console.error('Помилка при отриманні випадкового тайтлу:', err);
    }
  };

  return (
    <>
      <header className={styles.headerWrapper}>
        <div className={styles.headerInner}>
          
          {/* ЛІВА ЗОНА: Тільки логотип (Сховано на мобільних) */}
          <div className={`${styles.leftArea} ${styles.desktopOnly}`}>
            <Link to="/" className={styles.logoLink}>
              <Logo className={styles.logoSvg} />
              StoryFlow
            </Link>
          </div>

          {/* ЦЕНТРАЛЬНА ЗОНА: Каталог -> Пошук -> Новини */}
          <div className={styles.centerArea}>
            <div className={`${styles.catalogContainer} ${styles.desktopOnly}`} ref={catalogRef}>
              <button 
                className={styles.navLinkBtn} 
                onClick={() => setIsCatalogOpen(!isCatalogOpen)}
              >
                Каталог <FiChevronDown size={18} className={`${styles.dropdownArrow} ${isCatalogOpen ? styles.rotated : ''}`} />
              </button>
              {isCatalogOpen && (
                <div className={styles.catalogDropdown}>
                  <Link to="/catalog?type=manga" className={styles.catalogItem} onClick={() => setIsCatalogOpen(false)}>Манґа</Link>
                  <Link to="/catalog?type=manhwa" className={styles.catalogItem} onClick={() => setIsCatalogOpen(false)}>Манхва</Link>
                  <Link to="/catalog?type=fanfic" className={styles.catalogItem} onClick={() => setIsCatalogOpen(false)}>Література/Фанфік</Link>
                  <Link to="/authors" className={styles.catalogItem} onClick={() => setIsCatalogOpen(false)}>Автори</Link>
                  <Link to="/catalog?status=reading" className={styles.catalogItem} onClick={() => setIsCatalogOpen(false)}>Читають зараз</Link>
                  
                  <div className={styles.dropdownDivider}></div>
                  <button className={styles.randomBtn} onClick={handleRandomClick}>
                    <FiShuffle size={16} /> Випадковий тайтл
                  </button>
                </div>
              )}
            </div>

            <button className={styles.searchTrigger} onClick={() => setIsSearchOpen(true)}>
              <FiSearch size={20} className={styles.searchIcon} />
              <span className={styles.searchText}>Пошук</span>
            </button>

            <Link to="/notifications?tab=news" className={`${styles.navLink} ${styles.desktopOnly}`}>Новини</Link>
          </div>

          {/* ПРАВА ЗОНА: Обране, Профіль та Бургер (Сховано на мобільних) */}
          <div className={`${styles.rightArea} ${styles.desktopOnly}`}>
            <Link to="/favorites" className={`${styles.bookmarkLink} ${styles.desktopOnly}`} title="Обране">
              <FiHeart size={20} className={styles.icon} />
              <span className={styles.btnText}>Обране</span>
            </Link>
            
            {!isAuth ? (
              <button className={styles.authBtn} onClick={handleLoginClick}>Увійти</button>
            ) : (
              <div className={styles.userProfileContainer}>
                <Link 
                  to={`/profile/${currentUser?.username || ''}`}
                  className={styles.headerAvatar} 
                  title="Мій профіль"
                >
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt="Avatar" />
                  ) : (
                    <FiUser size={24} />
                  )}
                </Link>
                <button 
                  className={styles.hamburgerBtn} 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  title="Меню"
                >
                  <span className={styles.bar}></span>
                  <span className={styles.bar}></span>
                  <span className={styles.bar}></span>
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />

      <AuthModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        defaultMessage={authMessage}
        onSuccess={handleLoginSuccess}
      />

      <ProfileDropdown 
        isOpen={isProfileMenuOpen} 
        onClose={() => setIsProfileMenuOpen(false)} 
        user={currentUser}
        onLogout={handleLogout}
      />
    </>
  );
};

export default Header;

```

## frontend\src\components\Header.module.scss
```scss
@import '../styles/variables';

.headerWrapper {
  width: 100%;
  background-color: var(--bg-navbar);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: background-color var(--transition-speed), border-color var(--transition-speed);
}

.headerInner {
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  height: 70px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    display: flex;
    justify-content: center;
    height: 60px;
    padding: 0 16px;
  }
}

.leftArea {
  justify-self: start;
  display: flex;
  align-items: center;
}

.centerArea {
  justify-self: center;
  display: flex;
  align-items: center;
  gap: 20px;

  @media (max-width: 768px) {
    width: 100%;
  }
}

.rightArea {
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: flex-end;
}

.desktopOnly {
  @media (max-width: 768px) {
    display: none !important;
  }
}

/* ============================
   ОКРЕМІ ЕЛЕМЕНТИ
   ============================ */

.logoLink {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--primary-color);
  letter-spacing: -0.5px;
  text-decoration: none;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.85;

    .logoSvg {
      transform: scale(1.05);
    }
  }
}

.logoSvg {
  height: 32px;
  width: auto;
  color: var(--primary-color);
  transition: transform 0.2s;
}

.navLink {
  color: var(--text-main);
  font-weight: 500;
  font-size: 0.95rem;
  transition: color 0.2s;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    color: var(--primary-color);
  }
}

.catalogContainer {
  position: relative;
  display: flex;
  align-items: center;
}

.navLinkBtn {
  background: none;
  border: none;
  color: var(--text-main);
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  transition: color 0.2s;
  font-family: inherit;

  &:hover {
    color: var(--primary-color);
  }
}

.dropdownArrow {
  transition: transform 0.3s ease;
  opacity: 0.6;

  &.rotated {
    transform: rotate(180deg);
  }
}

.catalogDropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow-main);
  padding: 8px 0;
  min-width: 200px;
  z-index: 100;
  margin-top: 16px;
  animation: fadeIn 0.2s ease-out;
  display: flex;
  flex-direction: column;
}

.catalogItem {
  padding: 10px 20px;
  color: var(--text-main);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background-color: var(--primary-light);
    color: var(--primary-color);
    padding-left: 24px;
  }
}

.dropdownDivider {
  height: 1px;
  background-color: var(--border-color);
  margin: 8px 0;
}

.randomBtn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  background: transparent;
  border: none;
  color: #f39c12; 
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(243, 156, 18, 0.1);
    color: #f1c40f;
    padding-left: 20px;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.searchTrigger {
  background: var(--bg-sidebar);
  border: 1px solid var(--border-color);
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 20px;
  min-width: 240px;

  &:hover {
    border-color: var(--primary-color);
    background-color: var(--bg-card);

    .searchIcon {
      color: var(--primary-color);
    }
    
    .searchText {
      color: var(--text-main);
    }
  }

  @media (max-width: 768px) {
    width: 100%;
    min-width: unset;
    height: 40px;
    padding: 0 20px;
  }
}

.searchIcon {
  font-size: 1.1rem;
  color: var(--text-muted);
  transition: all 0.2s;
}

.searchText {
  font-size: 0.95rem;
  color: var(--text-muted);
  font-weight: 500;
  transition: color 0.2s;
}

.bookmarkLink {
  color: var(--text-main);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--border-radius-md);
  transition: all 0.2s;

  &:hover {
    background-color: var(--secondary-color);
    color: var(--primary-color);
  }
}

.authBtn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: var(--border-radius-md);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
}

.userProfileContainer {
  display: flex;
  align-items: center;
  gap: 16px;
}

.headerAvatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--secondary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
  text-decoration: none;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover {
    border-color: var(--primary-color);
    transform: scale(1.05);
  }
}

.hamburgerBtn {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 18px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  box-sizing: content-box;
  transition: opacity 0.2s;

  .bar {
    width: 100%;
    height: 2px;
    background-color: var(--text-main);
    border-radius: 2px;
    transition: all 0.2s;
  }

  &:hover {
    opacity: 0.8;
    
    .bar {
      background-color: var(--primary-color);
      box-shadow: 0 0 5px var(--primary-color);
    }
  }
}

```

## frontend\src\components\InteractionSection.jsx
```javascript
import React, { useState, useEffect, useCallback } from 'react';
import { FiSend, FiMessageSquare, FiTrash2, FiUser, FiStar, FiHash } from 'react-icons/fi';
import styles from './CommentSection.module.scss'; // Перевикористовуємо стилі для консистентності

const InteractionSection = ({ targetId, resourceType, type }) => {
  const [items, setItems] = useState([]);
  const [newContent, setNewContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE = 'http://localhost:5000';
  const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');

  const fetchInteractions = useCallback(async () => {
    setIsLoading(true);
    try {
      // Додаємо фільтр по типу (comment/review/discussion)
      const response = await fetch(`${API_BASE}/api/comments/${targetId}?type=${type}`);
      const data = await response.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (err) {
      console.error('Помилка завантаження даних:', err);
    } finally {
      setIsLoading(false);
    }
  }, [targetId, type]);

  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newContent.trim() || !loggedInUser) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: newContent,
          resourceId: targetId,
          resourceType,
          interactionType: type
        })
      });

      const data = await response.json();
      if (data.success) {
        setItems([data.data, ...items]);
        setNewContent('');
      }
    } catch (err) {
      console.error('Помилка відправки:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей запис?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/comments/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setItems(items.filter(i => i._id !== itemId));
      }
    } catch (err) {
      console.error('Помилка видалення:', err);
    }
  };

  const getHeaderInfo = () => {
    switch (type) {
      case 'review':
        return { icon: <FiStar size={20} />, label: 'Відгуки' };
      case 'discussion':
        return { icon: <FiHash size={20} />, label: 'Обговорення' };
      default:
        return { icon: <FiMessageSquare size={20} />, label: 'Коментарі' };
    }
  };

  const { icon, label } = getHeaderInfo();

  return (
    <div className={styles.commentSection}>
      <div className={styles.header}>
        {icon}
        <h3>{label} ({items.length})</h3>
      </div>

      {loggedInUser ? (
        <form onSubmit={handleSubmit} className={styles.commentForm}>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder={
              type === 'review' ? "Поділіться вашим детальним відгуком..." : 
              type === 'discussion' ? "Почніть нову тему для обговорення..." : 
              "Напишіть вашу думку..."
            }
            rows="4"
            required
          />
          <button type="submit" disabled={isSubmitting || !newContent.trim()}>
            {isSubmitting ? '...' : <><FiSend /> <span>Відправити</span></>}
          </button>
        </form>
      ) : (
        <div className={styles.loginPrompt}>
          Будь ласка, увійдіть у систему, щоб залишити {type === 'review' ? 'відгук' : 'повідомлення'}.
        </div>
      )}

      <div className={styles.commentsList}>
        {isLoading ? (
          <div className={styles.loading}>Завантаження...</div>
        ) : items.length > 0 ? (
          items.map((item) => (
            <div key={item._id} className={styles.commentItem}>
              <div className={styles.avatarWrapper}>
                {item.author?.avatar ? (
                  <img src={item.author.avatar} alt={item.author.username} />
                ) : (
                  <div className={styles.placeholder}><FiUser /></div>
                )}
              </div>
              <div className={styles.contentWrapper}>
                <div className={styles.commentHeader}>
                  <span className={styles.username}>{item.author?.username || 'Невідомий'}</span>
                  <span className={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</span>
                  {(loggedInUser && (item.author?._id === (loggedInUser.id || loggedInUser._id) || loggedInUser.role === 'admin')) && (
                    <button className={styles.deleteBtn} onClick={() => handleDelete(item._id)}>
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
                <p className={styles.text}>{item.content}</p>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.empty}>Тут поки що порожньо. Будьте першим!</div>
        )}
      </div>
    </div>
  );
};

export default InteractionSection;

```

## frontend\src\components\Logo\Logo.jsx
```javascript
import React from 'react';

const Logo = ({ className }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 150" 
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 1. ВУШКА КОТИКА (Верхній лівий кут літери S) */}
      {/* Трикутник, що дивиться вгору */}
      <polygon points="30,25 40,0 50,25" />
      {/* Трикутник, що дивиться вліво */}
      <polygon points="30,25 5,35 30,45" />
      
      {/* 2. ЛІТЕРА "S" (Масивна основа) */}
      <text 
        x="50" 
        y="90" 
        fontFamily="sans-serif" 
        fontWeight="900" 
        fontSize="100" 
        textAnchor="middle"
      >
        S
      </text>
      
      {/* 3. ЛІТЕРА "F" (Ніжка виростає з S) */}
      {/* Вертикальна лінія */}
      <rect x="40" y="80" width="20" height="40" />
      {/* Горизонтальна риска праворуч */}
      <rect x="60" y="95" width="25" height="16" />
      
      {/* 4. НОСИК КОТИКА (Самий низ, перевернутий трикутник) */}
      <polygon points="38,125 62,125 50,137" />
      
      {/* КРИХІТНИЙ РОМБ / ЗІРОЧКА (Під носиком) */}
      <polygon points="50,139 55,143 50,147 45,143" />
    </svg>
  );
};

export default Logo;

```

## frontend\src\components\NotificationModal.jsx
```javascript
import React from 'react';
import styles from './NotificationModal.module.scss';

const NotificationModal = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.content}>
          <p>{message}</p>
        </div>
        <button className={styles.okBtn} onClick={onClose}>
          ОК
        </button>
      </div>
    </div>
  );
};

export default NotificationModal;

```

## frontend\src\components\NotificationModal.module.scss
```scss
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-out;
}

.modal {
  background: #141414;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 32px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  animation: scaleUp 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.content {
  p {
    margin: 0;
    color: #ffffff;
    font-size: 1.1rem;
    text-align: center;
    line-height: 1.5;
    font-weight: 500;
  }
}

.okBtn {
  background: #ff4757; // Фірмовий червоний
  color: white;
  border: none;
  padding: 12px 48px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 71, 87, 0.4);
    background: #ff6b81;
  }

  &:active {
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

```

## frontend\src\components\PopularAuthors.jsx
```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PopularAuthors.module.scss';

const PopularAuthors = () => {
  const navigate = useNavigate();
  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/authors');
        const data = await response.json();
        if (data.success) {
          setAuthors(data.data);
        }
      } catch (err) {
        console.error('Помилка завантаження авторів:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuthors();
  }, []);

  return (
    <div className={styles.popularAuthorsCard}>
      <h2 className={styles.sidebarTitle}>Наші автори</h2>
      <div className={styles.authorsList}>
        {!isLoading ? (
          authors.length > 0 ? (
            authors.map((author) => (
              <div 
                key={author._id} 
                className={styles.authorItem}
                onClick={() => navigate(`/profile/${author.username}`)}
              >
                <div className={styles.authorAvatar}>
                  {author.avatar ? (
                    <img src={author.avatar} alt={author.username} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>{author.username.charAt(0)}</div>
                  )}
                </div>
                <div className={styles.authorInfo}>
                  <span className={styles.authorName}>{author.username}</span>
                  <span className={styles.authorRole}>Автор проекту</span>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.emptyText}>Авторів поки немає</p>
          )
        ) : (
          <p className={styles.loadingText}>Завантаження...</p>
        )}
      </div>
      <button className={styles.moreBtn} onClick={() => navigate('/authors')}>ВСІ АВТОРИ</button>
    </div>
  );
};

export default PopularAuthors;

```

## frontend\src\components\PopularAuthors.module.scss
```scss
@import '../styles/variables';

.popularAuthorsCard {
  background-color: var(--bg-card);
  border-radius: var(--border-radius-lg);
  padding: 20px;
  position: static;
  height: auto;
  min-height: max-content;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-main);
  border: 1px solid var(--border-color);
}

.sidebarTitle {
  font-size: 1.25rem;
  margin-bottom: 16px;
  color: var(--text-main);
  font-weight: 700;
}

.authorsList {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.authorItem {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: var(--border-radius-md);
  transition: background var(--transition-speed);
  cursor: pointer;

  &:hover {
    background-color: var(--secondary-color);
    
    .authorName {
      color: var(--primary-color);
    }
  }
}

.authorAvatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-main);
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.avatarPlaceholder {
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--primary-color);
}

.authorInfo {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.authorName {
  font-weight: 600;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--transition-speed);
  color: var(--text-main);
}

.authorRole {
  color: var(--text-muted);
  font-size: 0.75rem;
  margin-top: 2px;
}

.moreBtn {
  width: 100%;
  margin-top: 16px;
  display: block;
  text-align: center;
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  padding: 8px;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background-color: var(--primary-light);
  }
}

.emptyText, .loadingText {
  color: var(--text-muted);
  font-size: 0.9rem;
  text-align: center;
  padding: 10px 0;
}

```

## frontend\src\components\ProfileDropdown.jsx
```javascript
import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiUser, 
  FiBell, 
  FiMessageSquare, 
  FiClock, 
  FiBarChart2, 
  FiSettings, 
  FiLogOut, 
  FiMoon, 
  FiSun,
  FiX,
  FiChevronRight,
  FiEdit3,
  FiPlusSquare,
  FiShield,
  FiShuffle
} from 'react-icons/fi';
import { LuShieldCheck } from 'react-icons/lu';
import { useTheme } from '../context/ThemeContext';
import styles from './ProfileDropdown.module.scss';

const ProfileDropdown = ({ isOpen, onClose, user, onLogout }) => {
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleRandomClick = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/manga/random');
      const data = await response.json();
      if (data.success && data.id) {
        onClose();
        navigate(`/manga/${data.id}`);
      }
    } catch (err) {
      console.error('Помилка при отриманні випадкового тайтлу:', err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Затемнення фону */}
      <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`} onClick={onClose}></div>
      
      {/* Бічне меню */}
      <div className={`${styles.sideMenu} ${isOpen ? styles.open : ''}`} ref={menuRef}>
        <div className={styles.menuHeader}>
          <div className={styles.userInfo}>
            <Link to={`/profile/${user?.username}`} className={styles.profileLink} onClick={onClose}>
              Мій профіль <FiChevronRight size={16} />
            </Link>
            <div className={styles.nameWithBadge}>
              <h3 className={styles.username}>{user?.username}</h3>
              {user?.role === 'admin' && (
                <div className={`${styles.authorBadge} ${styles.adminBadge}`}>
                  <LuShieldCheck size={12} strokeWidth={2.5} />
                  <span>Адміністратор</span>
                </div>
              )}
              {user?.role === 'author' && (
                <div className={styles.authorBadge}>
                  <FiEdit3 size={10} />
                  <span>Автор</span>
                </div>
              )}
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <nav className={styles.menuLinks}>
          {user?.role === 'author' && (
            <Link to="/create-manga" className={`${styles.menuItem} ${styles.createBtn}`} onClick={onClose}>
              <FiPlusSquare className={styles.icon} size={20} /> 
              <span className={styles.createBtnText}>Додати тайтл</span>
            </Link>
          )}
          
          <Link to="/notifications" className={styles.menuItem} onClick={onClose}>
            <FiBell className={styles.icon} size={20} /> Повідомлення
          </Link>
          <Link to={`/profile/${user?.username}?tab=comments`} className={styles.menuItem} onClick={onClose}>
            <FiMessageSquare className={styles.icon} size={20} /> Коментарі
          </Link>
          <Link to={`/profile/${user?.username}?tab=history`} className={styles.menuItem} onClick={onClose}>
            <FiClock className={styles.icon} size={20} /> Історія переглядів
          </Link>
          <Link to={`/profile/${user?.username}?tab=stats`} className={styles.menuItem} onClick={onClose}>
            <FiBarChart2 className={styles.icon} size={20} /> Статистика
          </Link>

          <button className={styles.menuItem} onClick={handleRandomClick}>
            <FiShuffle className={styles.icon} size={20} /> Випадковий тайтл
          </button>
          
          <div className={styles.divider}></div>
          
          <button className={styles.menuItem} onClick={(e) => toggleTheme(e)}>
            {theme === 'dark' ? <FiMoon className={styles.icon} size={20} /> : <FiSun className={styles.icon} size={20} />}
            Тема сайту: <span className={styles.themeText}>{theme === 'dark' ? 'Темна' : 'Світла'}</span>
          </button>
          <Link to={`/profile/${user?.username}?tab=settings`} className={styles.menuItem} onClick={onClose}>
            <FiSettings className={styles.icon} size={20} /> Налаштування
          </Link>
          
          <button className={`${styles.menuItem} ${styles.logoutBtn}`} onClick={onLogout}>
            <FiLogOut className={styles.icon} size={20} /> Вихід
          </button>
        </nav>
      </div>
    </>
  );
};

export default ProfileDropdown;




```

## frontend\src\components\ProfileDropdown.module.scss
```scss
@import '../styles/variables';

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 2000;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease;

  &.open {
    opacity: 1;
    visibility: visible;
  }
}

.sideMenu {
  position: fixed;
  top: 0;
  right: -320px; /* Сховано за екраном */
  width: 320px;
  height: 100vh;
  background-color: var(--bg-card);
  box-shadow: var(--shadow-main);
  z-index: 2001;
  display: flex;
  flex-direction: column;
  padding: 24px;
  transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;

  &.open {
    right: 0;
  }
}

.menuHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.userInfo {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.profileLink {
  font-size: 0.85rem;
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;

  &:hover {
    color: var(--primary-color);
  }
}

.username {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
}

.nameWithBadge {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.authorBadge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
  color: white;
  border-radius: 50px;
  font-size: 0.65rem;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(124, 58, 237, 0.3);

  span {
    line-height: 1;
  }
}

.adminBadge {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
  box-shadow: none;
}

.closeBtn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: var(--primary-color);
  }
}

.menuLinks {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.createBtn {
  background: rgba(255, 71, 87, 0.05) !important;
  border: 1px dashed var(--primary-color) !important;
  margin-bottom: 8px !important;
  color: var(--primary-color) !important;

  &:hover {
    background: var(--primary-color) !important;
    color: #fff !important;
    border-style: solid !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.2);

    .icon {
      opacity: 1;
      color: #fff;
    }
  }

  .createBtnText {
    font-weight: 700;
  }
}

.menuItem {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: none;
  border: none;
  color: var(--text-main);
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;

  .icon {
    font-size: 1.2rem;
    width: 24px;
    text-align: center;
    opacity: 0.8;
  }

  .themeText {
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  &:hover {
    background-color: var(--secondary-color);
    color: var(--primary-color);

    .icon {
      opacity: 1;
    }
  }
}

.divider {
  height: 1px;
  background-color: var(--border-color);
  margin: 12px 0;
}

.logoutBtn {
  color: var(--primary-color) !important;
  margin-top: auto;

  .icon {
    opacity: 1;
  }

  &:hover {
    background-color: rgba(255, 71, 87, 0.1) !important;
  }
}

```

## frontend\src\components\ProfileSettingsModal.jsx
```javascript
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { FiX, FiUploadCloud, FiZap, FiUser as GenderIcon, FiCheckCircle } from 'react-icons/fi';
import { FaMars, FaVenus } from 'react-icons/fa';
import styles from './ProfileSettingsModal.module.scss';

const ProfileSettingsModal = ({ isOpen, onClose, user, onSaveSuccess }) => {
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('');
  const [banner, setBanner] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [gender, setGender] = useState('secret');
  const [isSaved, setIsSaved] = useState(false);

  // Управління завантаженням та обрізкою (Cropper)
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropType, setCropType] = useState(null); // 'avatar' | 'banner'

  const [isDragging, setIsDragging] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      setNickname(user.username || '');
      setAvatar(user.avatar || '');
      setBanner(user.banner || '');
      setAboutMe(user.aboutMe || '');
      setGender(user.gender || 'secret');
      setIsSaved(false);
      
      document.body.style.overflow = 'hidden';
    } else if (!isOpen) {
      document.body.style.overflow = 'unset';
      setImageSrc(null);
      setNickname('');
      setAvatar('');
      setBanner('');
      setAboutMe('');
      setGender('secret');
    }
  }, [isOpen, user]);

  const handleInputChange = (setter, value) => {
    setter(value);
    setIsSaved(false); // Скидаємо стейт збереження при будь-якій зміні
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: nickname,
          avatar,
          banner,
          aboutMe,
          gender
        })
      });

      const data = await response.json();

      if (data.success) {
        // Оновлюємо дані в localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...data.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Повідомляємо інші компоненти про оновлення
        window.dispatchEvent(new Event('profileUpdate'));
        
        setIsSaved(true);
        if (onSaveSuccess) onSaveSuccess();

        // Якщо нікнейм змінився, треба змінити URL через деякий час
        if (nickname !== currentUser.username) {
          setTimeout(() => {
            window.location.href = `/profile/${nickname}`;
          }, 2000);
        }
      } else {
        alert(data.error || 'Помилка при збереженні');
      }
    } catch (err) {
      console.error('Помилка збереження:', err);
      alert('Не вдалося зберегти зміни');
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleDragOver = (e, type) => {
    e.preventDefault();
    setIsDragging(type);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(null);
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setIsDragging(null);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result);
        setCropType(type);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result);
        setCropType(type);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = ''; // Очищаємо інпут
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Утиліта для обрізки зображення через Canvas
  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleCropConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      if (cropType === 'avatar') {
        setAvatar(croppedImage);
      } else if (cropType === 'banner') {
        setBanner(croppedImage);
      }
      
      setIsSaved(false);
      
      // Закриваємо кроппер
      setImageSrc(null);
      setCropType(null);
    } catch (e) {
      console.error("Помилка обрізки зображення:", e);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.backdrop} onClick={handleClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <h2>Налаштування профілю</h2>
            <button className={styles.closeBtn} onClick={handleClose}><FiX size={24} /></button>
          </div>

          <div className={styles.content}>
            {/* СЕКЦІЯ ЗОБРАЖЕНЬ */}
            <div className={styles.imagesSection}>
              {/* АВАТАР */}
              <div className={styles.avatarColumn}>
                <h3 className={styles.sectionLabel}>Аватар</h3>
                <div className={styles.avatarPreviewWrapper}>
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className={styles.avatarImage} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {nickname ? nickname.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                </div>
                <label 
                  className={`${styles.uploadZone} ${isDragging === 'avatar' ? styles.activeDrag : ''}`}
                  onDragOver={(e) => handleDragOver(e, 'avatar')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'avatar')}
                >
                  <FiUploadCloud size={32} className={styles.dropIcon} />
                  <span>Натисніть або перетягніть зображення</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className={styles.hiddenFileInput}
                    ref={avatarInputRef}
                    onChange={(e) => handleFileChange(e, 'avatar')}
                  />
                </label>
              </div>

              {/* БАНЕР */}
              <div className={styles.bannerColumn}>
                <div className={styles.bannerHeader}>
                  <h3 className={styles.sectionLabel}>Фон профілю</h3>
                </div>
                <div className={styles.bannerPreviewWrapper}>
                  {banner ? (
                    <img src={banner} alt="Banner" className={styles.bannerImage} />
                  ) : (
                    <div className={styles.bannerPlaceholder}>Немає фону</div>
                  )}
                </div>
                <label 
                  className={`${styles.uploadZone} ${isDragging === 'banner' ? styles.activeDrag : ''}`}
                  onDragOver={(e) => handleDragOver(e, 'banner')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'banner')}
                >
                  <FiUploadCloud size={32} className={styles.dropIcon} />
                  <span>Натисніть або перетягніть зображення</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className={styles.hiddenFileInput}
                    ref={bannerInputRef}
                    onChange={(e) => handleFileChange(e, 'banner')}
                  />
                </label>
              </div>
            </div>

            {/* СЕКЦІЯ ІНФОРМАЦІЇ */}
            <div className={styles.infoSection}>
              <h3 className={styles.sectionLabel}>Інформація</h3>
              
              <div className={styles.infoGrid}>
                <div className={styles.formGroup}>
                  <label>Нікнейм</label>
                  <input 
                    type="text" 
                    className={styles.textInput}
                    value={nickname} 
                    onChange={(e) => handleInputChange(setNickname, e.target.value)}
                    placeholder="Ваш нікнейм"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Стать</label>
                  <div className={styles.genderSelector}>
                    <button 
                      type="button"
                      className={`${styles.genderOption} ${gender === 'male' ? styles.active : ''}`}
                      onClick={() => handleInputChange(setGender, 'male')}
                    >
                      <FaMars size={18} className={styles.icon} />
                      <span>Чоловіча</span>
                    </button>
                    <button 
                      type="button"
                      className={`${styles.genderOption} ${gender === 'female' ? styles.active : ''}`}
                      onClick={() => handleInputChange(setGender, 'female')}
                    >
                      <FaVenus size={18} className={styles.icon} />
                      <span>Жіноча</span>
                    </button>
                    <button 
                      type="button"
                      className={`${styles.genderOption} ${gender === 'secret' ? styles.active : ''}`}
                      onClick={() => handleInputChange(setGender, 'secret')}
                    >
                      <GenderIcon size={18} className={styles.icon} />
                      <span>Секрет</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Про себе</label>
                <textarea 
                  className={styles.textArea}
                  value={aboutMe} 
                  onChange={(e) => handleInputChange(setAboutMe, e.target.value)}
                  placeholder="Розкажіть трохи про себе..."
                  rows="4"
                />
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            {isSaved ? (
              <div className={styles.successWrapper}>
                <span className={styles.successText}>
                  <FiZap size={18} className={styles.successIcon} /> Зміни збережено! Ваш аватар та банер оновлено. Тепер ви можете закрити це вікно.
                </span>
                <button className={styles.saveButton} onClick={handleClose}>
                  Закрити
                </button>
              </div>
            ) : (
              <button className={styles.saveButton} onClick={handleSave}>
                Зберегти зміни
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ОВЕРЛЕЙ ОБРІЗКИ (CROPPER REACT-EASY-CROP) */}
      {imageSrc && (
        <div className={styles.cropperOverlay} onClick={() => setImageSrc(null)}>
          <div className={styles.cropperModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.cropperHeader}>
              <h3>Обрізка зображення</h3>
            </div>
            
            <div className={styles.cropperContainer}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={cropType === 'avatar' ? 1 : 3 / 1}
                cropShape={cropType === 'avatar' ? 'round' : 'rect'}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className={styles.cropperControls}>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className={styles.zoomSlider}
              />
              <div className={styles.cropperButtons}>
                <button className={styles.cancelBtn} onClick={() => setImageSrc(null)}>
                  Відмінити
                </button>
                <button className={styles.cropBtn} onClick={handleCropConfirm}>
                  Обрізати
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileSettingsModal;

```

## frontend\src\components\ProfileSettingsModal.module.scss
```scss
@import '../styles/variables';

.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-overlay);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.modal {
  background: var(--bg-modal);
  width: 100%;
  max-width: 800px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-main);
  animation: modalAppear 0.3s ease-out;
  border: 1px solid var(--border-color);

  @keyframes modalAppear {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
}

.header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-main);
  }

  .closeBtn {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 1.5rem;
    cursor: pointer;
    line-height: 1;
    transition: color 0.2s;

    &:hover {
      color: var(--text-main);
    }
  }
}

.content {
  padding: 24px;
  max-height: 75vh;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 10px;
  }
}

/* ЗАГОЛОВКИ СЕКЦІЙ */
.sectionLabel {
  font-size: 0.85rem;
  color: var(--text-muted);
  text-transform: uppercase;
  font-weight: 700;
  margin: 0 0 15px 0;
  letter-spacing: 0.5px;
}

/* СЕКЦІЯ ЗОБРАЖЕНЬ */
.imagesSection {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 30px;
  margin-bottom: 40px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

/* АВАТАР */
.avatarColumn {
  display: flex;
  flex-direction: column;
  
  .avatarPreviewWrapper {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    background: var(--bg-card);
    overflow: hidden;
    margin-bottom: 15px;
    align-self: center;
    border: 2px solid var(--border-color);

    .avatarImage {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatarPlaceholder {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background: var(--secondary-color);
      color: var(--text-muted);
      font-size: 3rem;
      font-weight: 800;
    }
  }
}

/* БАНЕР */
.bannerColumn {
  display: flex;
  flex-direction: column;

  .bannerHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;

    h3 {
      margin: 0;
      color: var(--text-main);
    }

    .fakeTabs {
      display: flex;
      gap: 10px;
      
      button {
        background: none;
        border: none;
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        padding: 0;
      }

      .activeTab {
        color: var(--primary-color);
      }

      .inactiveTab {
        color: var(--text-muted);
        &:hover { color: var(--text-main); }
      }
    }
  }

  .bannerPreviewWrapper {
    width: 100%;
    height: 140px;
    background: var(--bg-card);
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 15px;
    border: 2px solid var(--border-color);
    display: flex;
    justify-content: center;
    align-items: center;

    .bannerImage {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .bannerPlaceholder {
      color: var(--text-muted);
      font-size: 0.9rem;
      font-weight: 500;
    }
  }
}

/* ЗОНИ ЗАВАНТАЖЕННЯ (DROPZONES) */
.uploadZone {
  width: 100%;
  padding: 16px;
  margin-top: 12px;
  border: 1px dashed var(--border-color);
  border-radius: 8px;
  background-color: transparent;
  color: var(--text-muted);
  text-align: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  &:hover, &.activeDrag {
    border-color: var(--primary-color);
    color: var(--text-main);
    background-color: var(--secondary-color);
  }

  .dropIcon {
    font-size: 1.5rem;
    margin-bottom: 4px;
  }

  .hiddenFileInput {
    display: none;
  }
}

/* СЕКЦІЯ ІНФОРМАЦІЇ */
.infoSection {
  .infoGrid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
      gap: 15px;
    }
  }
}

.formGroup {
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 0.85rem;
    color: var(--text-muted);
    font-weight: 600;
  }

  .textInput, .selectInput, .textArea {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    color: var(--text-main);
    padding: 12px 16px;
    font-size: 0.95rem;
    font-family: inherit;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    &::placeholder {
      color: var(--text-muted);
    }
  }

  .genderSelector {
    display: flex;
    gap: 10px;

    .genderOption {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 11px;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.9rem;
      font-weight: 600;

      &:hover {
        border-color: var(--primary-color);
        color: var(--text-main);
      }

      &.active {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: white;

        .icon {
          color: white;
        }
      }

      .icon {
        color: var(--text-muted);
        transition: color 0.2s;
      }
      
      &.active .icon {
        color: white;
      }
    }
  }

  .textArea {
    resize: vertical;
    min-height: 100px;
  }
}

/* ФУТЕР І КНОПКА */
.footer {
  padding: 20px 24px;
  border-top: 1px solid var(--border-color);
  
  .successWrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    animation: fadeIn 0.3s ease-out;

    .successText {
      color: #2ecc71;
      font-weight: 600;
      font-size: 0.95rem;
      text-align: center;
      line-height: 1.5;
    }
  }

  .saveButton {
    width: 100%;
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 14px;
    border-radius: var(--border-radius-md);
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255, 140, 0, 0.3);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

/* ОВЕРЛЕЙ ОБРІЗКИ (CROPPER) */
.cropperOverlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
}

.cropperModal {
  background: var(--bg-modal);
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-main);
  border: 1px solid var(--border-color);
}

.cropperHeader {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  
  h3 {
    margin: 0;
    font-size: 1.2rem;
    color: var(--text-main);
  }
}

.cropperContainer {
  position: relative;
  width: 100%;
  height: 400px;
  background: #000;
}

.cropperControls {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: var(--bg-modal);
  border-top: 1px solid var(--border-color);

  .zoomSlider {
    width: 100%;
    cursor: pointer;
    accent-color: var(--primary-color);
  }

  .cropperButtons {
    display: flex;
    justify-content: flex-end;
    gap: 15px;

    .cancelBtn {
      background: transparent;
      color: var(--text-muted);
      border: 1px solid var(--border-color);
      padding: 10px 24px;
      border-radius: var(--border-radius-md);
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;

      &:hover {
        background: var(--secondary-color);
        color: var(--text-main);
      }
    }

    .cropBtn {
      background: var(--primary-color);
      color: #fff;
      border: none;
      padding: 10px 30px;
      border-radius: var(--border-radius-md);
      cursor: pointer;
      font-weight: 700;
      transition: all 0.2s;

      &:hover {
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255, 140, 0, 0.3);
      }
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

```

## frontend\src\components\ProfileSidebar.jsx
```javascript
import React, { useState } from 'react';
import styles from './ProfileSidebar.module.scss';

const ProfileSidebar = ({ 
  activeTab, 
  listFilter, setListFilter,
  commentType, setCommentType,
  commentLocation, setCommentLocation
}) => {
  // Стани для фільтрів вкладки "Тайтли"
  const [viewFilter, setViewFilter] = useState('grid');
  const [sortFilter, setSortFilter] = useState('name');

  // Універсальний компонент кастомної радіо-кнопки
  const RadioOption = ({ name, value, checkedValue, onChange, label }) => (
    <label className={styles.radioLabel}>
      <input 
        type="radio" 
        name={name} 
        value={value} 
        checked={checkedValue === value} 
        onChange={(e) => onChange(e.target.value)} 
        className={styles.hiddenRadio} 
      />
      <span className={styles.circle}></span>
      <span className={styles.text}>{label}</span>
    </label>
  );

  const renderFilters = () => {
    switch (activeTab) {
      case 'titles':
        return (
          <>
            <div className={styles.filterBlock}>
              <h4 className={styles.blockTitle}>Список</h4>
              <RadioOption name="list" value="all" checkedValue={listFilter} onChange={setListFilter} label="Всі" />
              <RadioOption name="list" value="reading" checkedValue={listFilter} onChange={setListFilter} label="Читаю" />
              <RadioOption name="list" value="planned" checkedValue={listFilter} onChange={setListFilter} label="В планах" />
              <RadioOption name="list" value="dropped" checkedValue={listFilter} onChange={setListFilter} label="Кинуто" />
              <RadioOption name="list" value="read" checkedValue={listFilter} onChange={setListFilter} label="Прочитано" />
              <RadioOption name="list" value="favorites" checkedValue={listFilter} onChange={setListFilter} label="Улюблене" />
            </div>
          </>
        );
      
      case 'comments':
        return (
          <>
            <div className={styles.filterBlock}>
              <h4 className={styles.blockTitle}>Тип</h4>
              <RadioOption name="type" value="all" checkedValue={commentType} onChange={setCommentType} label="Всі" />
              <RadioOption name="type" value="manga" checkedValue={commentType} onChange={setCommentType} label="Манґа" />
              <RadioOption name="type" value="fanfic" checkedValue={commentType} onChange={setCommentType} label="Література" />
              <RadioOption name="type" value="manhwa" checkedValue={commentType} onChange={setCommentType} label="Манхва" />
            </div>

            <div className={styles.filterBlock}>
              <h4 className={styles.blockTitle}>Розміщення</h4>
              <RadioOption name="location" value="all" checkedValue={commentLocation} onChange={setCommentLocation} label="Всі" />
              <RadioOption name="location" value="under_title" checkedValue={commentLocation} onChange={setCommentLocation} label="Під тайтлом" />
              <RadioOption name="location" value="under_chapters" checkedValue={commentLocation} onChange={setCommentLocation} label="Під розділами" />
            </div>
          </>
        );

      default:
        return (
          <div className={styles.emptyFilter}>
            <p>Фільтри для цієї вкладки недоступні.</p>
          </div>
        );
    }
  };

  return (
    <aside className={styles.sidebar}>
      {renderFilters()}
    </aside>
  );
};

export default ProfileSidebar;

```

## frontend\src\components\ProfileSidebar.module.scss
```scss
@import '../styles/variables';

.sidebar {
  background-color: var(--bg-card);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  height: fit-content;
}

.filterBlock {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.blockTitle {
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  margin: 0 0 4px 0;
  letter-spacing: 0.5px;
}

.radioLabel {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
  
  .hiddenRadio {
    display: none; 
  }
  
  .circle {
    width: 18px;
    height: 18px;
    border: 2px solid var(--border-color);
    border-radius: 50%;
    position: relative;
    transition: border-color 0.2s ease;
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    
    &::after {
      content: '';
      position: absolute;
      width: 8px;
      height: 8px;
      background-color: var(--primary-color);
      border-radius: 50%;
      transform: scale(0);
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
  }
  
  .text {
    color: var(--text-secondary);
    font-size: 14px;
    transition: color 0.2s ease;
  }
  
  /* Стани при активності (checked) */
  .hiddenRadio:checked + .circle {
    border-color: var(--primary-color);
    
    &::after {
      transform: scale(1);
    }
  }
  
  .hiddenRadio:checked ~ .text {
    color: var(--text-main);
    font-weight: 500;
  }
  
  /* Ефекти при наведенні миші */
  &:hover .circle {
    border-color: var(--text-muted);
  }
  
  &:hover .hiddenRadio:checked + .circle {
    border-color: var(--primary-color);
  }
  
  &:hover .text {
    color: var(--text-main);
  }
}

.emptyFilter {
  color: var(--text-muted);
  font-size: 14px;
  text-align: center;
  padding: 40px 0;
  
  p {
    margin: 0;
  }
}

```

## frontend\src\components\SearchOverlay.jsx
```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiSearch, FiTrendingUp, FiClock, FiBookOpen, FiUser } from 'react-icons/fi';
import styles from './SearchOverlay.module.scss';

const SearchOverlay = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('manga'); // 'manga', 'manhwa', 'authors'
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }
      
      setIsLoading(true);
      try {
        let url = `http://localhost:5000/api/manga/search?q=${encodeURIComponent(searchQuery)}`;
        
        if (activeTab === 'manhwa') {
          url += '&type=manhwa';
        } else if (activeTab === 'manga') {
          url += '&type=manga';
        }

        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
          // Форматуємо результати під інтерфейс
          const formattedResults = data.data.map(item => ({
            id: item._id,
            title: item.title,
            type: item.type,
            image: item.coverImage
          }));
          setResults(formattedResults);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Простий debounce
    const timeoutId = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeTab]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleResultClick = (id, type) => {
    onClose();
    if (type === 'author') {
      navigate(`/profile/${id}`);
    } else {
      navigate(`/manga/${id}`);
    }
  };

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.visible : ''}`} onClick={onClose}>
      <div className={styles.searchContainer} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.searchHeader}>
          <div className={styles.inputWrapper}>
            <FiSearch className={styles.searchIcon} />
            <input 
              type="text" 
              className={styles.searchInput}
              placeholder="Пошук манґи, авторів..." 
              value={searchQuery}
              onChange={handleSearch}
              autoFocus
            />
            {searchQuery && (
              <button className={styles.clearBtn} onClick={() => setSearchQuery('')}>
                <FiX size={20} />
              </button>
            )}
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <FiX size={28} />
          </button>
        </div>

        <div className={styles.tabs}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'manga' ? styles.active : ''}`}
            onClick={() => setActiveTab('manga')}
          >
            Манґа
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'manhwa' ? styles.active : ''}`}
            onClick={() => setActiveTab('manhwa')}
          >
            Манхва
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'authors' ? styles.active : ''}`}
            onClick={() => setActiveTab('authors')}
          >
            Автори
          </button>
        </div>

        <div className={styles.content}>
          {searchQuery ? (
            <div className={styles.resultsGrid}>
              {results.length > 0 ? (
                results.map((item) => (
                  <div 
                    key={item.id} 
                    className={styles.resultItem}
                    onClick={() => handleResultClick(item.id, activeTab === 'authors' ? 'author' : 'manga')}
                  >
                    <div className={styles.resultAvatar}>
                      {activeTab === 'authors' ? <FiUser /> : (item.image ? <img src={item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`} alt={item.title} className={styles.resultImg} /> : <FiBookOpen />)}
                    </div>
                    <div className={styles.resultInfo}>
                      <span className={styles.resultTitle}>{item.title || item.name}</span>
                      <span className={styles.resultMeta}>
                        {activeTab === 'authors' ? 'Автор' : item.type}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noResults}>
                  <p>Нічого не знайдено за цим запитом</p>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>Почніть вводити назву, щоб знайти тайтл або автора</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;

```

## frontend\src\components\SearchOverlay.module.scss
```scss
@import '../styles/variables';

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 15, 15, 0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;

  &.visible {
    opacity: 1;
    pointer-events: auto;

    .searchContainer {
      transform: translateY(0);
    }
  }
}

.searchContainer {
  max-width: 700px;
  width: 100%;
  margin: 10vh auto 0 auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  transform: translateY(-20px);
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.searchHeader {
  display: flex;
  align-items: center;
  gap: 16px;
}

.inputWrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background: #222;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 0 20px;
  position: relative;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: var(--primary-color);
  }
}

.searchIcon {
  font-size: 1.2rem;
  color: var(--text-muted);
  margin-right: 12px;
}

.searchInput {
  flex: 1;
  background: none;
  border: none;
  padding: 18px 0;
  font-size: 1.1rem;
  color: #fff;
  outline: none;

  &::placeholder {
    color: var(--text-muted);
  }
}

.clearBtn {
  background: none;
  border: none;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 5px;
  transition: color 0.2s;

  &:hover {
    color: #fff;
  }
}

.closeBtn {
  background: none;
  border: none;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 10px;
  transition: all 0.2s;

  &:hover {
    color: #ef4444;
    transform: rotate(90deg);
  }
}

/* Tabs */
.tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.tabBtn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  &.active {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: #fff;
  }
}

/* Results Area */
.content {
  flex: 1;
  overflow-y: auto;
  max-height: 60vh;
  padding-right: 5px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 10px;
  }
}

.resultsGrid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.resultItem {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid transparent;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateX(4px);
    
    .resultTitle {
      color: var(--primary-color);
    }
  }
}

.resultAvatar {
  width: 50px;
  height: 70px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: #222;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);

  .resultImg {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.resultInfo {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.resultTitle {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 4px 0;
  transition: color 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #fff;
}

.resultMeta {
  font-size: 0.85rem;
  color: var(--text-muted);
  text-transform: capitalize;
}

.noResults, .emptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: var(--text-muted);
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
}

@media (max-width: 600px) {
  .searchContainer {
    margin-top: 20px;
    padding: 0 16px;
  }
}

```

## frontend\src\components\Sidebar.jsx
```javascript
import React from 'react';
import { FiStar } from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = () => {
  const topManga = [
    { id: 1, title: 'Підняття рівня поодинці', rating: '9.8' },
    { id: 2, title: 'Ван Піс', rating: '9.5' },
    { id: 3, title: 'Берсерк', rating: '9.9' },
  ];

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Топ за тиждень</h2>
      <ul className="top-list">
        {topManga.map((manga, index) => (
          <li key={manga.id} className="top-item">
            <span className="rank">{index + 1}</span>
            <div className="manga-info">
              <span className="manga-title">{manga.title}</span>
              <span className="manga-rating"><FiStar size={14} fill="currentColor" /> {manga.rating}</span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;

```

## frontend\src\components\SidebarUpdates.jsx
```javascript
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './SidebarUpdates.module.scss';

const SidebarUpdates = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('manga'); // 'manga', 'manhwa' або 'fanfic'
  const [updates, setUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/manga/sidebar-updates?type=${activeTab}`);
        const result = await response.json();
        
        if (result.success && Array.isArray(result.data)) {
          setUpdates(result.data);
        } else {
          setUpdates([]);
        }
      } catch (err) {
        console.error('Помилка завантаження оновлень:', err);
        setUpdates([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpdates();
  }, [activeTab]);

  const getTypeLabel = (type) => {
    if (type === 'manga') return 'Манґа';
    if (type === 'manhwa') return 'Манхва';
    if (type === 'fanfic') return 'Література';
    return type;
  };

  const handleItemClick = (item) => {
    if (activeTab === 'fanfic') {
      navigate(`/fanfic/${item._id}`);
    } else {
      navigate(`/manga/${item._id}`);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 60000);
    if (diff < 1) return 'щойно';
    if (diff < 60) return `${diff} хв. тому`;
    if (diff < 1440) return `${Math.floor(diff / 60)} год. тому`;
    return new Date(date).toLocaleDateString('uk-UA');
  };

  return (
    <div className={styles.sidebarCard}>
      <h2 className={styles.sidebarTitle}>Останні оновлення</h2>

      <div className={styles.tabs}>
        {['manga', 'manhwa', 'fanfic'].map(tab => (
          <button 
            key={tab}
            className={`${styles.tabBtn} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {getTypeLabel(tab)}
          </button>
        ))}
      </div>

      <div className={styles.updatesList} key={activeTab}>
        {!isLoading ? (
          updates.length > 0 ? (
            updates.map((item) => (
              <div 
                key={item._id} 
                className={styles.updateItem}
                onClick={() => handleItemClick(item)}
                style={{ cursor: 'pointer' }}
              >
                <img 
                  src={item.coverImage ? (item.coverImage.startsWith('http') ? item.coverImage : `http://localhost:5000${item.coverImage}`) : 'http://localhost:5000/uploads/no-photo.jpg'} 
                  alt={item.title} 
                  className={styles.updateAvatar} 
                />
                <div className={styles.updateInfo}>
                  <span className={styles.updateName}>{item.title}</span>
                  <div className={styles.updateMeta}>
                    <span className={styles.updateType}>
                      {activeTab === 'fanfic' ? 'Фанфік' : item.type}
                    </span>
                    <span className={styles.updateTime}>
                      {formatTime(item.updatedAt || item.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.emptyText}>Оновлень немає</p>
          )
        ) : (
          <p className={styles.loadingText}>Завантаження...</p>
        )}
      </div>

      <Link to={`/updates?type=${activeTab}`} className={styles.moreBtn}>ДИВИТИСЬ ВСІ</Link>
    </div>
  );
};

export default SidebarUpdates;

```

## frontend\src\components\SidebarUpdates.module.scss
```scss
@import '../styles/variables';

.sidebarCard {
  background-color: var(--bg-card);
  border-radius: var(--border-radius-lg);
  padding: 20px;
  position: static;
  height: auto;
  min-height: max-content;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-main);
  border: 1px solid var(--border-color);
}

.sidebarTitle {
  font-size: 1.25rem;
  margin-bottom: 16px;
  color: var(--text-main);
  font-weight: 700;
}

/* Контейнер табів */
.tabs {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
  justify-content: flex-start;

  @media (max-width: 480px) {
    gap: 8px;
    justify-content: space-between;
  }
}

.tabBtn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  transition: all var(--transition-speed) ease;
  position: relative;

  &:hover {
    color: var(--text-main);
  }

  &.active {
    color: var(--primary-color);

    &::after {
      content: '';
      position: absolute;
      bottom: -11px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: var(--primary-color);
    }
  }
}

/* Список */
.updatesList {
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: fadeIn 0.4s ease-out;
}

.updateItem {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: var(--border-radius-md);
  transition: background var(--transition-speed);
  cursor: pointer;

  &:hover {
    background-color: var(--secondary-color);
    
    .updateName {
      color: var(--primary-color);
    }
  }
}

.updateAvatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-color);
}

.updateInfo {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.updateName {
  font-weight: 600;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--transition-speed);
  color: var(--text-main);
}

.updateMeta {
  display: flex;
  flex-direction: column;
  font-size: 0.75rem;
}

.updateType {
  color: var(--text-muted);
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.5px;
}

.updateChapter {
  color: var(--primary-color);
  font-weight: 500;
  margin-top: 2px;
}

.newsTag {
  color: #ff8c00;
  font-weight: 800;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.announcementItem {
  background: rgba(255, 140, 0, 0.03);
  
  &:hover {
    background: rgba(255, 140, 0, 0.08) !important;
  }
}

.moreBtn {
  width: 100%;
  margin-top: 16px;
  display: block;
  text-align: center;
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  padding: 8px;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background-color: var(--primary-light);
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

```

## frontend\src\components\TagCategories.jsx
```javascript
import React, { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import styles from './TagCategories.module.scss';

const CATEGORIES_DATA = [
  { id: 'genres', name: 'Жанри', tags: ['Екшн', 'Комедія', 'Драма', 'Романтика', 'Фентезі', 'Психологія', 'Жахи', 'Пригоди', 'Спорт'] },
  { id: 'formats', name: 'Формат', tags: ['Манґа', 'Манхва'] },
  { id: 'status', name: 'Статус', tags: ['Онґоінґ', 'Завершено', 'Анонс'] }
];

const TagCategories = ({ 
  activeGenre, setActiveGenre, 
  activeFormat, setActiveFormat, 
  activeStatus, setActiveStatus 
}) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const toggleCategory = (id) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  const handleTagClick = (categoryId, tag) => {
    if (categoryId === 'genres') {
      setActiveGenre(activeGenre === tag ? null : tag);
    } else if (categoryId === 'formats') {
      setActiveFormat(activeFormat === tag ? null : tag);
    } else if (categoryId === 'status') {
      setActiveStatus(activeStatus === tag ? null : tag);
    }
  };

  const isTagActive = (categoryId, tag) => {
    if (categoryId === 'genres') return activeGenre === tag;
    if (categoryId === 'formats') return activeFormat === tag;
    if (categoryId === 'status') return activeStatus === tag;
    return false;
  };

  return (
    <div className={styles.tagCard}>
      <h2 className={styles.cardTitle}>Категорії тегів</h2>
      
      <div className={styles.categoriesList}>
        {CATEGORIES_DATA.map((cat) => (
          <div key={cat.id} className={styles.categoryItem}>
            <button 
              className={`${styles.categoryHeader} ${expandedCategory === cat.id ? styles.active : ''}`}
              onClick={() => toggleCategory(cat.id)}
            >
              <span>{cat.name}</span>
              <FiChevronDown 
                size={18} 
                className={`${styles.arrow} ${expandedCategory === cat.id ? styles.rotated : ''}`} 
              />
            </button>
            
            <div className={`${styles.tagCloud} ${expandedCategory === cat.id ? styles.expanded : ''}`}>
              {cat.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className={`${styles.tag} ${isTagActive(cat.id, tag) ? styles.active : ''}`}
                  onClick={() => handleTagClick(cat.id, tag)}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagCategories;

```

## frontend\src\components\TagCategories.module.scss
```scss
@import '../styles/variables';

.tagCard {
  background-color: var(--bg-card);
  border-radius: var(--border-radius-lg);
  padding: 20px;
  height: auto;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-main);
  border: 1px solid var(--border-color);
}

.cardTitle {
  font-size: 1.25rem;
  margin-bottom: 16px;
  color: var(--text-main);
  font-weight: 700;
}

.categoriesList {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.categoryItem {
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
  }
}

.categoryHeader {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 8px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all var(--transition-speed);

  &:hover {
    color: var(--text-main);
    background-color: var(--secondary-color);
  }

  &.active {
    color: var(--primary-color);
  }
}

.arrow {
  transition: transform 0.3s ease;
  color: var(--text-muted);

  &.rotated {
    transform: rotate(180deg);
  }
}

.tagCloud {
  max-height: 0;
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 8px;
  transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s;

  &.expanded {
    max-height: 1000px; /* Достатньо для будь-якої кількості тегів */
    padding: 8px 8px 16px 8px;
  }
}

.tag {
  background-color: var(--secondary-color);
  color: var(--text-muted);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover, &.active {
    background-color: var(--primary-color);
    color: white;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(255, 140, 0, 0.2);
  }
}

```

## frontend\src\components\UpdatesGrid.jsx
```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UpdatesGrid.css';

const UpdatesGrid = () => {
  const navigate = useNavigate();
  const [updates, setUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/manga');
        const data = await response.json();
        if (data.success) {
          // Поки що просто беремо мангу як "оновлення", 
          // пізніше можна буде зробити ендпоінт для останніх розділів
          const formatted = data.data.slice(0, 12).map(m => ({
            id: m._id,
            title: m.title,
            chapter: m.status, // Тимчасово замість розділу показуємо статус
            cover: m.coverImage ? (m.coverImage.startsWith('http') ? m.coverImage : `http://localhost:5000${m.coverImage}`) : ''
          }));
          setUpdates(formatted);
        }
      } catch (error) {
        console.error('Помилка завантаження оновлень:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpdates();
  }, []);

  if (isLoading) return <div className="updates-loading">Завантаження оновлень...</div>;

  return (
    <div className="updates-container">
      <h2 className="section-title">Останні оновлення</h2>
      {updates.length > 0 ? (
        <div className="updates-grid">
          {updates.map(manga => (
            <div 
              key={manga.id} 
              className="manga-card"
              onClick={() => navigate(`/manga/${manga.id}`)}
            >
              <div className="cover-wrapper">
                <img src={manga.cover} alt={manga.title} />
                <div className="chapter-badge">{manga.chapter}</div>
              </div>
              <h3 className="manga-card-title">{manga.title}</h3>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-text">Оновлень поки що немає.</p>
      )}
    </div>
  );
};

export default UpdatesGrid;

```

## frontend\src\context\ThemeContext.jsx
```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Відновлюємо тему з localStorage при першому завантаженні, 
    // але якщо її немає — залишаємо 'dark'
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  const toggleTheme = (event) => {
    const x = event.clientX;
    const y = event.clientY;
    
    // Розраховуємо кінцевий радіус для кругової маски
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const isDarkMode = theme === 'dark';

    // Додаємо клас для відключення переходів
    document.documentElement.classList.add('theme-transitioning');

    // Якщо View Transitions API не підтримується
    if (!document.startViewTransition) {
      setTheme(isDarkMode ? 'light' : 'dark');
      document.documentElement.classList.remove('theme-transitioning');
      return;
    }

    // Викликаємо перехід
    const transition = document.startViewTransition(() => {
      setTheme(isDarkMode ? 'light' : 'dark');
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      document.documentElement.animate(
        {
          clipPath: clipPath,
        },
        {
          duration: 400, // Трохи швидше для миттєвого відгуку
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });

    // Видаляємо клас після завершення анімації
    transition.finished.then(() => {
      document.documentElement.classList.remove('theme-transitioning');
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

```

## frontend\src\index.scss
```scss
@import './styles/_variables.scss';

:root {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  
  color-scheme: dark;
}

/* Disable transitions during theme switching to prevent flickering/lag */
html.theme-transitioning,
html.theme-transitioning * {
  transition: none !important;
}

:root.light-theme {
  color-scheme: light;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background-color: var(--bg-main);
  color: var(--text-main);
  transition: background-color 0.3s ease, color 0.3s ease;
}

#root {
  width: 100%;
}

a {
  text-decoration: none;
  color: inherit;
  transition: opacity 0.2s, color 0.2s;
}

a:hover {
  opacity: 0.8;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: var(--bg-main);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}


```

## frontend\src\main.jsx
```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './index.scss'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)

```

## frontend\src\pages\Admin\AdminPanel.jsx
```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus, FiArrowLeft, FiLayout, FiDatabase, FiSearch } from 'react-icons/fi';
import Header from '../../components/Header';
import styles from './AdminPanel.module.scss';

const API_BASE = 'http://localhost:5000';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'titles', 'news'
  
  // States для управління головною
  const [sections, setSections] = useState([]);
  const [addMangaId, setAddMangaId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('new_releases');
  
  // States для управління тайтлами
  const [allMangas, setAllMangas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // States для новин
  const [newsData, setNewsData] = useState({ title: '', content: '', category: 'Інше' });
  
  // Toast Notification System
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showStatus = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };
  
  const [isLoading, setIsLoading] = useState(true);

  // Перевірка прав доступу
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      navigate('/');
    }
  }, [navigate]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      
      const [sectionsRes, titlesRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/sections`, { headers }),
        fetch(`${API_BASE}/api/admin/all-titles`, { headers })
      ]);

      const sectionsData = await sectionsRes.json();
      const titlesData = await titlesRes.json();

      if (sectionsData.success) {
        if (sectionsData.data.length === 0) {
           setSections([
             { key: 'new_releases', title: 'Новинки', mangas: [] },
             { key: 'popular', title: 'Найпопулярніші', mangas: [] },
             { key: 'reading_now', title: 'Читають зараз', mangas: [] }
           ]);
        } else {
           setSections(sectionsData.data);
        }
      }
      
      if (titlesData.success) {
        setAllMangas(titlesData.data);
      }
    } catch (err) {
      console.error('Помилка завантаження даних:', err);
      showStatus('Помилка завантаження даних', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handlePublishNews = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(newsData)
      });
      if (response.ok) {
        showStatus('Новину успішно опубліковано!');
        setNewsData({ title: '', content: '', category: 'Інше' });
      } else {
        const data = await response.json();
        showStatus(`Помилка: ${data.error}`, 'error');
      }
    } catch (err) { 
      console.error(err);
      showStatus('Помилка з\'єднання з сервером', 'error');
    }
  };

  const handleUpdateSection = async (sectionKey, action, mangaId) => {
    if (!mangaId) return;

    try {
      const response = await fetch(`${API_BASE}/api/admin/sections/${sectionKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ action, mangaId })
      });

      const data = await response.json();
      if (data.success) {
        setSections(prev => prev.map(s => s.key === sectionKey ? data.data : s));
        if (action === 'add') setAddMangaId('');
        showStatus(action === 'add' ? 'Тайтл додано до секції' : 'Тайтл прибрано з секції');
      } else {
        showStatus(`Помилка: ${data.error}`, 'error');
      }
    } catch (err) {
      showStatus('Помилка оновлення секції', 'error');
    }
  };

  const handleDeleteManga = async (mangaId) => {
    if (!window.confirm('Ви впевнені? Це видалить тайтл та всі його розділи НАЗАВЖДИ!')) return;

    try {
      const response = await fetch(`${API_BASE}/api/admin/manga/${mangaId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        setAllMangas(prev => prev.filter(m => m._id !== mangaId));
        showStatus('Тайтл успішно видалено');
      } else {
        showStatus('Помилка при видаленні', 'error');
      }
    } catch (err) {
      showStatus('Помилка сервера', 'error');
    }
  };

  const filteredMangas = allMangas.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m._id.includes(searchQuery)
  );

  return (
    <div className={styles.adminWrapper}>
      <Header />
      
      <div className={styles.adminContainer}>
        <div className={styles.adminHeader}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <FiArrowLeft size={24} />
          </button>
          <h1>Панель Адміністратора</h1>
        </div>

        <div className={styles.adminTabs}>
          <button className={`${styles.tabBtn} ${activeTab === 'home' ? styles.active : ''}`} onClick={() => setActiveTab('home')}>
            <FiLayout /> Головна сторінка
          </button>
          <button className={`${styles.tabBtn} ${activeTab === 'titles' ? styles.active : ''}`} onClick={() => setActiveTab('titles')}>
            <FiDatabase /> Всі Тайтли
          </button>
          <button className={`${styles.tabBtn} ${activeTab === 'news' ? styles.active : ''}`} onClick={() => setActiveTab('news')}>
            Новини сайту
          </button>
        </div>

        <div className={styles.adminContent}>
          {isLoading ? (
            <div className={styles.loading}>Завантаження даних...</div>
          ) : (
            <>
              {activeTab === 'home' && (
                <div className={styles.sectionsManager}>
                  <div className={styles.globalAddAction}>
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={styles.categorySelect}>
                      <option value="new_releases">Новинки</option>
                      <option value="popular">Найпопулярніші</option>
                      <option value="reading_now">Читають зараз</option>
                      <option value="admin_choice">Вибір адміна</option>
                    </select>
                    <select value={addMangaId} onChange={(e) => setAddMangaId(e.target.value)} className={styles.addInput}>
                      <option value="">-- Оберіть тайтл --</option>
                      {allMangas.map(item => (
                        <option key={item._id} value={item._id}>{item.title} ({item.type || 'Фанфік'})</option>
                      ))}
                    </select>
                    <button className={styles.addBtn} onClick={() => handleUpdateSection(selectedCategory, 'add', addMangaId)}>
                      <FiPlus /> Додати
                    </button>
                  </div>

                  {sections.map(section => (
                    <div key={section.key} className={styles.sectionBlock}>
                      <div className={styles.sectionHeader}>
                        <h2>Секція: {section.title} <span>({section.key})</span></h2>
                      </div>
                      <div className={styles.sectionItems}>
                        {section.mangas && section.mangas.length > 0 ? (
                          section.mangas.map(manga => (
                            <div key={manga._id} className={styles.mangaRow}>
                              <div className={styles.mangaInfo}>
                                <img src={manga.coverImage ? (manga.coverImage.startsWith('http') ? manga.coverImage : `${API_BASE}${manga.coverImage}`) : ''} alt={manga.title} />
                                <div>
                                  <div className={styles.mangaTitle}>{manga.title}</div>
                                  <div className={styles.mangaId}>ID: {manga._id}</div>
                                </div>
                              </div>
                              <button className={styles.removeBtn} onClick={() => handleUpdateSection(section.key, 'remove', manga._id)}>Прибрати</button>
                            </div>
                          ))
                        ) : <p className={styles.emptyText}>Порожньо</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'titles' && (
                <div className={styles.titlesManager}>
                  <div className={styles.searchBar}>
                    <FiSearch className={styles.searchIcon} />
                    <input type="text" placeholder="Пошук..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                  <div className={styles.tableWrapper}>
                    <table className={styles.adminTable}>
                      <thead>
                        <tr><th>Обкладинка</th><th>Назва</th><th>Тип</th><th>Дія</th></tr>
                      </thead>
                      <tbody>
                        {filteredMangas.map(manga => (
                          <tr key={manga._id}>
                            <td><img className={styles.tableImg} src={manga.coverImage ? (manga.coverImage.startsWith('http') ? manga.coverImage : `${API_BASE}${manga.coverImage}`) : ''} alt="" /></td>
                            <td className={styles.primaryText}>{manga.title}</td>
                            <td>{manga.type || 'Фанфік'}</td>
                            <td>
                              <button className={styles.editBtn} onClick={() => navigate(`/edit-manga/${manga._id}`)}>⚙️</button>
                              <button className={styles.deleteBtn} onClick={() => handleDeleteManga(manga._id)}><FiTrash2 /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'news' && (
                <div className={styles.newsManager}>
                  <h2>Опублікувати новину</h2>
                  <div className={styles.newsForm}>
                    <input type="text" placeholder="Заголовок" value={newsData.title} onChange={e => setNewsData({...newsData, title: e.target.value})} className={styles.newsInput} />
                    <select value={newsData.category} onChange={e => setNewsData({...newsData, category: e.target.value})} className={styles.newsInput} style={{ marginBottom: '15px' }}>
                      <option value="Системні">Системні</option>
                      <option value="Оновлення">Оновлення</option>
                      <option value="Важливе">Важливе</option>
                      <option value="Інше">Інше</option>
                    </select>
                    <textarea placeholder="Текст..." rows="5" value={newsData.content} onChange={e => setNewsData({...newsData, content: e.target.value})} className={styles.newsTextarea}></textarea>
                    <button onClick={handlePublishNews} className={styles.addBtn} style={{ background: '#ff4757', color: 'white', fontWeight: 'bold' }}>Опублікувати</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      <div className={`${styles.toast} ${toast.show ? styles.show : ''} ${toast.type === 'error' ? styles.errorToast : ''}`}>
        <div className={styles.toastContent}>
          {toast.type === 'success' ? '✅' : '❌'}
          <span>{toast.message}</span>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

```

## frontend\src\pages\Admin\AdminPanel.module.scss
```scss
@import '../../styles/variables';

.adminWrapper {
  min-height: 100vh;
  background-color: var(--bg-main);
  color: var(--text-main);
}

.adminContainer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.adminHeader {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 30px;

  h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 800;
  }

  .backBtn {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border-radius: 50%;
    transition: all 0.2s;

    &:hover {
      background: var(--bg-card);
      color: var(--text-main);
    }
  }
}

.adminTabs {
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1px;

  .tabBtn {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 1rem;
    font-weight: 600;
    padding: 12px 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    margin-bottom: -1px;

    &:hover {
      color: var(--text-main);
    }

    &.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
    }
  }
}

.adminContent {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: 24px;
  min-height: 400px;
}

.loading {
  text-align: center;
  padding: 50px;
  color: var(--text-muted);
}

.emptyText {
  color: var(--text-muted);
  font-style: italic;
}

/* Секції Головної */
.sectionsManager {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.sectionBlock {
  background: var(--bg-main);
  border-radius: var(--border-radius-md);
  padding: 20px;
  border: 1px solid var(--border-color);
}

.sectionHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;

  h2 {
    margin: 0;
    font-size: 1.25rem;
    
    span {
      color: var(--text-muted);
      font-weight: 400;
      font-size: 0.9rem;
    }
  }
}

.globalAddAction {
  display: flex;
  gap: 12px;
  background: var(--bg-main);
  padding: 20px;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
  align-items: center;

  .categorySelect, .addInput {
    padding: 10px 14px;
    border-radius: var(--border-radius-sm);
    border: 1px solid var(--border-color);
    background: var(--bg-card);
    color: var(--text-main);
    outline: none;
    font-size: 1rem;

    &:focus {
      border-color: var(--primary-color);
    }
  }

  .addInput {
    width: 300px;
  }

  .addBtn {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: var(--border-radius-sm);
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.9;
    }
  }
}

.sectionItems {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mangaRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-card);
  padding: 12px;
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color);

  .mangaInfo {
    display: flex;
    align-items: center;
    gap: 16px;

    img {
      width: 40px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
    }

    .mangaTitle {
      font-weight: 600;
      color: var(--text-main);
    }

    .mangaId {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 4px;
      font-family: monospace;
    }
  }

  .removeBtn {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid transparent;
    padding: 6px 12px;
    border-radius: var(--border-radius-sm);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #ef4444;
      color: white;
    }
  }
}

/* Всі Тайтли */
.titlesManager {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.searchBar {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-main);
  padding: 12px 16px;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);

  .searchIcon {
    color: var(--text-muted);
  }

  input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--text-main);
    font-size: 1rem;
    outline: none;
  }
}

.tableWrapper {
  overflow-x: auto;
}

.adminTable {
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  th, td {
    padding: 16px;
    border-bottom: 1px solid var(--border-color);
  }

  th {
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    font-size: 0.85rem;
    background: var(--bg-main);
  }

  .tableImg {
    width: 40px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
  }

  .primaryText {
    font-weight: 600;
  }

  .mutedText {
    color: var(--text-muted);
    font-family: monospace;
    font-size: 0.9rem;
  }

  .deleteBtn {
    background: none;
    border: 1px solid #ef4444;
    color: #ef4444;
    padding: 6px 12px;
    border-radius: var(--border-radius-sm);
    font-size: 0.85rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;

    &:hover {
      background: #ef4444;
      color: white;
    }
  }

  .editBtn {
    background: none;
    border: 1px solid #3b82f6;
    color: #3b82f6;
    padding: 6px 12px;
    border-radius: var(--border-radius-sm);
    font-size: 0.85rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
    margin-right: 8px;

    &:hover {
      background: #3b82f6;
      color: white;
    }
  }
}

/* Новини */
.newsManager {
  display: flex;
  flex-direction: column;
  gap: 20px;

  h2 {
    margin: 0;
  }
}

.newsForm {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
  background: var(--bg-main);
  padding: 24px;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);

  .newsInput, .newsTextarea {
    width: 100%;
    padding: 12px 16px;
    border-radius: var(--border-radius-sm);
    border: 1px solid var(--border-color);
    background: var(--bg-card);
    color: var(--text-main);
    font-size: 1rem;
    outline: none;

    &:focus {
      border-color: var(--primary-color);
    }
  }

  .newsTextarea {
    resize: vertical;
    min-height: 120px;
  }
}

/* Toast Notification */
.toast {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: #2ecc71;
  color: white;
  padding: 16px 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  z-index: 9999;
  transform: translateY(100px);
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  pointer-events: none;
  font-weight: 600;

  &.show {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }

  &.errorToast {
    background: #ef4444;
  }
}

.toastContent {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1rem;
}

@media (max-width: 600px) {
  .toast {
    bottom: 20px;
    right: 20px;
    left: 20px;
    justify-content: center;
  }
}

```

## frontend\src\pages\Authors\Authors.jsx
```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import styles from './Authors.module.scss';

const Authors = () => {
  const navigate = useNavigate();
  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/authors');
        const data = await response.json();
        if (data.success) {
          setAuthors(data.data);
        }
      } catch (err) {
        console.error('Помилка завантаження авторів:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuthors();
  }, []);

  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Давно';
    const diff = Date.now() - new Date(dateString).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 1) return 'Сьогодні';
    if (days < 30) return `${days} дн. тому`;
    return new Date(dateString).toLocaleDateString('uk-UA');
  };

  return (
    <div className={styles.authorsPage}>
      <Header />
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>Наші автори</h1>
          <p className={styles.subtitle}>Творці неймовірних історій у спільноті StoryFlow</p>
        </header>

        <div className={styles.authorsList}>
          {!isLoading ? (
            authors.length > 0 ? (
              authors.map(author => (
                <div 
                  key={author._id} 
                  className={styles.authorCard}
                  onClick={() => navigate(`/profile/${author.username}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.cardMain}>
                    <div className={styles.avatarWrapper}>
                      {author.avatar ? (
                        <img src={author.avatar} alt={author.username} className={styles.avatar} />
                      ) : (
                        <div className={styles.avatarPlaceholder}>{author.username.charAt(0)}</div>
                      )}
                    </div>
                    
                    <div className={styles.info}>
                      <div className={styles.titleRow}>
                        <h3 className={styles.authorName}>{author.username}</h3>
                      </div>
                      
                      <div className={styles.meta}>
                        <span className={styles.badge}>Автор</span>
                        <span className={styles.stats}>
                          {author.titlesCount} тайтлів
                        </span>
                      </div>
                    </div>
                    
                    <div className={styles.timeInfo}>
                      <span className={styles.time}>На сайті з {new Date(author.createdAt).toLocaleDateString('uk-UA')}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.empty}>Список авторів порожній.</div>
            )
          ) : (
            <div className={styles.loading}>Завантаження...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Authors;

```

## frontend\src\pages\Authors\Authors.module.scss
```scss
@import '../../styles/variables';

.authorsPage {
  min-height: 100vh;
  background-color: var(--bg-main);
  color: var(--text-main);
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

.pageHeader {
  margin-bottom: 40px;
  text-align: center;
}

.title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 8px;
  color: var(--text-main);
}

.subtitle {
  color: var(--text-muted);
  font-size: 1.1rem;
}

.authorsList {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.authorCard {
  background-color: var(--bg-card);
  border-radius: var(--border-radius-lg);
  padding: 20px 24px;
  border: 1px solid var(--border-color);
  transition: transform 0.2s, border-color 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateX(5px);
    border-color: var(--primary-color);
  }
}

.cardMain {
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

.avatarWrapper {
  margin-right: 20px;
  
  .avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--border-color);
  }

  .avatarPlaceholder {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: var(--secondary-color);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
    border: 2px solid var(--border-color);
  }
}

.info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.titleRow {
  display: flex;
  align-items: center;
  gap: 12px;
}

.authorName {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-main);
}

.meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.badge {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--text-muted);
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stats {
  color: var(--primary-color);
  font-weight: 600;
  font-size: 0.95rem;
}

.timeInfo {
  text-align: right;

  @media (max-width: 600px) {
    text-align: left;
  }
}

.time {
  font-size: 0.9rem;
  color: var(--text-muted);
  font-weight: 500;
}

.empty, .loading {
  text-align: center;
  padding: 60px 0;
  color: var(--text-muted);
  font-size: 1.2rem;
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  border: 1px dashed var(--border-color);
}

```

## frontend\src\pages\AuthSuccess.jsx
```javascript
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Зберігаємо токен у localStorage
      localStorage.setItem('token', token);
      
      // Запитуємо дані користувача з бекенду
      fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem('user', JSON.stringify(data.user));
          // Редіректимо на головну
          window.location.href = '/';
        } else {
          window.location.href = '/?auth_error=true';
        }
      })
      .catch(() => {
        window.location.href = '/?auth_error=true';
      });
    } else {
      // Якщо токена немає, повертаємо на логін з помилкою
      window.location.href = '/?auth_error=true';
    }
  }, [searchParams]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#121212',
      color: '#fff',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div className="loader"></div> {/* Можна додати стилізований лоадер */}
      <h2>Авторизація успішна...</h2>
      <p>Зачекайте, ми перенаправляємо вас на головну сторінку.</p>
    </div>
  );
};

export default AuthSuccess;

```

## frontend\src\pages\Catalog.jsx
```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiX, FiChevronDown, FiStar, FiArrowLeft, FiSliders } from 'react-icons/fi';
import Header from '../components/Header';
import styles from './Catalog.module.scss';

const TYPE_MAP = {
  'manga': 'Манґа',
  'manhwa': 'Манхва',
  'manhua': 'Маньхуа',
  'comics': 'Комікс',
  'fanfic': 'Література/Фанфік'
};

const REVERSE_TYPE_MAP = {
  'Манґа': 'manga',
  'Манхва': 'manhwa',
  'Маньхуа': 'manhua',
  'Комікс': 'comics',
  'Література/Фанфік': 'fanfic'
};

const GENRES = ['Бойовик', 'Пригоди', 'Комедія', 'Драма', 'Фентезі', 'Жахи', 'Містика', 'Романтика', 'Психологія', 'Наукова фантастика', 'Повсякденність', 'Трагедія', 'Надприродне', 'Екшн', 'Військове'];

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [catalog, setCatalog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFormat, setActiveFormat] = useState('Всі');
  
  // Ініціалізація статусів з URL
  const initialStatus = searchParams.get('status');
  const [activeStatuses, setActiveStatuses] = useState(initialStatus ? (initialStatus === 'reading' ? ['Онґоінґ'] : [initialStatus]) : []);
  
  const [activeGenres, setActiveGenres] = useState([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCatalog = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (activeFormat !== 'Всі') params.append('format', activeFormat);
        if (activeGenres.length > 0) params.append('genres', activeGenres.join(','));
        if (activeStatuses.length > 0) params.append('status', activeStatuses.join(','));

        const response = await fetch(`http://localhost:5000/api/manga/catalog?${params.toString()}`);
        const data = await response.json();
        if (data.success) {
          setCatalog(data.data);
        }
      } catch (error) {
        console.error('Помилка завантаження каталогу:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalog();
  }, [activeFormat, activeGenres, activeStatuses]);

  // Синхронізація стейту з URL-параметрами
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam && TYPE_MAP[typeParam]) {
      setActiveFormat(TYPE_MAP[typeParam]);
    }
  }, [searchParams]);

  const handleFormatChange = (format) => {
    setActiveFormat(format);
    const newParams = new URLSearchParams(searchParams);
    if (format === 'Всі') {
      newParams.delete('type');
    } else {
      newParams.set('type', REVERSE_TYPE_MAP[format]);
    }
    setSearchParams(newParams);
  };

  const handleStatusChange = (status) => {
    if (activeStatuses.includes(status)) {
      setActiveStatuses(activeStatuses.filter(s => s !== status));
    } else {
      setActiveStatuses([...activeStatuses, status]);
    }
  };

  const handleGenreToggle = (genre) => {
    if (activeGenres.includes(genre)) {
      setActiveGenres(activeGenres.filter(g => g !== genre));
    } else {
      setActiveGenres([...activeGenres, genre]);
    }
  };

  const resetFilters = () => {
    setActiveFormat('Всі');
    setActiveStatuses([]);
    setActiveGenres([]);
    setSearchParams({});
  };

  const applyMobileFilters = () => {
    setIsMobileFiltersOpen(false);
  };

  return (
    <div className={`${styles.catalogWrapper} ${isMobileFiltersOpen ? styles.noScroll : ''}`}>
      <Header />
      
      <div className={styles.container}>
        {/* КАТАЛОГ HEADER (Тільки для мобільних) */}
        <div className={styles.mobileActions}>
          <button className={styles.backBtn} onClick={() => navigate('/')}>
            <FiArrowLeft size={24} />
          </button>
          <div className={styles.mobileTitle}>Каталог</div>
          <button 
            className={styles.mobileFilterToggle} 
            onClick={() => setIsMobileFiltersOpen(true)}
          >
            <FiSliders size={20} />
          </button>
        </div>

        {/* ЛІВА ЧАСТИНА: Сітка тайтлів (75%) */}
        <main className={styles.mainContent}>
          <div className={styles.catalogHeader}>
            <h1 className={`${styles.pageTitle} ${styles.desktopOnly}`}>Каталог творів</h1>
            <span className={styles.resultsCount}>
              {isLoading ? 'Завантаження...' : `Знайдено: ${catalog.length}`}
            </span>
          </div>

          <div className={styles.catalogGrid}>
            {!isLoading && catalog.map((item) => (
              <div 
                key={item._id} 
                className={styles.mangaCard}
                onClick={() => navigate(`/manga/${item._id}`)}
              >
                <div className={styles.imageWrapper}>
                  <img src={item.coverImage ? (item.coverImage.startsWith('http') ? item.coverImage : `http://localhost:5000${item.coverImage}`) : ''} alt={item.title} />
                  <div className={styles.rating}><FiStar size={12} fill="currentColor" /> {item.averageRating ? item.averageRating.toFixed(1) : '0.0'}</div>
                  <div className={styles.typeBadge}>{item.type || 'Література'}</div>
                </div>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <span className={styles.chapters}>{item.releaseYear || ''} {item.releaseYear && item.status ? '•' : ''} {item.status === 'in_progress' ? 'В процесі' : item.status === 'completed' ? 'Завершено' : item.status}</span>
                </div>
              </div>
            ))}
          </div>

          {!isLoading && catalog.length === 0 && (
            <div className={styles.emptyState}>
              <p>За вашим запитом нічого не знайдено.</p>
              <button onClick={resetFilters} className={styles.resetBtn}>Скинути фільтри</button>
            </div>
          )}
        </main>

        {/* ПРАВА ЧАСТИНА: Фільтри */}
        <aside className={`${styles.sidebar} ${isMobileFiltersOpen ? styles.mobileOpen : ''}`}>
          <div className={styles.overlay} onClick={() => setIsMobileFiltersOpen(false)}></div>
          
          <div className={styles.filterPanel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Фільтри</h2>
              <button className={styles.closeBtn} onClick={() => setIsMobileFiltersOpen(false)}>
                <FiX size={24} />
              </button>
            </div>

            <div className={styles.panelContent}>
              <h2 className={`${styles.filterTitle} ${styles.desktopOnly}`}>Фільтри</h2>
              
              <div className={styles.filterGroup}>
                <h3 className={styles.groupTitle}>Формат</h3>
                <div className={styles.btnGroup}>
                  {['Всі', 'Манґа', 'Манхва', 'Маньхуа', 'Комікс', 'Література/Фанфік'].map(format => (
                    <button 
                      key={format}
                      className={`${styles.filterBtn} ${activeFormat === format ? styles.active : ''}`}
                      onClick={() => handleFormatChange(format)}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.filterGroup}>
                <h3 className={styles.groupTitle}>Жанри</h3>
                <div className={styles.genreGrid}>
                  {GENRES.map(genre => (
                    <button 
                      key={genre}
                      className={`${styles.genreBtn} ${activeGenres.includes(genre) ? styles.active : ''}`}
                      onClick={() => handleGenreToggle(genre)}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.filterGroup}>
                <h3 className={styles.groupTitle}>Статус</h3>
                <div className={styles.checkboxGroup}>
                  {['Онґоінґ', 'Завершено', 'Анонс'].map(status => (
                    <label key={status} className={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={activeStatuses.includes(status)}
                        onChange={() => handleStatusChange(status)}
                      /> {status}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.panelFooter}>
              <button className={styles.resetBtn} onClick={resetFilters}>Скинути</button>
              <button className={styles.applyBtn} onClick={applyMobileFilters}>Застосувати</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Catalog;

```

## frontend\src\pages\Catalog.module.scss
```scss
@import '../styles/variables';

.catalogWrapper {
  min-height: 100vh;
  background-color: var(--bg-main);
  color: var(--text-main);

  &.noScroll {
    overflow: hidden;
    height: 100vh;
  }
}

.container {
  display: flex;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 12px 0; /* Vertical padding only, items will use their own px */
  }
}

/* MOBILE ACTIONS HEADER */
.mobileActions {
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px 12px;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 16px;
  }
}

.backBtn {
  background: none;
  border: none;
  color: var(--text-main);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.mobileTitle {
  font-size: 1.2rem;
  font-weight: 700;
}

.mobileFilterToggle {
  background: var(--bg-sidebar);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:active {
    background-color: var(--primary-color);
    color: white;
  }
}

.mainContent {
  flex: 0 0 75%;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 768px) {
    flex: 0 0 100%;
    padding: 0 16px;
  }
}

.catalogHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 12px;

  @media (max-width: 768px) {
    border: none;
    padding-bottom: 0;
  }
}

.pageTitle {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-main);
}

.resultsCount {
  color: var(--text-muted);
  font-weight: 500;
  font-size: 0.9rem;
}

.desktopOnly {
  @media (max-width: 768px) {
    display: none !important;
  }
}

/* Сітка тайтлів */
.catalogGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
}

.mangaCard {
  cursor: pointer;
  transition: transform var(--transition-speed) ease;

  &:hover {
    transform: translateY(-4px);
    
    .cardTitle {
      color: var(--primary-color);
    }
  }
}

.imageWrapper {
  position: relative;
  aspect-ratio: 2/3;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  margin-bottom: 12px;
  background-color: var(--bg-card);
  box-shadow: var(--shadow-main);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.textCover {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  text-align: center;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text-main);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
}

.rating {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: #ffcc00;
  padding: 4px 6px;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  font-weight: bold;
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  gap: 4px;
}

.typeBadge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: var(--primary-color);
  color: white;
  padding: 4px 8px;
  border-radius: var(--border-radius-sm);
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
}

.cardInfo {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cardTitle {
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s;
}

.chapters {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* OFF-CANVAS SIDEBAR (MOBILE) */
.sidebar {
  flex: 0 0 25%;

  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 2000;
    visibility: hidden;
    transition: visibility 0.3s;

    &.mobileOpen {
      visibility: visible;

      .overlay {
        opacity: 1;
      }

      .filterPanel {
        transform: translateX(0);
      }
    }
  }
}

.overlay {
  display: none;
  @media (max-width: 768px) {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    opacity: 0;
    transition: opacity 0.3s;
  }
}

.filterPanel {
  background-color: var(--bg-card);
  border-radius: var(--border-radius-lg);
  padding: 24px;
  position: sticky;
  top: 88px;

  @media (max-width: 768px) {
    position: absolute;
    top: 0;
    right: 0;
    width: 85%;
    max-width: 340px;
    height: 100%;
    border-radius: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
  }
}

.panelHeader {
  display: none;
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px solid var(--border-color);
  }
}

.panelTitle {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.closeBtn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
}

.panelContent {
  @media (max-width: 768px) {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }
}

.panelFooter {
  display: none;
  @media (max-width: 768px) {
    display: flex;
    gap: 12px;
    padding: 20px;
    border-top: 1px solid var(--border-color);
    background-color: var(--bg-card);
  }
}

.filterTitle {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: var(--text-main);
  border-left: 4px solid var(--primary-color);
  padding-left: 12px;
}

.filterGroup {
  margin-bottom: 24px;
}

.groupTitle {
  font-size: 0.9rem;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.btnGroup {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.genreGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.genreBtn {
  background: var(--bg-sidebar);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    border-color: var(--primary-color);
    background-color: var(--primary-light);
    color: var(--primary-color);
  }

  &.active {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
  }
}

.filterBtn {
  background: var(--secondary-color);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--border-color);
  }

  &.active {
    background: var(--primary-color);
    color: white;
    font-weight: 600;
    border-color: var(--primary-color);
  }
}

.checkboxGroup {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.checkboxLabel {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1rem;
  color: var(--text-main);
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: var(--primary-color);
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: var(--primary-color);
    cursor: pointer;
  }
}

.resetBtn {
  flex: 1;
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 12px;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
}

.applyBtn {
  flex: 2;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px;
  border-radius: var(--border-radius-md);
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
}

```

## frontend\src\pages\CreateManga\CreateManga.jsx
```javascript
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import { FiUpload, FiX, FiCheck, FiArrowLeft, FiImage } from 'react-icons/fi';
import styles from './CreateManga.module.scss';

const CreateManga = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // States for Image Previews
  const [preview, setPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  // States for Cropper
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropType, setCropType] = useState(null); // 'cover' | 'banner'

  const [formData, setFormData] = useState({
    title: '',
    alternativeTitle: '',
    description: '',
    type: 'Манґа',
    status: 'Анонс',
    releaseYear: new Date().getFullYear(),
    genres: [],
    coverImage: null,
    bannerImage: null
  });

  const types = ['Манґа', 'Манхва', 'Маньхуа', 'Комікс'];
  const statuses = ['Анонс', 'В процесі', 'Завершено', 'Призупинено'];
  const availableGenres = [
    'Бойовик', 'Пригоди', 'Комедія', 'Драма', 'Фентезі', 
    'Жахи', 'Містика', 'Романтика', 'Психологія', 'Наукова фантастика',
    'Повсякденність', 'Трагедія', 'Надприродне', 'Екшн', 'Військове'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenreToggle = (genre) => {
    setFormData(prev => {
      const isSelected = prev.genres.includes(genre);
      return {
        ...prev,
        genres: isSelected 
          ? prev.genres.filter(g => g !== genre) 
          : [...prev.genres, genre]
      };
    });
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  };

  const handleCropConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const previewUrl = URL.createObjectURL(croppedBlob);
      
      if (cropType === 'cover') {
        setFormData(prev => ({ ...prev, coverImage: croppedBlob }));
        setPreview(previewUrl);
      } else if (cropType === 'banner') {
        setFormData(prev => ({ ...prev, bannerImage: croppedBlob }));
        setBannerPreview(previewUrl);
      }
      
      setImageSrc(null);
      setCropType(null);
    } catch (e) {
      console.error("Помилка обрізки зображення:", e);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result);
        setCropType(type);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = ''; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.genres.length === 0) {
      setError('Будь ласка, оберіть принаймні один жанр');
      return;
    }

    if (!formData.coverImage) {
      setError('Будь ласка, завантажте обкладинку');
      return;
    }

    setIsLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('alternativeTitle', formData.alternativeTitle);
    data.append('description', formData.description);
    data.append('type', formData.type);
    data.append('status', formData.status);
    data.append('genres', formData.genres.join(','));
    data.append('releaseYear', formData.releaseYear);
    
    // Append Blobs as files
    if (formData.coverImage) {
      data.append('coverImage', formData.coverImage, 'cover.jpg');
    }
    if (formData.bannerImage) {
      data.append('bannerImage', formData.bannerImage, 'banner.jpg');
    }

    try {
      const response = await fetch('http://localhost:5000/api/manga', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: data
      });

      let result;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        result = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Помилка сервера (${response.status}): ${text.slice(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(result.error || 'Помилка при створенні тайтлу');
      }

      const userData = JSON.parse(localStorage.getItem('user'));
      navigate(`/profile/${userData.username}?tab=my-creations`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <FiArrowLeft size={20} />
          <span>Назад</span>
        </button>
        <h1>Додати новий тайтл</h1>
        <p>Заповніть інформацію про твір. Після створення він потрапить на модерацію.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.bannerUploadSection}>
          <div className={styles.bannerPreview} style={{ backgroundImage: bannerPreview ? `url(${bannerPreview})` : 'none' }}>
            {!bannerPreview && (
              <div className={styles.bannerPlaceholder}>
                <FiImage size={48} />
                <span>Завантажити банер (опціонально)</span>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleFileChange(e, 'banner')} 
              className={styles.bannerInput}
              id="bannerUpload"
            />
            {bannerPreview && (
              <label htmlFor="bannerUpload" className={styles.bannerLabel}>
                Змінити банер
              </label>
            )}
          </div>
          <p className={styles.uploadHint}>Рекомендований розмір: 1920x400px. Буде відображатися на сторінці тайтлу.</p>
        </div>

        <div className={styles.mainLayout}>
          <div className={styles.leftColumn}>
            <div className={styles.uploadSection}>
              <div className={styles.imagePreview} style={{ backgroundImage: preview ? `url(${preview})` : 'none' }}>
                {!preview && <FiUpload size={48} className={styles.uploadIcon} />}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, 'cover')} 
                  className={styles.fileInput}
                  id="coverUpload"
                />
                <label htmlFor="coverUpload" className={styles.uploadLabel}>
                  {preview ? 'Змінити обкладинку' : 'Завантажити обкладинку'}
                </label>
              </div>
              <p className={styles.uploadHint}>Рекомендований розмір: 600x900px. До 5MB.</p>
            </div>
          </div>
          
          {/* Rest of the form... */}
          <div className={styles.rightColumn}>
            <div className={styles.formGroup}>
              <label>Назва твору *</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleInputChange} 
                placeholder="Введіть назву (наприклад: Атака Титанів)"
                required 
              />
            </div>

            <div className={styles.formGroup}>
              <label>Альтернативна назва</label>
              <input 
                type="text" 
                name="alternativeTitle" 
                value={formData.alternativeTitle} 
                onChange={handleInputChange} 
                placeholder="Наприклад: Shingeki no Kyojin"
              />
            </div>

            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label>Тип *</label>
                <select name="type" value={formData.type} onChange={handleInputChange}>
                  {types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Статус *</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Рік випуску *</label>
                <input 
                  type="number" 
                  name="releaseYear" 
                  value={formData.releaseYear} 
                  onChange={handleInputChange} 
                  min="1900" 
                  max={new Date().getFullYear() + 1}
                  required 
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Опис *</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                placeholder="Розкажіть про що цей твір..."
                rows="6"
                required 
              ></textarea>
            </div>

            <div className={styles.formGroup}>
              <label>Жанри * (оберіть принаймні один)</label>
              <div className={styles.genresGrid}>
                {availableGenres.map(genre => (
                  <button
                    key={genre}
                    type="button"
                    className={`${styles.genreBadge} ${formData.genres.includes(genre) ? styles.activeGenre : ''}`}
                    onClick={() => handleGenreToggle(genre)}
                  >
                    {formData.genres.includes(genre) && <FiCheck className={styles.checkIcon} />}
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.actions}>
              <button 
                type="button" 
                className={styles.cancelBtn} 
                onClick={() => navigate(-1)}
                disabled={isLoading}
              >
                Скасувати
              </button>
              <button 
                type="submit" 
                className={styles.submitBtn} 
                disabled={isLoading}
              >
                {isLoading ? 'Зберігання...' : 'Створити тайтл'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* ОВЕРЛЕЙ ОБРІЗКИ (CROPPER) */}
      {imageSrc && (
        <div className={styles.cropperOverlay}>
          <div className={styles.cropperModal}>
            <div className={styles.cropperHeader}>
              <h3>Налаштування {cropType === 'banner' ? 'банеру' : 'обкладинки'}</h3>
            </div>
            <div className={styles.cropperContainer}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={cropType === 'banner' ? 1920 / 400 : 2 / 3}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className={styles.cropperControls}>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(e.target.value)}
                className={styles.zoomSlider}
              />
              <div className={styles.cropperButtons}>
                <button className={styles.cancelBtn} onClick={() => setImageSrc(null)}>Скасувати</button>
                <button className={styles.cropBtn} onClick={handleCropConfirm}>Застосувати</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateManga;


```

## frontend\src\pages\CreateManga\CreateManga.module.scss
```scss
.container {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
}

.header {
  margin-bottom: 32px;
  text-align: center;
  position: relative;

  .backBtn {
    position: absolute;
    left: 0;
    top: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: var(--text-muted);
    font-weight: 600;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: var(--primary-color);
    }

    @media (max-width: 768px) {
      position: static;
      margin-bottom: 16px;
      justify-content: center;
      width: 100%;
    }
  }

  h1 {
    font-size: 2rem;
    color: var(--text-main);
    margin-bottom: 8px;
  }

  p {
    color: var(--text-muted);
  }
}

.form {
  background: var(--bg-card);
  padding: 32px;
  border-radius: 16px;
  box-shadow: var(--shadow-main);
}

.bannerUploadSection {
  margin-bottom: 40px;

  .bannerPreview {
    width: 100%;
    height: 200px;
    background: var(--bg-main);
    border: 2px dashed var(--border-color);
    border-radius: 12px;
    position: relative;
    overflow: hidden;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
      border-color: var(--primary-color);
    }
  }

  .bannerPlaceholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: var(--text-muted);
    font-weight: 600;
  }

  .bannerInput {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 2;
  }

  .bannerLabel {
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    z-index: 1;
    backdrop-filter: blur(4px);
  }
}

.mainLayout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.uploadSection {
  .imagePreview {
    width: 100%;
    aspect-ratio: 2/3;
    background: var(--bg-main);
    border: 2px dashed var(--border-color);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    background-size: cover;
    background-position: center;
    transition: all 0.2s;

    &:hover {
      border-color: var(--primary-color);
    }
  }

  .uploadIcon {
    color: var(--text-muted);
    margin-bottom: 12px;
  }

  .fileInput {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 2;
  }

  .uploadLabel {
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    z-index: 1;
    backdrop-filter: blur(4px);
  }

  .uploadHint {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-top: 12px;
    text-align: center;
  }
}

.formGroup {
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: var(--text-main);
    font-size: 0.95rem;
  }

  input, select, textarea {
    width: 100%;
    padding: 12px 16px;
    background: var(--bg-main);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-main);
    font-size: 1rem;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(255, 71, 87, 0.1);
    }

    &::placeholder {
      color: var(--text-muted);
    }
  }

  textarea {
    resize: vertical;
  }
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.genresGrid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.genreBadge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--bg-main);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
}

.activeGenre {
  background: var(--primary-color);
  color: white !important;
  border-color: var(--primary-color) !important;
}

.checkIcon {
  font-size: 0.8rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);

  button {
    padding: 12px 32px;
    border-radius: 8px;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cancelBtn {
    background: none;
    border: 1px solid var(--border-color);
    color: var(--text-muted);

    &:hover {
      background: var(--bg-main);
      color: var(--text-main);
    }
  }

  .submitBtn {
    background: var(--primary-color);
    border: none;
    color: white;
    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);

    &:hover {
      opacity: 0.9;
      transform: translateY(-2px);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  }
}

/* ОВЕРЛЕЙ ОБРІЗКИ (CROPPER) */
.cropperOverlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
}

.cropperModal {
  background: var(--bg-modal);
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-main);
  border: 1px solid var(--border-color);
}

.cropperHeader {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  
  h3 {
    margin: 0;
    font-size: 1.2rem;
    color: var(--text-main);
  }
}

.cropperContainer {
  position: relative;
  width: 100%;
  height: 400px;
  background: #000;
}

.cropperControls {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: var(--bg-modal);
  border-top: 1px solid var(--border-color);

  .zoomSlider {
    width: 100%;
    cursor: pointer;
    accent-color: var(--primary-color);
  }

  .cropperButtons {
    display: flex;
    justify-content: flex-end;
    gap: 15px;

    .cancelBtn {
      background: transparent;
      color: var(--text-muted);
      border: 1px solid var(--border-color);
      padding: 10px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;

      &:hover {
        background: var(--secondary-color);
        color: var(--text-main);
      }
    }

    .cropBtn {
      background: var(--primary-color);
      color: #fff;
      border: none;
      padding: 10px 30px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 700;
      transition: all 0.2s;

      &:hover {
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
      }
    }
  }
}

/* CHAPTERS SECTION STYLES */
.chaptersSection {
  margin-top: 48px;
  padding-top: 40px;
  border-top: 2px solid var(--border-color);

  .sectionHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h2 {
      font-size: 1.5rem;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .addChapterBtn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: var(--bg-main);
      border: 1px solid var(--primary-color);
      color: var(--primary-color);
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: var(--primary-color);
        color: white;
        box-shadow: 0 4px 12px rgba(255, 71, 87, 0.2);
      }
    }
  }
}

.chapterForm {
  background: var(--bg-main);
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 32px;
  border: 1px solid var(--border-color);
  animation: slideDown 0.3s ease-out;

  h3 {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 1.1rem;
    color: var(--text-main);
  }

  .chapterRow {
    display: grid;
    grid-template-columns: 150px 1fr;
    gap: 20px;
    margin-bottom: 20px;

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  }

  .saveChapterBtn {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
    margin-top: 10px;

    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
  }
}

.chaptersGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.chapterCard {
  background: var(--bg-main);
  border: 1px solid var(--border-color);
  padding: 16px 20px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary-color);
    transform: translateX(4px);
    background: var(--bg-card);
  }

  .chapterCardInfo {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .chapterCardNumber {
      font-weight: 700;
      color: var(--primary-color);
      font-size: 0.9rem;
    }

    .chapterCardTitle {
      font-weight: 600;
      color: var(--text-main);
      font-size: 1rem;
    }

    .chapterCardPages {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
  }

  .chapterCardActions {
    .deleteBtn {
      background: none;
      border: 1px solid transparent;
      color: var(--text-muted);
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 71, 87, 0.1);
        color: var(--primary-color);
        border-color: rgba(255, 71, 87, 0.2);
      }
    }
  }
}

.emptyText {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
  background: var(--bg-main);
  border-radius: 12px;
  border: 1px dashed var(--border-color);
}

.editTabs {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-color);

  button {
    background: none;
    border: none;
    padding: 12px 8px;
    color: var(--text-muted);
    font-weight: 600;
    cursor: pointer;
    position: relative;
    transition: all 0.2s;

    &.active {
      color: var(--primary-color);

      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--primary-color);
      }
    }

    &:hover:not(.active) {
      color: var(--text-main);
    }
  }
}

.pagesUploadBox {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;

  .hiddenInput {
    display: none;
  }

  .pagesUploadLabel {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-main);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }
  }

  .resetBtn {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 0.9rem;
    text-decoration: underline;
    cursor: pointer;
    
    &:hover {
      color: var(--primary-color);
    }
  }
}

.pagesOrderingGallery {
  margin-bottom: 24px;
  
  .galleryHint {
    font-size: 0.9rem;
    color: var(--text-muted);
    margin-bottom: 16px;
  }

  .pagesGrid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
    background: var(--bg-card);
    padding: 16px;
    border-radius: 12px;
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid var(--border-color);
  }

  .pagePreviewItem {
    aspect-ratio: 2/3;
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.7;
    }

    &:hover {
      img {
        opacity: 1;
      }
    }

    &.selectedPage {
      border-color: var(--primary-color);
      
      img {
        opacity: 1;
      }
    }

    .pageBadge {
      position: absolute;
      top: 8px;
      right: 8px;
      background: var(--primary-color);
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
  }
}

@keyframes popIn {
  from { transform: scale(0); }
  to { transform: scale(1); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}


```

## frontend\src\pages\CreateManga\EditManga.jsx
```javascript
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import { FiUpload, FiX, FiCheck, FiArrowLeft, FiImage, FiPlus, FiBookOpen, FiTrash2 } from 'react-icons/fi';
import NotificationModal from '../../components/NotificationModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import styles from './CreateManga.module.scss';

const EditManga = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  
  const API_BASE = 'http://localhost:5000';

  // States for Image Previews
  const [preview, setPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  // States for Cropper
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropType, setCropType] = useState(null); // 'cover' | 'banner'

  const [formData, setFormData] = useState({
    title: '',
    alternativeTitle: '',
    description: '',
    type: 'Манґа',
    status: 'Анонс',
    releaseYear: new Date().getFullYear(),
    genres: [],
    coverImage: null,
    bannerImage: null
  });

  const types = ['Манґа', 'Манхва', 'Маньхуа', 'Комікс'];
  const statuses = ['Анонс', 'В процесі', 'Завершено', 'Призупинено'];
  const availableGenres = [
    'Бойовик', 'Пригоди', 'Комедія', 'Драма', 'Фентезі', 
    'Жахи', 'Містика', 'Романтика', 'Психологія', 'Наукова фантастика',
    'Повсякденність', 'Трагедія', 'Надприродне', 'Екшн', 'Військове'
  ];

  const [chapters, setChapters] = useState([]);
  const [isChapterFormOpen, setIsChapterFormOpen] = useState(false);
  const [newChapter, setNewChapter] = useState({
    number: '',
    title: '',
  });
  const [localPages, setLocalPages] = useState([]); // { file, preview }
  const [orderedIndices, setOrderedIndices] = useState([]); // indices of localPages in order

  // Modal states
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState(null);

  // Автоматичне встановлення номера наступного розділу
  useEffect(() => {
    if (isChapterFormOpen && !newChapter.number) {
      if (chapters.length > 0) {
        const lastNumber = Math.max(...chapters.map(ch => ch.number));
        setNewChapter(prev => ({ ...prev, number: lastNumber + 1 }));
      } else {
        setNewChapter(prev => ({ ...prev, number: 1 }));
      }
    }
  }, [isChapterFormOpen, chapters, newChapter.number]);

  const fetchChapters = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/chapters/manga/${id}`);
      const data = await res.json();
      if (data.success) {
        setChapters(data.data.sort((a, b) => a.number - b.number));
      }
    } catch (err) {
      console.error('Error fetching chapters:', err);
    }
  }, [id, API_BASE]);

  useEffect(() => {
    const fetchManga = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/manga/${id}`);
        const result = await response.json();
        
        if (result.success) {
          const manga = result.data;
          
          // Перевірка чи це автор (або адмін)
          const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (manga.author._id !== loggedInUser.id && manga.author !== loggedInUser.id && 
              manga.author._id !== loggedInUser._id && manga.author !== loggedInUser._id &&
              loggedInUser.role !== 'admin') {
            navigate('/');
            return;
          }

          setFormData({
            title: manga.title || '',
            alternativeTitle: manga.alternativeTitle || '',
            description: manga.description || '',
            type: manga.type || 'Манґа',
            status: manga.status || 'Анонс',
            releaseYear: manga.releaseYear || new Date().getFullYear(),
            genres: manga.genres || [],
            coverImage: null, // Blobs will be null initially
            bannerImage: null
          });

          if (manga.coverImage) setPreview(`${API_BASE}${manga.coverImage}`);
          if (manga.bannerImage) setBannerPreview(`${API_BASE}${manga.bannerImage}`);
          
          fetchChapters();
        }
      } catch (err) {
        setError('Помилка завантаження даних тайтлу');
      } finally {
        setIsFetching(false);
      }
    };

    fetchManga();
  }, [id, navigate, fetchChapters]);

  const handlePagesFileChange = (e) => {
    const files = Array.from(e.target.files).sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
    const newPages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setLocalPages(prev => {
      const updated = [...prev, ...newPages];
      // Автоматично вибираємо всі сторінки у порядку їх додавання/імен
      setOrderedIndices(updated.map((_, i) => i));
      return updated;
    });
  };

  const togglePageSelection = (index) => {
    setOrderedIndices(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const resetOrder = () => setOrderedIndices([]);

  const handleAddChapter = async (e) => {
    e.preventDefault();
    setError('');

    const chapterNum = Number(newChapter.number);

    if (!newChapter.number || isNaN(chapterNum)) {
      setError('Будь ласка, вкажіть коректний номер розділу');
      return;
    }

    if (chapters.some(ch => ch.number === chapterNum)) {
      setError(`Розділ №${chapterNum} вже існує у цьому тайтлі`);
      return;
    }

    if (localPages.length === 0) {
      setError('Будь ласка, завантажте сторінки розділу');
      return;
    }

    if (orderedIndices.length !== localPages.length) {
      setError(`Ви обрали лише ${orderedIndices.length} з ${localPages.length} сторінок. Будь ласка, оберіть усі сторінки у потрібному порядку або скиньте порядок.`);
      return;
    }

    setIsLoading(true);

    try {
      const data = new FormData();
      data.append('mangaId', id);
      data.append('number', Number(newChapter.number));
      data.append('title', newChapter.title);
      
      // Append files in the specific order chosen by the user
      orderedIndices.forEach((idx) => {
        data.append('pages', localPages[idx].file);
      });

      const response = await fetch(`${API_BASE}/api/chapters`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: data
      });

      const result = await response.json();
      console.log('Додавання розділу результат:', result);

      if (result.success) {
        setNotifyMessage(`Розділ №${newChapter.number} успішно додано`);
        setIsNotifyOpen(true);
        setNewChapter({ number: '', title: '' });
        setLocalPages([]);
        setOrderedIndices([]);
        setIsChapterFormOpen(false);
        await fetchChapters();
      } else {
        setError(result.error || 'Помилка при додаванні розділу');
        console.error('Помилка додавання розділу:', result.error);
      }
    } catch (err) {
      setError('Помилка з\'єднання з сервером');
      console.error('Помилка fetch додавання розділу:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChapter = async () => {
    if (!chapterToDelete) return;
    setIsConfirmOpen(false);
    try {
      const response = await fetch(`${API_BASE}/api/chapters/${chapterToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setNotifyMessage('Розділ успішно видалено');
        setIsNotifyOpen(true);
        fetchChapters();
      } else {
        setNotifyMessage('Помилка при видаленні розділу');
        setIsNotifyOpen(true);
      }
    } catch (err) {
      setNotifyMessage('Помилка з\'єднання з сервером');
      setIsNotifyOpen(true);
    } finally {
      setChapterToDelete(null);
    }
  };

  const openDeleteConfirm = (chapterId) => {
    setChapterToDelete(chapterId);
    setIsConfirmOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenreToggle = (genre) => {
    setFormData(prev => {
      const isSelected = prev.genres.includes(genre);
      return {
        ...prev,
        genres: isSelected 
          ? prev.genres.filter(g => g !== genre) 
          : [...prev.genres, genre]
      };
    });
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  };

  const handleCropConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const previewUrl = URL.createObjectURL(croppedBlob);
      
      if (cropType === 'cover') {
        setFormData(prev => ({ ...prev, coverImage: croppedBlob }));
        setPreview(previewUrl);
      } else if (cropType === 'banner') {
        setFormData(prev => ({ ...prev, bannerImage: croppedBlob }));
        setBannerPreview(previewUrl);
      }
      
      setImageSrc(null);
      setCropType(null);
    } catch (e) {
      console.error("Помилка обрізки зображення:", e);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result);
        setCropType(type);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = ''; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.genres.length === 0) {
      setError('Будь ласка, оберіть принаймні один жанр');
      return;
    }

    setIsLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('alternativeTitle', formData.alternativeTitle);
    data.append('description', formData.description);
    data.append('type', formData.type);
    data.append('status', formData.status);
    data.append('genres', formData.genres.join(','));
    data.append('releaseYear', formData.releaseYear);
    
    if (formData.coverImage) {
      data.append('coverImage', formData.coverImage, 'cover.jpg');
    }
    if (formData.bannerImage) {
      data.append('bannerImage', formData.bannerImage, 'banner.jpg');
    }

    try {
      const response = await fetch(`${API_BASE}/api/manga/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: data
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Помилка при оновленні тайтлу');
      }

      navigate(`/manga/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div className={styles.loading}>Завантаження...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <FiArrowLeft size={20} />
          <span>Назад</span>
        </button>
        <h1>Редагувати тайтл</h1>
        <p>Оновіть інформацію про твір та керуйте розділами.</p>
      </div>

      <div className={styles.editTabs}>
        <button className={styles.active}>Основна інформація</button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* ... (rest of the form stays mostly same, but I'll add the chapters section after it) */}
        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.bannerUploadSection}>
          <div className={styles.bannerPreview} style={{ backgroundImage: bannerPreview ? `url(${bannerPreview})` : 'none' }}>
            {!bannerPreview && (
              <div className={styles.bannerPlaceholder}>
                <FiImage size={48} />
                <span>Завантажити банер (опціонально)</span>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleFileChange(e, 'banner')} 
              className={styles.bannerInput}
              id="bannerUpload"
            />
            {bannerPreview && (
              <label htmlFor="bannerUpload" className={styles.bannerLabel}>
                Змінити банер
              </label>
            )}
          </div>
        </div>

        <div className={styles.mainLayout}>
          <div className={styles.leftColumn}>
            <div className={styles.uploadSection}>
              <div className={styles.imagePreview} style={{ backgroundImage: preview ? `url(${preview})` : 'none' }}>
                {!preview && <FiUpload size={48} className={styles.uploadIcon} />}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, 'cover')} 
                  className={styles.fileInput}
                  id="coverUpload"
                />
                <label htmlFor="coverUpload" className={styles.uploadLabel}>
                  {preview ? 'Змінити обкладинку' : 'Завантажити обкладинку'}
                </label>
              </div>
            </div>
          </div>
          
          <div className={styles.rightColumn}>
            <div className={styles.formGroup}>
              <label>Назва твору *</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleInputChange} 
                required 
              />
            </div>

            <div className={styles.formGroup}>
              <label>Альтернативна назва</label>
              <input 
                type="text" 
                name="alternativeTitle" 
                value={formData.alternativeTitle} 
                onChange={handleInputChange} 
              />
            </div>

            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label>Тип *</label>
                <select name="type" value={formData.type} onChange={handleInputChange}>
                  {types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Статус *</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Рік випуску *</label>
                <input 
                  type="number" 
                  name="releaseYear" 
                  value={formData.releaseYear} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Опис *</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                rows="6"
                required 
              ></textarea>
            </div>

            <div className={styles.formGroup}>
              <label>Жанри *</label>
              <div className={styles.genresGrid}>
                {availableGenres.map(genre => (
                  <button
                    key={genre}
                    type="button"
                    className={`${styles.genreBadge} ${formData.genres.includes(genre) ? styles.activeGenre : ''}`}
                    onClick={() => handleGenreToggle(genre)}
                  >
                    {formData.genres.includes(genre) && <FiCheck className={styles.checkIcon} />}
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.actions}>
              <button 
                type="button" 
                className={styles.cancelBtn} 
                onClick={() => navigate(-1)}
                disabled={isLoading}
              >
                Скасувати
              </button>
              <button 
                type="submit" 
                className={styles.submitBtn} 
                disabled={isLoading}
              >
                {isLoading ? 'Зберігання...' : 'Оновити тайтл'}
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className={styles.chaptersSection}>
        <div className={styles.sectionHeader}>
          <h2><FiBookOpen /> Розділи ({chapters.length})</h2>
          <button 
            type="button"
            className={styles.addChapterBtn} 
            onClick={() => setIsChapterFormOpen(!isChapterFormOpen)}
          >
            {isChapterFormOpen ? <><FiX /> Закрити</> : <><FiPlus /> Додати розділ</>}
          </button>
        </div>

        {isChapterFormOpen && (
          <div className={styles.chapterForm}>
            <h3>Новий розділ</h3>
            <div className={styles.chapterRow}>
              <div className={styles.formGroup}>
                <label>Номер розділу *</label>
                <input 
                  type="number" 
                  value={newChapter.number} 
                  onChange={(e) => setNewChapter({...newChapter, number: e.target.value})} 
                  placeholder="Напр. 1" 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Назва розділу (опц.)</label>
                <input 
                  type="text" 
                  value={newChapter.title} 
                  onChange={(e) => setNewChapter({...newChapter, title: e.target.value})} 
                  placeholder="Напр. Початок" 
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Завантажити сторінки *</label>
              <div className={styles.pagesUploadBox}>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handlePagesFileChange} 
                  id="pages-upload"
                  className={styles.hiddenInput}
                />
                <label htmlFor="pages-upload" className={styles.pagesUploadLabel}>
                  <FiUpload /> Обрати файли
                </label>
                {localPages.length > 0 && (
                  <button type="button" className={styles.resetBtn} onClick={resetOrder}>
                    Скинути порядок
                  </button>
                )}
              </div>
            </div>

            {localPages.length > 0 && (
              <div className={styles.pagesOrderingGallery}>
                <p className={styles.galleryHint}>Клікніть на сторінки у порядку їх слідування (1, 2, 3...):</p>
                <div className={styles.pagesGrid}>
                  {localPages.map((page, index) => {
                    const orderIndex = orderedIndices.indexOf(index);
                    return (
                      <div 
                        key={index} 
                        className={`${styles.pagePreviewItem} ${orderIndex !== -1 ? styles.selectedPage : ''}`}
                        onClick={() => togglePageSelection(index)}
                      >
                        <img src={page.preview} alt={`Page ${index}`} />
                        {orderIndex !== -1 && (
                          <div className={styles.pageBadge}>{orderIndex + 1}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <button 
              type="button" 
              className={styles.saveChapterBtn} 
              onClick={handleAddChapter}
              disabled={isLoading || orderedIndices.length === 0}
            >
              <FiCheck /> {isLoading ? 'Збереження...' : 'Зберегти розділ'}
            </button>
          </div>
        )}

        <div className={styles.chaptersGrid}>
          {chapters.length > 0 ? (
            chapters.map(ch => (
              <div key={ch._id} className={styles.chapterCard}>
                <div className={styles.chapterCardInfo}>
                  <span className={styles.chapterCardNumber}>Розділ {ch.number}</span>
                  <span className={styles.chapterCardTitle}>{ch.title || 'Без назви'}</span>
                  <span className={styles.chapterCardPages}>{ch.pages?.length || 0} сторінок</span>
                </div>
                <div className={styles.chapterCardActions}>
                  <button 
                    type="button"
                    className={styles.deleteBtn} 
                    onClick={() => openDeleteConfirm(ch._id)}
                    title="Видалити розділ"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyText}>
              <FiBookOpen size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>Розділів ще не додано. Ви можете додати перший розділ вище.</p>
            </div>
          )}
        </div>
      </div>

      {imageSrc && (
        <div className={styles.cropperOverlay}>
          <div className={styles.cropperModal}>
            <div className={styles.cropperHeader}>
              <h3>Налаштування {cropType === 'banner' ? 'банеру' : 'обкладинки'}</h3>
            </div>
            <div className={styles.cropperContainer}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={cropType === 'banner' ? 1920 / 400 : 2 / 3}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className={styles.cropperControls}>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(e.target.value)}
                className={styles.zoomSlider}
              />
              <div className={styles.cropperButtons}>
                <button className={styles.cancelBtn} onClick={() => setImageSrc(null)}>Скасувати</button>
                <button className={styles.cropBtn} onClick={handleCropConfirm}>Застосувати</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <NotificationModal 
        isOpen={isNotifyOpen} 
        message={notifyMessage} 
        onClose={() => setIsNotifyOpen(false)} 
      />

      <ConfirmationModal
        isOpen={isConfirmOpen}
        title="Видалити розділ?"
        message="Ви впевнені, що хочете видалити цей розділ? Всі сторінки будуть видалені назавжди."
        onConfirm={handleDeleteChapter}
        onCancel={() => {
          setIsConfirmOpen(false);
          setChapterToDelete(null);
        }}
      />
    </div>
  );
};

export default EditManga;

```

## frontend\src\pages\Fanfic\CreateFanfic.jsx
```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiBook, FiEdit3, FiFileText, FiAlertCircle, FiPlus, FiTag } from 'react-icons/fi';
import Header from '../../components/Header';
import styles from './Fanfic.module.scss';

const CreateFanfic = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMangaId = searchParams.get('mangaId') || '';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mangas, setMangas] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    manga: initialMangaId,
    genres: [],
    status: 'in_progress',
    direction: 'Джен',
    ageRating: 'PG-13',
    authorNote: ''
  });

  const availableGenres = [
    'Романтика', 'Драма', 'Фентезі', 'Пригоди', 'Комедія', 
    'Містика', 'Жахи', 'Психологія', 'Повсякденність', 'Трагедія',
    'Бойовик', 'Детектив', 'Флафф', 'Ангст', 'AU'
  ];

  const directions = ['Джен', 'Гет', 'Слеш', 'Фемслеш', 'Стаття', 'Змішана'];
  const ageRatings = ['G', 'PG-13', 'R', 'NC-17'];

  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    const fetchMangas = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/manga`);
        const data = await response.json();
        if (data.success) {
          setMangas(Array.isArray(data.data) ? data.data : []);
        }
      } catch (err) {
        console.error('Помилка завантаження фендомів:', err);
      }
    };
    fetchMangas();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenreToggle = (genre) => {
    setFormData(prev => {
      const isSelected = prev.genres.includes(genre);
      return {
        ...prev,
        genres: isSelected 
          ? prev.genres.filter(g => g !== genre) 
          : [...prev.genres, genre]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.genres.length === 0) {
      setError('Будь ласка, оберіть принаймні один жанр для вашого твору');
      return;
    }

    setIsLoading(true);

    // Підготовка даних: якщо manga порожня строка, ставимо null
    const payload = {
      ...formData,
      manga: formData.manga === '' ? null : formData.manga
    };

    try {
      const response = await fetch(`${API_BASE}/api/literature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Помилка при створенні фанфіка');
      }

      navigate(`/fanfic/${result.data._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.fanficPage}>
      <Header />
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            <FiArrowLeft size={18} />
            <span>Повернутися назад</span>
          </button>
          <h1 className={styles.fanficTitle}>Створити новий твір</h1>
          <p style={{color: 'var(--text-muted)', fontSize: '1.1rem'}}>Розкажіть свою унікальну історію всьому світу.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && (
            <div className={styles.errorMessage}>
              <FiAlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Basic Metadata */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <FiEdit3 />
              <span>Основна інформація</span>
            </h3>
            
            <div className={styles.formGroup}>
              <label>Назва твору *</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleInputChange} 
                placeholder="Придумайте яскраву назву..."
                required 
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Фендом / Тайтл</label>
                <select name="manga" value={formData.manga} onChange={handleInputChange}>
                  <option value="">Оригінальний твір (без фендому)</option>
                  {mangas.map(m => (
                    <option key={m._id} value={m._id}>{m.title}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Спрямованість</label>
                <select name="direction" value={formData.direction} onChange={handleInputChange}>
                  {directions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Віковий рейтинг</label>
                <select name="ageRating" value={formData.ageRating} onChange={handleInputChange}>
                  {ageRatings.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Статус</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="in_progress">В процесі (ще пишу)</option>
                  <option value="completed">Завершено (кінець)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Annotation and Notes */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <FiFileText />
              <span>Зміст та примітки</span>
            </h3>
            
            <div className={styles.formGroup}>
              <label>Анотація (Опис) *</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                placeholder="Коротко опишіть, про що ваш твір, щоб зацікавити читачів..."
                required 
              ></textarea>
            </div>

            <div className={styles.formGroup}>
              <label>Примітка автора (необов'язково)</label>
              <textarea 
                name="authorNote" 
                value={formData.authorNote} 
                onChange={handleInputChange} 
                placeholder="Додайте слова від себе перед початком історії..."
                style={{ minHeight: '100px' }}
              ></textarea>
            </div>
          </div>

          {/* Section 3: Genres Selection */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <FiTag />
              <span>Жанри та мітки *</span>
            </h3>
            <div className={styles.checkboxGrid}>
              {availableGenres.map(genre => (
                <label key={genre} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.genres.includes(genre)}
                    onChange={() => handleGenreToggle(genre)}
                  />
                  <span>{genre}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => navigate(-1)}
              disabled={isLoading}
            >
              Скасувати
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
            >
              <FiPlus />
              <span>{isLoading ? 'Створюємо...' : 'Опублікувати шапку'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFanfic;

```

## frontend\src\pages\Fanfic\Fanfic.module.scss
```scss
@import '../../styles/variables';

.fanficPage {
  min-height: 100vh;
  background-color: var(--bg-main);
  color: var(--text-main);
}

.mainContent {
  padding: 40px 0 100px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.breadcrumb {
  margin-bottom: 24px;
}

.backButton {
  background: none;
  border: none;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: color 0.2s;
  padding: 0;

  &:hover {
    color: var(--primary-color);
  }
}

/* HEADER CARD */
.fanficHeaderCard {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: 40px;
  margin-bottom: 40px;
  position: relative;
  box-shadow: var(--shadow-sm);

  @media (max-width: 768px) {
    padding: 24px;
  }
}

.authorActions {
  position: absolute;
  top: 40px;
  right: 40px;
  display: flex;
  gap: 12px;
  z-index: 10;

  @media (max-width: 768px) {
    position: static;
    margin-bottom: 24px;
  }
}

.actionBtnPrimary, .actionBtnSecondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
}

.actionBtnPrimary {
  background: var(--primary-color);
  color: white;

  &:hover {
    box-shadow: 0 4px 12px rgba(255, 140, 0, 0.3);
  }
}

.actionBtnSecondary {
  background: var(--bg-secondary);
  color: var(--text-main);
  border: 1px solid var(--border-color);

  &:hover {
    border-color: var(--text-muted);
  }
}

.deleteAction {
  &:hover {
    background: #ef4444 !important;
    border-color: #ef4444 !important;
    color: white !important;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }
}

.headerInfo {
  margin-bottom: 32px;
  max-width: 75%;

  @media (max-width: 768px) {
    max-width: 100%;
  }
}

.fanficTitle {
  font-size: 2.8rem;
  font-weight: 900;
  margin: 0 0 16px 0;
  line-height: 1.1;
  color: var(--text-main);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
}

.primaryMeta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.authorRow, .fandomRow {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
}

.metaIcon {
  color: var(--primary-color);
}

.authorName, .fandomName {
  font-weight: 700;
  color: var(--text-main);
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: var(--primary-color);
    text-decoration: underline;
  }
}

.officialBadge {
  background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  margin-left: 8px;
  box-shadow: 0 4px 10px rgba(124, 58, 237, 0.3);
}

.fandomLabel {
  color: var(--text-muted);
  font-weight: 500;
}

/* SPECS GRID */
.specsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: 12px;
  margin-bottom: 32px;
  border: 1px solid var(--border-color);
}

.specItem {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.specLabel {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 700;
  letter-spacing: 0.5px;
}

.specValue {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 6px;

  &.in_progress { color: #3b82f6; }
  &.completed { color: #10b981; }
  &.ratingBadge {
    background: #333;
    padding: 2px 8px;
    border-radius: 4px;
    width: fit-content;
  }
}

.likeItem {
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 140, 0, 0.1) !important;
    border-color: var(--primary-color) !important;
  }

  &.liked {
    border-color: var(--primary-color) !important;
    .specValue {
      color: var(--primary-color);
    }
  }
}

/* GENRES */
.genresRow {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 32px;
}

.genreTag {
  background: var(--bg-main);
  color: var(--text-secondary);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid var(--border-color);
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
}

/* CONTENT BLOCKS */
.contentBlocks {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.blockTitle {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0 0 16px 0;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 12px;

  &::before {
    content: '';
    width: 4px;
    height: 18px;
    background: var(--primary-color);
    border-radius: 2px;
  }
}

.blockContent {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--text-secondary);
  white-space: pre-wrap;

  &.authorNote {
    background: rgba(255, 140, 0, 0.05);
    padding: 24px;
    border-radius: 12px;
    border-left: 4px solid var(--primary-color);
    font-style: italic;
  }
}

/* TABS */
.tabsContainer { margin-top: 40px; }
.tabsMenu {
  display: flex;
  gap: 25px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 25px;
  overflow-x: auto;
  
  .tabBtn {
    background: none;
    border: none;
    color: var(--text-muted);
    padding: 12px 0;
    cursor: pointer;
    font-weight: 600;
    position: relative;
    white-space: nowrap;

    &.activeTab {
      color: var(--primary-color);
      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--primary-color);
      }
    }
  }
}

.tabContent {
  animation: fadeIn 0.3s ease;
}

/* CHAPTERS SECTION */
.chaptersWrapper {
  margin-top: 60px;
}

.chaptersHeader {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--border-color);

  h2 {
    font-size: 1.8rem;
    font-weight: 800;
    margin: 0;
  }

  .primaryIcon {
    color: var(--primary-color);
  }

  .chaptersCount {
    background: var(--bg-card);
    color: var(--text-muted);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 700;
  }
}

.chaptersList {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chapterRow {
  background: var(--bg-card);
  padding: 20px 32px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary-color);
    transform: translateX(8px);
    background: var(--bg-secondary);
  }

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 16px 20px;
  }
}

.chapterMain {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chapterNumber {
  font-weight: 800;
  color: var(--primary-color);
  font-size: 1.1rem;
}

.chapterSeparator {
  color: var(--text-muted);
}

.chapterTitle {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text-main);
}

.chapterMeta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 600;
}

.emptyChapters {
  text-align: center;
  padding: 80px 40px;
  background: var(--bg-card);
  border-radius: 16px;
  border: 2px dashed var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

  .emptyIcon {
    color: var(--text-muted);
    opacity: 0.3;
  }

  p {
    color: var(--text-muted);
    font-size: 1.1rem;
  }
}

/* FORM LAYOUTS (Create/Edit) */
.header {
  margin-bottom: 40px;
  
  .fanficTitle {
    font-size: 2.2rem;
    margin-bottom: 8px;
  }
}

.form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.formSection {
  background: var(--bg-card);
  padding: 30px;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sectionTitle {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;

  span {
    color: var(--primary-color);
  }
}

.formRow {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.formGroup {
  display: flex;
  flex-direction: column;
  gap: 10px;

  label {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-secondary);
  }

  input, select, textarea {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    color: var(--text-main);
    padding: 14px 18px;
    border-radius: 10px;
    font-size: 1rem;
    outline: none;
    transition: all 0.2s;
    width: 100%;

    &:focus {
      border-color: var(--primary-color);
      background: var(--bg-card);
      box-shadow: 0 0 0 2px rgba(255, 140, 0, 0.1);
    }
  }

  textarea {
    resize: vertical;
    min-height: 150px;
  }
}

.errorMessage {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 16px 20px;
  border-radius: 10px;
  border: 1px solid rgba(239, 68, 68, 0.2);
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
}

.cancelBtn, .submitBtn {
  padding: 12px 30px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.cancelBtn {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  &:hover { background: var(--bg-secondary); color: white; }
}

.submitBtn {
  background: var(--primary-color);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover { opacity: 0.9; transform: translateY(-2px); }
  &:disabled { background: #555; cursor: not-allowed; transform: none; }
}

/* MODAL */
.modalOverlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal {
  background: var(--bg-card);
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { transform: translateY(40px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modalHeader {
  padding: 24px 32px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 { margin: 0; font-size: 1.6rem; font-weight: 800; }
}

.closeBtn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: var(--bg-secondary);
    color: white;
  }
}

.modalForm {
  padding: 32px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.formHint {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0;
}

.modalActions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding: 24px 32px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-card);
}

/* UTILS */
.loadingWrapper, .errorWrapper {
  padding: 100px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.loader {
  width: 48px;
  height: 48px;
  border: 5px solid var(--bg-card);
  border-bottom-color: var(--primary-color);
  border-radius: 50%;
  animation: rotation 1s linear infinite;
}


.checkboxGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;

  .checkboxLabel {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--text-main);

    input {
      cursor: pointer;
    }
  }
}

.formActions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

```

## frontend\src\pages\Fanfic\FanficDetails.jsx
```javascript
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiBookOpen, 
  FiUser, 
  FiCalendar, 
  FiHeart, 
  FiPlus, 
  FiArrowLeft, 
  FiClock, 
  FiSend, 
  FiX,
  FiFileText,
  FiInfo,
  FiTrash2
} from 'react-icons/fi';
import Header from '../../components/Header';
import InteractionSection from '../../components/InteractionSection';
import styles from './Fanfic.module.scss';

const TABS = [
  { id: 'chapters', label: 'Зміст' },
  { id: 'comments', label: 'Коментарі' },
  { id: 'reviews', label: 'Рецензії' },
  { id: 'discussions', label: 'Обговорення' }
];

const FanficDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fanfic, setFanfic] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState('chapters');

  const [newChapter, setNewChapter] = useState({
    title: '',
    content: '',
    chapterNumber: 1
  });

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const API_BASE = 'http://localhost:5000';
  const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');

  console.log("Дані фанфіка:", fanfic);

  useEffect(() => {
    fetchFanficDetails();
  }, [id]);

  const fetchFanficDetails = async () => {
    setIsLoading(true);
    try {
      const [fanficRes, chaptersRes] = await Promise.all([
        fetch(`${API_BASE}/api/literature/${id}`),
        fetch(`${API_BASE}/api/literature-chapters/literature/${id}`)
      ]);

      const fanficData = await fanficRes.json();
      const chaptersData = await chaptersRes.json();

      if (fanficData.success) {
        setFanfic(fanficData.data);
        setLikeCount(fanficData.data.likes?.length || 0);
        if (loggedInUser) {
          const userId = loggedInUser.id || loggedInUser._id;
          setIsLiked(fanficData.data.likes?.some(uid => String(uid) === String(userId)));
        }
      }
      if (chaptersData.success) {
        setChapters(chaptersData.data);
        setNewChapter(prev => ({ ...prev, chapterNumber: chaptersData.data.length + 1 }));
      }
    } catch (err) {
      console.error('Помилка завантаження фанфіка:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFanfic = async () => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей фанфік?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/literature/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert('Твір успішно видалено');
        navigate('/catalog');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Помилка при видаленні');
      }
    } catch (err) {
      console.error('Помилка видалення фанфіка:', err);
    }
  };

  const handleLike = async () => {
    if (!loggedInUser) {
      alert('Будь ласка, увійдіть, щоб ставити лайки');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/literature/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setIsLiked(data.isLiked);
        setLikeCount(data.data.length);
      }
    } catch (err) {
      console.error('Помилка лайку:', err);
    }
  };

  const handleAddChapter = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/api/literature-chapters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...newChapter,
          literature: id
        })
      });

      const result = await response.json();

      if (response.ok) {
        setChapters([...chapters, result.data]);
        setIsChapterModalOpen(false);
        setNewChapter({ title: '', content: '', chapterNumber: chapters.length + 2 });
      } else {
        alert(result.error || 'Помилка при додаванні розділу');
      }
    } catch (err) {
      console.error('Помилка:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className={styles.loadingWrapper}><div className={styles.loader}></div></div>;
  if (!fanfic) return <div className={styles.errorWrapper}><h2>Твір не знайдено</h2><button onClick={() => navigate(-1)} className={styles.backButton}><FiArrowLeft size={18}/> Повернутись</button></div>;

  const isOwner = loggedInUser && (String(fanfic.author?._id || fanfic.author) === String(loggedInUser.id || loggedInUser._id));
  const isAdmin = loggedInUser && loggedInUser.role === 'admin';

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.fanficPage}>
      <Header />

      <main className={styles.mainContent}>
        <div className={styles.container}>

          {/* NAVIGATION */}
          <div className={styles.breadcrumb}>
            <button className={styles.backButton} onClick={handleBack}>
              <FiArrowLeft size={18} />
              <span>Повернутись назад</span>
            </button>
          </div>

          {/* FANFIC HEADER */}
          <div className={styles.fanficHeaderCard}>

            {/* AUTHOR ACTIONS */}
            {(isOwner || isAdmin) && (
              <div className={styles.authorActions}>
                {isOwner && (
                  <button className={styles.actionBtnPrimary} onClick={() => setIsChapterModalOpen(true)}>
                    <FiPlus size={18} />
                    <span>Додати розділ</span>
                  </button>
                )}
                <button className={`${styles.actionBtnSecondary} ${styles.deleteAction}`} onClick={handleDeleteFanfic}>
                  <FiTrash2 size={18} />
                  <span>Видалити твір</span>
                </button>
              </div>
            )}

            <div className={styles.headerInfo}>
              <h1 className={styles.fanficTitle}>{fanfic.title}</h1>

              <div className={styles.primaryMeta}>
                <div className={styles.authorRow}>
                  <FiUser size={18} className={styles.metaIcon} />
                  <Link to={`/profile/${fanfic.author?.username}`} className={styles.authorName}>
                    {fanfic.author?.username || 'Невідомий автор'}
                  </Link>
                  {fanfic.isOfficial && <span className={styles.officialBadge}>Від автора</span>}
                </div>

                {fanfic.manga && (
                  <div className={styles.fandomRow}>
                    <FiInfo size={18} className={styles.metaIcon} />
                    <span className={styles.fandomLabel}>Фендом:</span>
                    <Link to={`/manga/${fanfic.manga?._id}`} className={styles.fandomName}>
                      {fanfic.manga?.title}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* SPECS GRID */}
            <div className={styles.specsGrid}>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Статус</span>
                <span className={`${styles.specValue} ${styles[fanfic.status]}`}>
                  {fanfic.status === 'in_progress' ? 'В процесі' : 'Завершено'}
                </span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Спрямованість</span>
                <span className={styles.specValue}>{fanfic.direction || 'Джен'}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Рейтинг</span>
                <span className={`${styles.specValue} ${styles.ratingBadge}`}>{fanfic.ageRating || 'PG-13'}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Розділів</span>
                <span className={styles.specValue}>{chapters?.length || 0}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Оновлено</span>
                <span className={styles.specValue}>{fanfic.updatedAt ? new Date(fanfic.updatedAt).toLocaleDateString() : '—'}</span>
              </div>
              <div 
                className={`${styles.specItem} ${styles.likeItem} ${isLiked ? styles.liked : ''}`}
                onClick={handleLike}
              >
                <span className={styles.specLabel}>Вподобань</span>
                <span className={styles.specValue}>
                  <FiHeart size={16} fill={isLiked ? "#ff4d00" : "none"} stroke={isLiked ? "none" : "currentColor"} /> 
                  {likeCount}
                </span>
              </div>
            </div>

            {/* GENRES */}
            <div className={styles.genresRow}>
              {fanfic.genres?.map(genre => (
                <span key={genre} className={styles.genreTag}>{genre}</span>
              ))}
            </div>

            {/* TEXT BLOCKS */}
            <div className={styles.contentBlocks}>
              <div className={styles.block}>
                <h3 className={styles.blockTitle}>Анотація</h3>
                <div className={styles.blockContent}>
                  <p>{fanfic.description}</p>
                </div>
              </div>

              {fanfic.authorNote && (
                <div className={styles.block}>
                  <h3 className={styles.blockTitle}>Примітки автора</h3>
                  <div className={`${styles.blockContent} ${styles.authorNote}`}>
                    <p>{fanfic.authorNote}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* TABS SECTION */}
          <div className={styles.tabsContainer}>
            <div className={styles.tabsMenu}>
              {TABS.map(tab => (
                <button 
                  key={tab.id} 
                  className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`} 
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className={styles.tabContent}>
              {activeTab === 'chapters' && (
                <div className={styles.chaptersWrapper}>
                  <div className={styles.chaptersHeader}>
                    <FiBookOpen size={22} className={styles.primaryIcon} />
                    <h2>Зміст твору</h2>
                    <span className={styles.chaptersCount}>{chapters?.length || 0} розділів</span>
                  </div>

                  <div className={styles.chaptersList}>
                    {chapters?.length > 0 ? (
                      chapters.map((chapter) => (
                        <div 
                          key={chapter._id} 
                          className={styles.chapterRow}
                          onClick={() => navigate(`/fanfic/${id}/read/${chapter._id}`)}
                        >
                          <div className={styles.chapterMain}>
                            <span className={styles.chapterNumber}>Розділ {chapter.chapterNumber}</span>
                            <span className={styles.chapterSeparator}>—</span>
                            <span className={styles.chapterTitle}>{chapter.title}</span>
                          </div>
                          <div className={styles.chapterMeta}>
                            <FiCalendar size={14} />
                            <span>{new Date(chapter.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.emptyChapters}>
                        <FiFileText size={48} className={styles.emptyIcon} />
                        <p>У цього твору ще немає опублікованих розділів.</p>
                        {isOwner && <button onClick={() => setIsChapterModalOpen(true)} className={styles.actionBtnPrimary}>Опублікувати перший розділ</button>}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'comments' && <InteractionSection type="comment" targetId={id} resourceType="Literature" />}
              {activeTab === 'reviews' && <InteractionSection type="review" targetId={id} resourceType="Literature" />}
              {activeTab === 'discussions' && <InteractionSection type="discussion" targetId={id} resourceType="Literature" />}
            </div>
          </div>

        </div>
      </main>

      {/* CREATE CHAPTER MODAL */}
      {isChapterModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsChapterModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Створити новий розділ</h2>
              <button className={styles.closeBtn} onClick={() => setIsChapterModalOpen(false)}>
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleAddChapter} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Назва розділу *</label>
                <input 
                  type="text" 
                  value={newChapter.title} 
                  onChange={e => setNewChapter({...newChapter, title: e.target.value})}
                  placeholder="Наприклад: Початок історії"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Текст твору *</label>
                <textarea 
                  value={newChapter.content} 
                  onChange={e => setNewChapter({...newChapter, content: e.target.value})}
                  placeholder="Пишіть вашу історію тут..."
                  rows="15"
                  required
                ></textarea>
                <p className={styles.formHint}>Використовуйте порожні рядки для поділу на абзаци.</p>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsChapterModalOpen(false)}>
                  Скасувати
                </button>
                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                  {isSubmitting ? 'Публікація...' : (
                    <>
                      <FiSend size={18} />
                      <span>Опублікувати</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FanficDetails;

```

## frontend\src\pages\Fanfic\ReadFanfic.jsx
```javascript
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiList, FiBook } from 'react-icons/fi';
import Header from '../../components/Header';
import styles from './ReadFanfic.module.scss';

const ReadFanfic = () => {
  const { id, chapterId } = useParams();
  const navigate = useNavigate();
  
  const [chapter, setChapter] = useState(null);
  const [allChapters, setAllChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const [chapterRes, listRes] = await Promise.all([
          fetch(`${API_BASE}/api/literature-chapters/${chapterId}`),
          fetch(`${API_BASE}/api/literature-chapters/literature/${id}`)
        ]);

        const chapterData = await chapterRes.json();
        const listData = await listRes.json();

        if (chapterData.success) setChapter(chapterData.data);
        if (listData.success) setAllChapters(listData.data);
      } catch (err) {
        console.error('Помилка завантаження розділу:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
    window.scrollTo(0, 0);
  }, [id, chapterId]);

  if (isLoading) return <div className={styles.loading}>Завантаження тексту...</div>;
  if (!chapter) return <div className={styles.error}>Розділ не знайдено</div>;

  const currentIndex = allChapters.findIndex(c => c._id === chapterId);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  return (
    <div className={styles.readPage}>
      <Header />
      
      <div className={styles.readerContainer}>
        {/* Top Navigation Bar */}
        <nav className={styles.topNav}>
          <button onClick={() => navigate(-1)} className={styles.backLink} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: '600' }}>
            <FiArrowLeft /> <span>Повернутись назад</span>
          </button>
          <div className={styles.titles}>
            <h2 className={styles.workTitle}>{chapter.literature?.title}</h2>
            <h1 className={styles.chapterTitle}>Розділ {chapter.chapterNumber}. {chapter.title}</h1>
          </div>
        </nav>

        {/* Content Area */}
        <article className={styles.contentArea}>
          <div className={styles.textContent}>
            {chapter.content.split('\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </article>

        {/* Bottom Navigation */}
        <footer className={styles.bottomNav}>
          <div className={styles.navControls}>
            <button 
              className={styles.navBtn} 
              disabled={!prevChapter}
              onClick={() => navigate(`/fanfic/${id}/read/${prevChapter._id}`)}
            >
              <FiChevronLeft /> <span>Попередній розділ</span>
            </button>
            
            <button className={styles.listBtn} onClick={() => navigate(`/fanfic/${id}`)}>
              <FiList /> <span>Зміст</span>
            </button>

            <button 
              className={styles.navBtn} 
              disabled={!nextChapter}
              onClick={() => navigate(`/fanfic/${id}/read/${nextChapter._id}`)}
            >
              <span>Наступний розділ</span> <FiChevronRight />
            </button>
          </div>
          
          <div className={styles.finishArea}>
            <p>Ви прочитали цей розділ. Сподобалось?</p>
            <Link to={`/fanfic/${id}`} className={styles.returnBtn}>
              <FiBook /> Повернутись до сторінки твору
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ReadFanfic;

```

## frontend\src\pages\Fanfic\ReadFanfic.module.scss
```scss
@import '../../styles/variables';

.readPage {
  min-height: 100vh;
  background-color: var(--bg-main);
  color: var(--text-main);
}

.readerContainer {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px 100px;

  @media (max-width: 768px) {
    padding-top: 20px;
  }
}

.topNav {
  margin-bottom: 60px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 24px;
}

.backLink {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 24px;
  transition: color 0.2s;

  &:hover {
    color: var(--primary-color);
  }
}

.titles {
  .workTitle {
    font-size: 1.1rem;
    color: var(--primary-color);
    margin: 0 0 8px 0;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 800;
  }

  .chapterTitle {
    font-size: 2.2rem;
    margin: 0;
    font-weight: 900;
    line-height: 1.2;

    @media (max-width: 768px) {
      font-size: 1.6rem;
    }
  }
}

.contentArea {
  margin-bottom: 80px;
}

.textContent {
  font-size: 1.25rem;
  line-height: 1.8;
  color: var(--text-secondary);
  font-family: 'Georgia', serif; /* Classic reading font */

  p {
    margin-bottom: 1.5em;
    text-align: justify;
  }

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
}

.bottomNav {
  border-top: 1px solid var(--border-color);
  padding-top: 40px;
}

.navControls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 60px;

  @media (max-width: 600px) {
    flex-wrap: wrap;
    justify-content: center;
  }
}

.navBtn, .listBtn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-main);

  &:hover:not(:disabled) {
    border-color: var(--primary-color);
    color: var(--primary-color);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
}

.listBtn {
  background: var(--bg-secondary);
}

.finishArea {
  text-align: center;
  background: var(--bg-card);
  padding: 40px;
  border-radius: 20px;
  border: 1px solid var(--border-color);

  p {
    margin: 0 0 20px 0;
    font-size: 1.1rem;
    color: var(--text-muted);
  }
}

.returnBtn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--primary-color);
  color: white;
  padding: 12px 30px;
  border-radius: 10px;
  font-weight: 700;
  text-decoration: none;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
}

.loading, .error {
  text-align: center;
  padding: 100px 20px;
  font-size: 1.2rem;
  color: var(--text-muted);
}

```

## frontend\src\pages\Favorites\Favorites.jsx
```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import Header from '../../components/Header';
import styles from './Favorites.module.scss';

const Favorites = () => {
  const [favoriteMangas, setFavoriteMangas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE}/api/user-list/favorites`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
          setFavoriteMangas(data.data);
        }
      } catch (err) {
        console.error('Помилка завантаження обраного:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleCardClick = (item) => {
    // Якщо тип Фанфік/Література - ведемо на /fanfic, інакше на /manga
    const isLit = item.type === 'Фанфік' || item.type === 'Література';
    navigate(isLit ? `/fanfic/${item._id}` : `/manga/${item._id}`);
  };

  return (
    <div className={styles.favoritesWrapper}>
      <Header />
      
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Обране</h1>
          <span className={styles.resultsCount}>Знайдено: {favoriteMangas.length}</span>
        </div>

        {isLoading ? (
          <div className={styles.loading}>Завантаження...</div>
        ) : favoriteMangas.length > 0 ? (
          <div className={styles.favoritesGrid}>
            {favoriteMangas.map((item) => (
              <div 
                key={item._id} 
                className={styles.mangaCard}
                onClick={() => handleCardClick(item)}
              >
                <div className={styles.imageWrapper}>
                  <img 
                    src={item.coverImage ? (item.coverImage.startsWith('http') ? item.coverImage : `${API_BASE}${item.coverImage}`) : ''} 
                    alt={item.title} 
                  />
                  <div className={styles.rating}>
                    <FiStar size={12} fill="currentColor" /> {item.rating?.average ? item.rating.average.toFixed(1) : '0.0'}
                  </div>
                  <div className={styles.typeBadge}>{item.type || 'Манґа'}</div>
                </div>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <span className={styles.chapters}>{item.chaptersCount || 0} розділів</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>❤</div>
            <h2>Тут поки порожньо</h2>
            <p>Додайте тайтли до Обраного, щоб вони з'явилися тут!</p>
            <button className={styles.catalogBtn} onClick={() => navigate('/catalog')}>
              Перейти в каталог
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;

```

## frontend\src\pages\Favorites\Favorites.module.scss
```scss
@import '../../styles/variables';

.favoritesWrapper {
  min-height: 100vh;
  background-color: var(--bg-main);
  color: var(--text-main);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
}

.pageHeader {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 16px;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}

.pageTitle {
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #fff 0%, #aaa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
}

.resultsCount {
  color: var(--text-muted);
  font-size: 0.95rem;
  font-weight: 500;
}

.favoritesGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

.mangaCard {
  background-color: var(--bg-card);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.03);
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-8px);
    border-color: var(--primary-color);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);

    .imageWrapper img {
      transform: scale(1.1);
    }
  }
}

.imageWrapper {
  position: relative;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  background-color: #2a2a2a;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
}

.textCover {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
  font-weight: 700;
  font-size: 1.1rem;
  background: linear-gradient(135deg, var(--bg-card) 0%, #2a2a2a 100%);
  color: var(--primary-color);
}

.rating {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  padding: 4px 8px;
  border-radius: var(--border-radius-sm);
  font-size: 0.85rem;
  font-weight: 700;
  color: #ffca28;
  z-index: 2;
}

.typeBadge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: var(--primary-color);
  padding: 4px 8px;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  z-index: 2;
  box-shadow: 0 4px 8px rgba(255, 71, 87, 0.3);
}

.cardInfo {
  padding: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (max-width: 480px) {
    padding: 12px;
  }
}

.cardTitle {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--text-main);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.6em;

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
}

.chapters {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 500;
}

.emptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  background-color: var(--bg-card);
  border-radius: var(--border-radius-lg);
  border: 1px dashed rgba(255, 255, 255, 0.1);

  .emptyIcon {
    font-size: 4rem;
    margin-bottom: 24px;
    opacity: 0.5;
  }

  h2 {
    font-size: 1.5rem;
    margin-bottom: 12px;
  }

  p {
    color: var(--text-muted);
    margin-bottom: 32px;
    max-width: 400px;
  }
}

.catalogBtn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: var(--border-radius-md);
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(255, 71, 87, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
}

```

## frontend\src\pages\Home.jsx
```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import styles from './Home.module.scss';
import SidebarUpdates from '../components/SidebarUpdates';
import PopularAuthors from '../components/PopularAuthors';
import TagCategories from '../components/TagCategories';
import Header from '../components/Header';

const Home = () => {
  const [popular, setPopular] = useState([]);
  const [readingNow, setReadingNow] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeGenre, setActiveGenre] = useState(null);
  const [activeFormat, setActiveFormat] = useState(null);
  const [activeStatus, setActiveStatus] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMangaData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/manga/home');
        const data = await response.json();
        
        if (data.success) {
          const formatManga = (m) => ({
            id: m._id,
            title: m.title,
            image: m.coverImage ? (m.coverImage.startsWith('http') ? m.coverImage : `http://localhost:5000${m.coverImage}`) : '',
            rating: m.averageRating || 0,
            genres: m.genres || [],
            type: m.type || '',
            status: m.status || ''
          });

          setNewArrivals(data.data.newArrivals.map(formatManga));
          setPopular(data.data.topRated.map(formatManga));
          setReadingNow(data.data.readingNow ? data.data.readingNow.map(formatManga) : []); 
        }
      } catch (err) {
        console.error('Помилка завантаження даних:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMangaData();
  }, []);

  const filterManga = (list) => {
    return list
      .filter(item => !activeGenre || item.genres?.includes(activeGenre))
      .filter(item => {
        if (!activeFormat) return true;
        const type = item.type?.toLowerCase();
        if (activeFormat === 'Манґа') return type === 'манга' || type === 'манґа' || type === 'manga';
        if (activeFormat === 'Манхва') return type === 'манхва' || type === 'manhwa';
        if (activeFormat === 'Маньхуа') return type === 'маньхуа' || type === 'manhua';
        if (activeFormat === 'Література/Фанфік') return type === 'література' || type === 'фанфік';
        return type === activeFormat.toLowerCase();
      })
      .filter(item => {
        if (!activeStatus) return true;
        const status = item.status;
        if (activeStatus === 'Онґоінґ') return status === 'В процесі' || status === 'in_progress';
        return status === activeStatus;
      });
  };

  const filteredPopular = filterManga(popular);
  const filteredNew = filterManga(newArrivals);
  const filteredReadingNow = filterManga(readingNow);

  return (
    <div className={styles.homeWrapper}>
      <Header />

      <div className={styles.homeContainer}>
        <main className={styles.mainContent}>
          {filteredPopular.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Найпопулярніші</h2>
              <div className={styles.popularGrid}>
                {filteredPopular.map((item) => (
                  <div 
                    key={item.id} 
                    className={styles.mangaCard}
                    onClick={() => navigate(`/manga/${item.id}`)}
                  >
                    <div className={styles.imageWrapper}>
                      <img src={item.image} alt={item.title} />
                      <div className={styles.rating}>
                        <FiStar size={12} fill="currentColor" /> {item.rating ? item.rating.toFixed(1) : '0.0'}
                      </div>
                    </div>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                  </div>
                ))}
              </div>
            </section>
          )}

          {filteredReadingNow.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Читають зараз</h2>
              <div className={styles.popularGrid}>
                {filteredReadingNow.map((item) => (
                  <div 
                    key={item.id} 
                    className={styles.mangaCard}
                    onClick={() => navigate(`/manga/${item.id}`)}
                  >
                    <div className={styles.imageWrapper}>
                      <img src={item.image} alt={item.title} />
                      <div className={styles.rating}>
                        <FiStar size={12} fill="currentColor" /> {item.rating ? item.rating.toFixed(1) : '0.0'}
                      </div>
                    </div>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Новинки</h2>
            {filteredNew.length > 0 ? (
              <div className={styles.newGrid}>
                {filteredNew.map((item) => (
                  <div 
                    key={item.id} 
                    className={styles.compactCard}
                    onClick={() => navigate(`/manga/${item.id}`)}
                  >
                    <img src={item.image} alt={item.title} />
                    <h4 className={styles.compactTitle}>{item.title}</h4>
                  </div>
                ))}
              </div>
            ) : (
              !isLoading && <p className={styles.emptyText}>За вашим запитом нічого не знайдено.</p>
            )}
          </section>
        </main>

        <aside className={styles.sidebar}>
          <SidebarUpdates />
          <PopularAuthors />
          <TagCategories 
            activeGenre={activeGenre} setActiveGenre={setActiveGenre}
            activeFormat={activeFormat} setActiveFormat={setActiveFormat}
            activeStatus={activeStatus} setActiveStatus={setActiveStatus}
          />
        </aside>
      </div>
    </div>
  );
};

export default Home;

```

## frontend\src\pages\Home.module.scss
```scss
@import '../styles/variables';

.homeWrapper {
  min-height: 100vh;
  background-color: var(--bg-main);
}

/* 2. ОСНОВНИЙ КОНТЕНТ */
.homeContainer {
  display: flex;
  gap: 40px;
  align-items: flex-start;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px;
  color: var(--text-main);
  box-sizing: border-box;

  @media (max-width: 1024px) {
    flex-direction: column;
    padding: 20px 16px; /* Додано горизонтальний відступ для планшетів */
  }

  @media (max-width: 768px) {
    gap: 32px;
    padding: 20px 12px; /* Додано горизонтальний відступ для телефонів */
  }
}

.mainContent {
  flex: 1;
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 40px;
  box-sizing: border-box;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.sectionTitle {
  font-size: 1.5rem;
  font-weight: 700;
  border-left: 4px solid var(--primary-color);
  padding-left: 12px;
}

/* Гріди з використанням auto-fill для запобігання розтягування одиночних елементів */
.popularGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr); /* Жорстко 2 колонки на мобільних */
    gap: 12px;
    justify-items: stretch; /* Розтягуємо елементи на всю ширину колонки */
  }
}

.mangaCard {
  width: 100%;
  cursor: pointer;
  transition: transform var(--transition-speed) ease;

  &:hover {
    transform: scale(1.03);
  }

  .imageWrapper {
    position: relative;
    aspect-ratio: 2/3;
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    margin-bottom: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .rating {
      position: absolute;
      top: 10px;
      right: 10px;
      background: var(--bg-badge);
      color: var(--rating-color);
      padding: 4px 8px;
      border-radius: var(--border-radius-sm);
      font-size: 0.85rem;
      font-weight: bold;
      backdrop-filter: blur(4px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
  }
}

.cardTitle {
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
}

.newGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr); /* Жорстко 2 колонки на мобільних */
    gap: 12px;
    justify-items: stretch;
  }
}

.compactCard {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;

  img {
    width: 100%;
    aspect-ratio: 2/3;
    object-fit: cover;
    border-radius: var(--border-radius-md);
  }
}

.compactTitle {
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
}

/* Сайдбар */
.sidebar {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 1024px) {
    width: 100%;
  }

  @media (max-width: 768px) {
    flex-shrink: 1;
    width: 100%;
    order: -1;          /* ПЕРЕНОСИМО САЙДБАР ВГОРУ */
    margin-bottom: 24px; /* Додаємо відступ знизу до контенту */
  }
}

```

## frontend\src\pages\Manga\ReadManga.jsx
```javascript
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiList } from 'react-icons/fi';
import Header from '../../components/Header';
import NotificationModal from '../../components/NotificationModal';
import styles from './ReadManga.module.scss';

const ReadManga = () => {
  const { titleId, chapterId } = useParams();
  const navigate = useNavigate();

  const [chapter, setChapter] = useState(null);
  const [manga, setManga] = useState(null);
  const [allChapters, setAllChapters] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState('');

  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [chapterRes, mangaRes, allChaptersRes] = await Promise.all([
          fetch(`${API_BASE}/api/chapters/${chapterId}`),
          fetch(`${API_BASE}/api/manga/${titleId}`),
          fetch(`${API_BASE}/api/chapters/manga/${titleId}`)
        ]);

        const chapterData = await chapterRes.json();
        const mangaData = await mangaRes.json();
        const allChaptersData = await allChaptersRes.json();

        if (chapterData.success) {
          setChapter(chapterData.data);
          // Записуємо в історію при завантаженні розділу
          recordHistory(chapterData.data._id);
        }
        if (mangaData.success) setManga(mangaData.data);
        if (allChaptersData.success) {
          // Сортуємо по номеру глави
          setAllChapters(allChaptersData.data.sort((a, b) => a.number - b.number));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const recordHistory = async (chId) => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        await fetch(`${API_BASE}/api/history`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ mangaId: titleId, chapterId: chId })
        });
      } catch (err) {
        console.error('Error recording history:', err);
      }
    };

    fetchData();
    setCurrentPage(0);
    window.scrollTo(0, 0);
  }, [chapterId, titleId]);

  const nextChapter = useMemo(() => {
    if (!chapter || allChapters.length === 0) return null;
    const currentIndex = allChapters.findIndex(c => String(c._id) === String(chapterId));
    if (currentIndex !== -1 && currentIndex < allChapters.length - 1) {
      return allChapters[currentIndex + 1];
    }
    return null;
  }, [chapter, allChapters, chapterId]);

  const handleNextPage = useCallback(() => {
    if (!chapter) return;
    if (currentPage < chapter.pages.length - 1) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo(0, 0);
    } else if (nextChapter) {
      // Перехід до наступного розділу
      navigate(`/manga/${titleId}/read/${nextChapter._id}`);
    } else {
      setNotifyMessage('Всі доступні розділи прочитано!');
      setIsNotifyOpen(true);
    }
  }, [currentPage, chapter, titleId, navigate, nextChapter]);

  const handleNotifyClose = () => {
    setIsNotifyOpen(false);
    navigate(`/manga/${titleId}?tab=chapters`);
  };

  const handlePrevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  }, [currentPage]);

  // Обробка клавіш стрілок
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNextPage();
      if (e.key === 'ArrowLeft') handlePrevPage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextPage, handlePrevPage]);

  if (isLoading) return <div className={styles.loading}>Завантаження...</div>;
  if (!chapter) return <div className={styles.error}>Розділ не знайдено</div>;

  return (
    <div className={styles.readerWrapper}>
      <Header />
      
      <div className={styles.readerContainer}>
        <div className={styles.readerHeader}>
          <Link to={`/manga/${titleId}?tab=chapters`} className={styles.backBtn}>
            <FiArrowLeft /> До списку розділів
          </Link>
          <div className={styles.chapterTitleInfo}>
            <h2 className={styles.mangaTitle}>{manga?.title}</h2>
            <span className={styles.chapterInfo}>Розділ {chapter.number} {chapter.title && ` - ${chapter.title}`}</span>
          </div>
        </div>

        <div className={styles.pageViewer}>
          <div className={styles.pageContent} onClick={handleNextPage}>
            <img 
              src={chapter.pages[currentPage].startsWith('http') ? chapter.pages[currentPage] : `${API_BASE}${chapter.pages[currentPage]}`} 
              alt={`Сторінка ${currentPage + 1}`} 
              className={styles.mangaPage} 
            />
          </div>

          <div className={styles.navigation}>
            <button 
              className={styles.navBtn} 
              onClick={handlePrevPage}
              disabled={currentPage === 0}
            >
              <FiChevronLeft /> Назад
            </button>
            <span className={styles.pageCounter}>
              Сторінка {currentPage + 1} з {chapter.pages.length}
            </span>
            <button 
              className={styles.navBtn} 
              onClick={handleNextPage}
            >
              {currentPage < chapter.pages.length - 1 ? (
                <>Вперед <FiChevronRight /></>
              ) : (
                <>Завершити <FiList /></>
              )}
            </button>
          </div>
        </div>
      </div>

      <NotificationModal 
        isOpen={isNotifyOpen} 
        message={notifyMessage} 
        onClose={handleNotifyClose} 
      />
    </div>
  );
};

export default ReadManga;

```

## frontend\src\pages\Manga\ReadManga.module.scss
```scss
@import '../../styles/variables';

.readerWrapper {
  min-height: 100vh;
  background-color: #050505;
  color: #eee;
}

.readerContainer {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.readerHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
}

.backBtn {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #888;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;

  &:hover {
    color: var(--primary-color);
  }
}

.chapterTitleInfo {
  text-align: right;
  
  @media (max-width: 768px) {
    text-align: center;
  }
}

.mangaTitle {
  margin: 0;
  font-size: 1.5rem;
  color: #fff;
}

.chapterInfo {
  color: var(--primary-color);
  font-weight: 700;
  font-size: 1.1rem;
}

.pageViewer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.pageContent {
  width: 100%;
  display: flex;
  justify-content: center;
  cursor: pointer;
}

.mangaPage {
  max-width: 100%;
  height: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  border-radius: 4px;
}

.navigation {
  display: flex;
  align-items: center;
  gap: 40px;
  padding-bottom: 50px;

  @media (max-width: 600px) {
    gap: 20px;
  }
}

.navBtn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: #fff;
  padding: 12px 30px;
  border-radius: 30px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: var(--primary-color);
    color: var(--primary-color);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
}

.pageCounter {
  font-weight: 600;
  color: #888;
  font-size: 1rem;
}

.loading, .error {
  text-align: center;
  padding: 100px;
  font-size: 1.5rem;
  color: #888;
}

```

## frontend\src\pages\MangaDetails\MangaDetails.jsx
```javascript
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiEye, FiStar, FiMessageSquare, FiChevronDown, FiCheck, FiArrowLeft, FiEdit2, FiHeart, FiTrash2 } from 'react-icons/fi';
import Header from '../../components/Header';
import InteractionSection from '../../components/InteractionSection';
import NotificationModal from '../../components/NotificationModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import styles from './MangaDetails.module.scss';

// Статичні дані виносимо за межі компонента для стабільності
const TABS = [
  { id: 'about', label: 'Про тайтл' },
  { id: 'chapters', label: 'Розділи' },
  { id: 'discussions', label: 'Обговорення' },
  { id: 'comments', label: 'Коментарі' },
  { id: 'reviews', label: 'Відгуки' },
  { id: 'fanfics', label: 'Література/Фанфік' }
];

const LIST_LABELS = {
  reading: 'Читаю',
  planned: 'В планах',
  dropped: 'Кинуто',
  read: 'Прочитано',
  favorites: 'В Обраному'
};

const API_BASE = 'http://localhost:5000';

const MangaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // States
  const [manga, setManga] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [isListsOpen, setIsListsOpen] = useState(false);
  const [userList, setUserList] = useState(null);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [fanfics, setFanfics] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [isChaptersLoading, setIsChaptersLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');

  const handleCloseModal = () => {
    setIsNotifyOpen(false);
    if (notifyMessage.includes('успішно видалено')) {
      navigate('/catalog');
    }
  };

  const handleDeleteManga = async () => {
    setIsConfirmOpen(false);
    try {
      const response = await fetch(`${API_BASE}/api/manga/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setNotifyMessage('Тайтл успішно видалено');
        setIsNotifyOpen(true);
      } else {
        const errorData = await response.json();
        setNotifyMessage(errorData.error || 'Помилка при видаленні');
        setIsNotifyOpen(true);
      }
    } catch (err) {
      setNotifyMessage('Помилка при видаленні');
      setIsNotifyOpen(true);
    }
  };

  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE}${path}`;
  };

  const isAuthor = useMemo(() => {
    if (!manga || !loggedInUser) return false;
    const authorId = manga.author?._id || manga.author;
    const userId = loggedInUser.id || loggedInUser._id;
    return String(authorId) === String(userId);
  }, [manga, loggedInUser]);

  const isAdmin = loggedInUser && loggedInUser.role === 'admin';
  const canDelete = isAuthor || isAdmin;

  const fetchMangaDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/manga/${id}`);
      const result = await response.json();
      if (result.success) {
        const mangaData = result.data;
        setManga(mangaData);
        setLikeCount(mangaData.likes?.length || 0);
        
        if (loggedInUser) {
          const userId = loggedInUser.id || loggedInUser._id;
          setIsLiked(mangaData.likes?.some(uid => String(uid) === String(userId)));

          try {
            const rateRes = await fetch(`${API_BASE}/api/manga/${id}/my-rate`, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const rateData = await rateRes.json();
            if (rateData.success) {
              setUserRating(rateData.data || 0);
            }
          } catch (rErr) {
            console.error('Помилка завантаження оцінки:', rErr);
          }
        }
        
        try {
          const fanficsRes = await fetch(`${API_BASE}/api/literature/manga/${id}`);
          const fanficsData = await fanficsRes.json();
          if (fanficsData.success) {
            setFanfics(Array.isArray(fanficsData.data) ? fanficsData.data : []);
          }
        } catch (fErr) {
          console.error('Помилка завантаження фанфіків:', fErr);
        }
      }
    } catch (err) {
      console.error('Помилка завантаження тайтлу:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchMangaDetails();
  }, [id]);

  useEffect(() => {
    if (id && activeTab === 'chapters') {
      const fetchChapters = async () => {
        setIsChaptersLoading(true);
        try {
          const response = await fetch(`${API_BASE}/api/chapters/manga/${id}`);
          const result = await response.json();
          if (result.success) {
            setChapters(result.data);
          }
        } catch (err) {
          console.error('Помилка завантаження розділів:', err);
        } finally {
          setIsChaptersLoading(false);
        }
      };
      fetchChapters();
    }
  }, [id, activeTab]);

  const handleLike = async () => {
    if (!loggedInUser) {
      setNotifyMessage('Будь ласка, увійдіть, щоб ставити лайки');
      setIsNotifyOpen(true);
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/api/manga/${id}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setIsLiked(data.isLiked);
        setLikeCount(data.data.length);
      }
    } catch (err) {
      console.error('Помилка лайку:', err);
    }
  };

  const handleRate = async (score) => {
    if (!loggedInUser) {
      setNotifyMessage('Будь ласка, увійдіть, щоб ставити оцінки');
      setIsNotifyOpen(true);
      return;
    }
    if (score === userRating) return;
    try {
      const response = await fetch(`${API_BASE}/api/manga/${id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ score })
      });
      const result = await response.json();
      if (result.success) {
        setUserRating(result.data.score);
        setManga(prev => ({
          ...prev,
          averageRating: result.data.averageRating,
          ratingCount: result.data.ratingCount,
          ratingStats: result.data.ratingStats
        }));
        setIsRatingOpen(false);
      }
    } catch (err) {
      console.error('Помилка при виставленні оцінки:', err);
    }
  };

  const handleSelectList = async (listName) => {
    if (!loggedInUser) {
      setNotifyMessage('Будь ласка, увійдіть, щоб додавати в списки');
      setIsNotifyOpen(true);
      return;
    }

    try {
      if (userList === listName) {
        // Якщо клік по тому ж статусу - видаляємо зі списку
        const response = await fetch(`${API_BASE}/api/user-list/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
          setUserList(null);
        }
      } else {
        // Додаємо або оновлюємо статус
        const response = await fetch(`${API_BASE}/api/user-list/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ mangaId: id, status: listName })
        });
        const result = await response.json();
        if (result.success) {
          setUserList(listName);
        }
      }
    } catch (err) {
      console.error('Помилка оновлення списку:', err);
    } finally {
      setIsListsOpen(false);
    }
  };

  const getBarColor = (rating) => {
    if (rating >= 8) return '#2ecc71';
    if (rating >= 6) return '#f1c40f';
    if (rating >= 4) return '#95a5a6';
    return '#e67e22';
  };

  useEffect(() => {
    // Отримуємо поточний статус тайтлу для юзера
    const fetchUserListStatus = async () => {
      if (!loggedInUser || !id) return;
      try {
        const response = await fetch(`${API_BASE}/api/user-list`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const result = await response.json();
        if (result.success) {
          const listItem = result.data.find(item => String(item.manga?._id || item.manga) === String(id));
          if (listItem) {
            setUserList(listItem.status);
          }
        }
      } catch (err) {
        console.error('Помилка завантаження списку юзера:', err);
      }
    };
    fetchUserListStatus();
  }, [id, loggedInUser?.id]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <div className={styles.aboutTab}>
            <div className={styles.description}>
              <p>{manga?.description || 'Опис відсутній.'}</p>
            </div>
          </div>
        );
      case 'chapters':
        return (
          <div className={styles.chaptersList}>
            {isChaptersLoading ? (
              <div className={styles.loading}>Завантаження розділів...</div>
            ) : Array.isArray(chapters) && chapters.length > 0 ? (
              <div className={styles.chaptersGrid}>
                {chapters.map(ch => (
                  <Link key={ch._id} to={`/manga/${id}/read/${ch._id}`} className={styles.chapterItem}>
                    <div className={styles.chapterInfo}>
                      <span className={styles.chapterNumber}>Розділ {ch.number}</span>
                      {ch.title && <span className={styles.chapterTitle}>{ch.title}</span>}
                    </div>
                    <span className={styles.chapterDate}>{new Date(ch.createdAt).toLocaleDateString('uk-UA')}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.placeholderTab}><p>Розділів ще немає.</p></div>
            )}
          </div>
        );
      case 'comments':
        return <InteractionSection type="comment" targetId={id} resourceType="Manga" />;
      case 'reviews':
        return <InteractionSection type="review" targetId={id} resourceType="Manga" />;
      case 'discussions':
        return <InteractionSection type="discussion" targetId={id} resourceType="Manga" />;
      case 'fanfics':
        return (
          <div className={styles.fanficsList}>
            {loggedInUser && (
              <button className={styles.writeFanficBtn} onClick={() => navigate(`/create-fanfic?mangaId=${id}`)}>
                <FiEdit2 /> <span>Написати свій фанфік</span>
              </button>
            )}
            {Array.isArray(fanfics) && fanfics.length > 0 ? (
              fanfics.map(fic => (
                <div key={fic._id} className={styles.fanficItem} onClick={() => navigate(`/fanfic/${fic._id}`)}>
                  <div className={styles.fanficHeader}>
                    <div className={styles.fanficTitleRow}>
                      <span className={styles.fanficTitle}>{fic.title}</span>
                      {fic.isOfficial && <span className={styles.officialBadge}>Від автора</span>}
                    </div>
                    <span className={styles.fanficAuthor}>Автор: {fic.author?.username || 'Невідомо'}</span>
                  </div>
                  <p className={styles.fanficSnippet}>
                    {fic.description ? (fic.description.length > 150 ? fic.description.substring(0, 150) + '...' : fic.description) : 'Опис відсутній...'}
                  </p>
                </div>
              ))
            ) : (
              <div className={styles.placeholderTab}><p>Літератури/Фанфіків ще немає.</p></div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) return <div className={styles.loading}>Завантаження...</div>;
  if (!manga) return (
    <div className={styles.errorContainer}>
      <h2>Тайтл не знайдено</h2>
      <button onClick={() => navigate('/catalog')}><FiArrowLeft /> До каталогу</button>
    </div>
  );

  return (
    <div className={styles.detailsWrapper}>
      <Header />
      <section className={styles.heroSection}>
        <div className={styles.bannerContainer}>
          {manga.bannerImage ? <img src={getFullUrl(manga.bannerImage)} className={styles.banner} alt="Banner" /> : <div className={styles.bannerPlaceholder} />}
        </div>
      </section>

      <div className={styles.mainContainer}>
        <div className={styles.mangaHeader}>
          <div className={styles.posterWrapper}>
            <img src={manga.coverImage ? getFullUrl(manga.coverImage) : ''} alt={manga.title} className={styles.poster} />
          </div>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>{manga.title}</h1>
              {manga.alternativeTitle && <p className={styles.originalTitle}>{manga.alternativeTitle}</p>}
            </div>
            <div className={styles.mainStats}>
              <div className={styles.ratingBox}>
                <FiStar size={18} className={styles.star} fill="currentColor" />
                <span className={styles.ratingValue}>{manga.averageRating?.toFixed(1) || '0.0'}</span>
              </div>
            </div>
          </div>
          <div className={styles.actionButtons}>
            <button className={styles.readBtn}>Читати</button>
            {isAuthor && <button className={styles.editBtn} onClick={() => navigate(`/edit-manga/${manga._id}`)}>Редагувати</button>}
            {canDelete && (
              <button className={styles.deleteAction} onClick={() => setIsConfirmOpen(true)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiTrash2 size={18} /> Видалити твір
              </button>
            )}
            <div className={styles.listsContainer}>
              <button className={`${styles.listsBtn} ${userList ? styles.active : ''}`} onClick={() => setIsListsOpen(!isListsOpen)}>
                {userList ? LIST_LABELS[userList] : 'Додати в плани'}
                <FiChevronDown size={18} className={`${styles.arrow} ${isListsOpen ? styles.open : ''}`} />
              </button>
              {isListsOpen && (
                <div className={styles.listsDropdown}>
                  {Object.entries(LIST_LABELS).map(([key, label]) => (
                    <div key={key} className={`${styles.listItem} ${userList === key ? styles.selected : ''}`} onClick={() => handleSelectList(key)}>
                      {label} {userList === key && <FiCheck size={16} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.contentGrid}>
          <aside className={styles.leftColumn}>
            <div className={styles.statsBlock}>
              <h3 className={styles.statsTitle}>Оцінки користувачів</h3>
              <div className={styles.histogram}>
                {[10,9,8,7,6,5,4,3,2,1].map((rate) => {
                  const stat = manga.ratingStats?.[rate] || { count: 0, percentage: 0 };
                  return (
                    <div key={rate} className={styles.histoRow}>
                      <span className={styles.rateLabel}>{rate} <FiStar size={12} fill="currentColor" /></span>
                      <div className={styles.barContainer}>
                        <div className={styles.barFill} style={{ width: `${stat.percentage}%`, backgroundColor: getBarColor(rate) }} />
                      </div>
                      <span className={styles.rateStats}>{stat.percentage}% <span className={styles.rateCount}>({stat.count})</span></span>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          <main className={styles.rightColumn}>
            <div className={styles.rateActionArea}>
              <div className={styles.rateActionWrapper}>
                <button className={styles.rateBtn} onClick={() => setIsRatingOpen(!isRatingOpen)}>
                  {userRating > 0 ? <><FiStar size={16} fill="currentColor" /> Ваша оцінка: {userRating}</> : <><FiStar size={16} /> Оцінити</>}
                </button>
                {isRatingOpen && (
                  <div className={styles.ratingPopup}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starValue) => (
                      <span 
                        key={starValue} 
                        className={`${styles.popupStar} ${(hoverRating || userRating) >= starValue ? styles.hovered : ''}`}
                        onMouseEnter={() => setHoverRating(starValue)} 
                        onMouseLeave={() => setHoverRating(0)} 
                        onClick={() => {
                          console.log(`Виставлення оцінки: ${starValue}`);
                          handleRate(starValue);
                        }}
                        title={`${starValue} з 10`}
                      >
                        <FiStar size={22} fill={(hoverRating || userRating) >= starValue ? "currentColor" : "none"} />
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.infoBlock}>
              <div className={styles.infoItem}><span className={styles.label}>Тип</span><span className={styles.value}>{manga.type}</span></div>
              <div className={styles.infoItem}><span className={styles.label}>Рік</span><span className={styles.value}>{manga.releaseYear}</span></div>
              <div className={styles.infoItem}><span className={styles.label}>Статус</span><span className={styles.value}>{manga.status}</span></div>
              <div className={styles.infoItem}><span className={styles.label}>Автор</span><span className={styles.value}>{manga.author?.username || 'Невідомо'}</span></div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Характеристики</span>
                <div className={styles.mangaSpecs}>
                   <div className={`${styles.specLike} ${isLiked ? styles.liked : ''}`} onClick={handleLike}>
                      <FiHeart size={16} fill={isLiked ? "#ff4d00" : "none"} />
                      <span>{likeCount} вподобань</span>
                   </div>
                </div>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Жанри</span>
                <div className={styles.genresList}>
                  {manga.genres && manga.genres.map(genre => <span key={genre} className={styles.genreBadge}>{genre}</span>)}
                </div>
              </div>
            </div>

            <div className={styles.tabsContainer}>
              <div className={styles.tabsMenu}>
                {TABS.map(tab => (
                  <button key={tab.id} className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
                ))}
              </div>
              <div className={styles.tabContent}>{renderTabContent()}</div>
            </div>
          </main>
        </div>
      </div>
      <NotificationModal 
        isOpen={isNotifyOpen} 
        message={notifyMessage} 
        onClose={handleCloseModal} 
      />

      <ConfirmationModal
        isOpen={isConfirmOpen}
        title="Видалити твір?"
        message={`Ви впевнені, що хочете назавжди видалити "${manga?.title}"? Цю дію неможливо буде скасувати.`}
        onConfirm={handleDeleteManga}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

export default MangaDetails;

```

## frontend\src\pages\MangaDetails\MangaDetails.module.scss
```scss
@import '../../styles/variables';

.detailsWrapper {
  min-height: 100vh;
  background-color: var(--bg-main);
  color: var(--text-main);
  padding-bottom: 50px;
}

.bannerContainer {
  position: relative;
  height: 280px;
  overflow: hidden;
  width: 100%;

  @media (max-width: 768px) { height: 180px; }

  .banner {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 20%;
  }

  .bannerPlaceholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, var(--bg-card), var(--bg-main));
  }
}

.mainContainer {
  max-width: 1200px;
  margin: -100px auto 0;
  padding: 0 20px;
  position: relative;
  z-index: 10;

  @media (max-width: 768px) {
    margin-top: -60px;
    padding: 0 12px;
  }
}

.mangaHeader {
  display: flex;
  gap: 30px;
  align-items: flex-end;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: 100px 1fr;
    gap: 16px;
  }
}

.posterWrapper {
  flex: 0 0 250px;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  background: var(--bg-card);

  .poster {
    width: 100%;
    height: auto;
    display: block;
    aspect-ratio: 2/3;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    flex: 0 0 100px;
  }
}

.headerContent {
  flex-grow: 1;
  padding-bottom: 10px;
  min-width: 0;

  .title {
    font-size: 2.5rem;
    margin: 0;
    font-weight: 800;
    line-height: 1.2;
    @media (max-width: 768px) { font-size: 1.25rem; }
  }

  .originalTitle {
    color: var(--text-muted);
    font-size: 1.1rem;
    margin: 5px 0 20px;
    @media (max-width: 768px) { font-size: 0.85rem; }
  }
}

.mainStats {
  display: flex;
  align-items: center;
  gap: 15px;

  .ratingBox {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--rating-bg);
    padding: 8px 16px;
    border-radius: var(--border-radius-md);
    color: var(--rating-color);
    font-weight: 700;
    border: 1px solid rgba(255, 215, 0, 0.2);
  }
}

.actionButtons {
  display: flex;
  gap: 12px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    grid-column: 1 / 3;
  }

  button, .listsContainer {
    min-width: 160px;
  }

  .readBtn, .editBtn, .listsBtn {
    padding: 12px 24px;
    border-radius: var(--border-radius-md);
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .readBtn { background: var(--primary-color); color: white; }

  .editBtn {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    color: var(--text-main);
  }

  .listsContainer {
    position: relative;
    .listsBtn {
      width: 100%;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      justify-content: space-between;
    }
    
    .listsDropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      margin-top: 8px;
      z-index: 100;
      overflow: hidden;
      box-shadow: var(--shadow-lg);

      .listItem {
        padding: 10px 16px;
        cursor: pointer;
        &:hover { background: var(--bg-secondary); }
      }
    }
  }
}

.contentGrid {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 30px;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
}

.rightColumn {
  min-width: 0;
}

/* HISTOGRAM */
.statsBlock {
  background: var(--bg-card);
  padding: 20px;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);

  .statsTitle { font-size: 1.1rem; margin-bottom: 15px; }

  .histogram {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .histoRow {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.8rem;

      .rateLabel { width: 30px; display: flex; align-items: center; gap: 4px; color: var(--text-muted); }
      
      .barContainer {
        flex-grow: 1;
        height: 6px;
        background: var(--bg-secondary);
        border-radius: 3px;
        overflow: hidden;
        .barFill { height: 100%; transition: width 0.4s; }
      }

      .rateStats { width: 60px; text-align: right; color: var(--text-main); }
    }
  }
}

/* INFO BLOCK */
.infoBlock {
  background: var(--bg-card);
  padding: 25px;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;

  @media (max-width: 600px) { grid-template-columns: 1fr; }

  .infoItem {
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    .label { color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; }
    .value { font-weight: 500; }

    .genresList {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 5px;
      .genreBadge {
        background: var(--bg-secondary);
        padding: 4px 12px;
        border-radius: 15px;
        font-size: 0.85rem;
        border: 1px solid var(--border-color);
      }
    }
  }

  .mangaSpecs {
    margin-top: 5px;
    display: flex;
    gap: 12px;
  }

  .specLike {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-secondary);
    padding: 6px 14px;
    border-radius: 10px;
    border: 1px solid var(--border-color);
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
    font-weight: 600;

    &:hover {
      border-color: var(--primary-color);
      background: rgba(255, 140, 0, 0.05);
    }

    &.liked {
      color: var(--primary-color);
      border-color: var(--primary-color);
      background: rgba(255, 140, 0, 0.1);
    }
  }
}

/* RATE ACTION */
.rateActionArea {
  margin-bottom: 25px;
  .rateBtn {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    color: var(--text-main);
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .rateActionWrapper {
    position: relative;
    .ratingPopup {
      position: absolute;
      top: 100%;
      left: 0;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      padding: 10px;
      border-radius: 8px;
      display: flex;
      gap: 5px;
      z-index: 100;
      margin-top: 10px;
      box-shadow: var(--shadow-lg);

      .popupStar {
        cursor: pointer;
        color: #444;
        &.hovered { color: var(--rating-color); }
      }
    }
  }
}

/* TABS */
.tabsContainer { margin-top: 20px; }
.tabsMenu {
  display: flex;
  gap: 25px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 25px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */

  &::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }

  @media (max-width: 768px) {
    gap: 16px;
    padding-bottom: 8px;
  }
  
  .tabBtn {
    flex-shrink: 0;
    background: none;
    border: none;
    color: var(--text-muted);
    padding: 12px 0;
    cursor: pointer;
    font-weight: 600;
    position: relative;
    white-space: nowrap;

    &.activeTab {
      color: var(--primary-color);
      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--primary-color);
      }
    }
  }
}

/* FANFICS */
.fanficsList { display: flex; flex-direction: column; gap: 15px; }

.writeFanficBtn {
  background: var(--bg-card);
  border: 1px dashed var(--primary-color);
  color: var(--primary-color);
  padding: 16px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
  &:hover { background: rgba(255, 140, 0, 0.05); }
}

.fanficItem {
  background: var(--bg-card);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: var(--primary-color); background: var(--bg-secondary); }
}

.fanficHeader {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
  .fanficTitleRow { display: flex; align-items: center; gap: 12px; }
  .fanficTitle { font-size: 1.15rem; font-weight: 700; }
  .officialBadge {
    background: linear-gradient(135deg, #ff8c00 0%, #ff4d00 100%);
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
  }
  .fanficAuthor { color: var(--text-muted); font-size: 0.85rem; }
}

.fanficSnippet { font-size: 0.95rem; color: var(--text-secondary); line-height: 1.5; }

.placeholderTab { text-align: center; padding: 50px; color: var(--text-muted); }
.loading { text-align: center; padding: 100px; color: var(--text-muted); }

/* CHAPTERS */
.chaptersList {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.chaptersGrid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chapterItem {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 16px 24px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary-color);
    transform: translateX(5px);
    background: var(--bg-secondary);
  }
}

.chapterInfo {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chapterNumber {
  font-weight: 700;
  color: var(--text-main);
  font-size: 1.1rem;
}

.chapterTitle {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.chapterDate {
  color: var(--text-muted);
  font-size: 0.85rem;
}


```

## frontend\src\pages\Notifications\Notifications.jsx
```javascript
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import Header from '../../components/Header';
import styles from './Notifications.module.scss';

const Notifications = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'updates'; // 'news' | 'updates'
  const [siteNews, setSiteNews] = useState([]);
  const [titleUpdates, setTitleUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');
  const canCreateNews = loggedInUser && loggedInUser.role === 'admin';

  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/news`);
        const data = await response.json();
        if (data.success) {
          setSiteNews(data.data);
        }
      } catch (err) {
        console.error('Помилка завантаження новин:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, []);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  return (
    <div className={styles.notificationsWrapper}>
      <Header />
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Повідомлення</h1>
        </div>
        
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'updates' ? styles.active : ''}`}
            onClick={() => handleTabChange('updates')}
          >
            Оновлення тайтлів
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'news' ? styles.active : ''}`}
            onClick={() => handleTabChange('news')}
          >
            Новини сайту
          </button>
        </div>

        <div className={styles.content}>
          {isLoading ? (
            <div className={styles.loading}>Завантаження...</div>
          ) : activeTab === 'updates' ? (
            <div className={styles.updatesGrid}>
              {titleUpdates.length > 0 ? (
                titleUpdates.map(update => (
                  <div key={update.id} className={styles.updateCard}>
                    <img src={update.image} alt={update.title} className={styles.updateImage} />
                    <div className={styles.updateInfo}>
                      <h3 className={styles.updateTitle}>{update.title}</h3>
                      <p className={styles.updateText}>{update.text}</p>
                      <span className={styles.updateDate}>{update.date}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>Немає нових оновлень тайтлів.</div>
              )}
            </div>
          ) : (
            <div className={styles.newsList}>
              {siteNews.length > 0 ? (
                siteNews.map(news => (
                  <div key={news._id || news.id} className={styles.newsCard}>
                    <div className={styles.newsHeader}>
                      <span className={`${styles.categoryBadge} ${
                        news.category === 'Важливе' ? styles.important : 
                        news.category === 'Системні' ? styles.system : 
                        news.category === 'Оновлення' ? styles.update : styles.other
                      }`}>
                        {news.category || 'Інше'}
                      </span>
                      <span className={styles.newsDate}>{new Date(news.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className={styles.newsTitle}>{news.title}</h3>
                    <p className={styles.newsText}>{news.content}</p>
                    <div className={styles.newsFooter}>
                      <span className={styles.newsAuthor}>Опублікував: <strong>Адміністрація</strong></span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>Новин поки що немає.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;

```

## frontend\src\pages\Notifications\Notifications.module.scss
```scss
@import '../../styles/variables';

.notificationsWrapper {
  min-height: 100vh;
  background-color: var(--bg-main);
  color: var(--text-main);
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 24px;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
}

.pageHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
}

.pageTitle {
  font-size: 2rem;
  margin: 0;
  color: var(--primary-color);
  font-weight: 700;
}

.createNewsBtn {
  background-color: var(--primary-color);
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-speed);
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: #ff3344;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--primary-light);
  }

  &:active {
    transform: translateY(0);
  }
}

.tabs {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 30px;
}

.tab {
  background: none;
  border: none;
  color: var(--text-muted);
  padding: 12px 0;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  transition: color var(--transition-speed);

  &.active {
    color: var(--primary-color);
    
    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: var(--primary-color);
    }
  }

  &:hover {
    color: var(--text-main);
  }
}

/* Оновлення тайтлів */
.updatesGrid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.updateCard {
  display: flex;
  gap: 20px;
  background-color: var(--bg-card);
  padding: 16px;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  transition: transform var(--transition-speed), border-color var(--transition-speed);
  cursor: pointer;

  &:hover {
    transform: translateX(8px);
    border-color: var(--primary-color);
    
    .updateTitle {
      color: var(--primary-color);
    }
  }
}

.updateImage {
  width: 70px;
  height: 100px;
  object-fit: cover;
  border-radius: var(--border-radius-sm);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.updateInfo {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}

.updateTitle {
  font-size: 1.1rem;
  margin: 0;
  color: var(--text-main);
  font-weight: 600;
  transition: color var(--transition-speed);
}

.updateText {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.updateDate {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Новини сайту */
.newsList {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.newsCard {
  background-color: var(--bg-card);
  padding: 24px;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: border-color var(--transition-speed);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background-color: var(--primary-color);
  }

  &:hover {
    border-color: var(--border-light);
  }
}

.newsHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.categoryBadge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: var(--primary-light);
  color: var(--primary-color);
  border: 1px solid var(--primary-light);

  &.system, &.system_badge {
    background-color: rgba(0, 123, 255, 0.1);
    color: #007bff;
    border-color: rgba(0, 123, 255, 0.2);
  }

  &.important {
    background-color: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.2);
  }

  &.update {
    background-color: rgba(46, 213, 115, 0.1);
    color: #2ed573;
    border-color: rgba(46, 213, 115, 0.2);
  }

  &.other {
    background-color: rgba(160, 160, 160, 0.1);
    color: #a0a0a0;
    border-color: rgba(160, 160, 160, 0.2);
  }
}

.newsTitle {
  font-size: 1.4rem;
  margin: 0;
  color: var(--text-main);
  font-weight: 700;
}

.newsText {
  font-size: 1.05rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0;
}

.newsFooter {
  margin-top: 4px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.newsAuthor {
  font-size: 0.9rem;
  color: var(--text-muted);

  strong {
    color: var(--text-secondary);
  }
}

.newsDate {
  font-size: 0.85rem;
  color: var(--text-muted);
}

```

## frontend\src\pages\Profile.jsx
```javascript
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  FiBook, 
  FiMessageSquare, 
  FiStar, 
  FiBookOpen, 
  FiSettings, 
  FiUser, 
  FiChevronRight,
  FiCheckCircle,
  FiEdit3,
  FiPlus,
  FiHeart,
  FiShield
} from 'react-icons/fi';
import { FaMars, FaVenus } from 'react-icons/fa';
import { LuShieldCheck } from 'react-icons/lu';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Header from '../components/Header';
import ProfileSidebar from '../components/ProfileSidebar';
import ProfileSettingsModal from '../components/ProfileSettingsModal';
import CreateAnnouncementModal from '../components/CreateAnnouncementModal';
import styles from './Profile.module.scss';

const Profile = () => {
  const { username: urlUsername } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Зміни збережено!');
  
  const [myWorks, setMyWorks] = useState({ manga: [], literature: [] });
  const [isMyWorksLoading, setIsMyWorksLoading] = useState(false);

  const [userTitles, setUserTitles] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isTitlesLoading, setIsTitlesLoading] = useState(false);

  // States для коментарів та відгуків
  const [userComments, setUserComments] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [userHistory, setUserHistory] = useState([]);
  const [isActivityLoading, setIsActivityLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  
  const [commentTypeFilter, setCommentTypeFilter] = useState('all');
  const [commentLocationFilter, setCommentLocationFilter] = useState('all');

  const [analytics, setAnalytics] = useState({ 
    totalChaptersRead: 42, 
    totalHoursRead: 7, 
    chartData: [
      { name: 'Пн', rozdivly: 5 },
      { name: 'Вв', rozdivly: 8 },
      { name: 'Ср', rozdivly: 3 },
      { name: 'Чт', rozdivly: 12 },
      { name: 'Пт', rozdivly: 6 },
      { name: 'Сб', rozdivly: 15 },
      { name: 'Нд', rozdivly: 9 }
    ] 
  });

  const [profileTab, setProfileTab] = useState(searchParams.get('tab') || 'titles');
  const analyticsRef = useRef(null);
  const tabsRef = useRef(null);

  const API_BASE = 'http://localhost:5000';
  const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');
  const isOwnProfile = user?.username && (loggedInUser?.username === user.username);

  const TITLE_CATEGORIES = [
    { id: 'all', label: 'Усі' },
    { id: 'reading', label: 'Читаю' },
    { id: 'planned', label: 'В планах' },
    { id: 'read', label: 'Прочитано' },
    { id: 'dropped', label: 'Кинуто' },
    { id: 'favorites', label: 'В Обраному' }
  ];

  // Завантаження аналітики (Вимкнено для відображення фейкових даних)
  /*
  useEffect(() => {
    if (profileTab === 'stats' && urlUsername) {
      const fetchAnalytics = async () => {
        try {
          const response = await fetch(`${API_BASE}/api/users/profile/${urlUsername}/analytics`);
          const data = await response.json();
          if (data.success) {
            setAnalytics(data.data);
          }
        } catch (err) {
          console.error('Помилка завантаження аналітики:', err);
        }
      };
      fetchAnalytics();
    }
  }, [profileTab, urlUsername]);
  */

  useEffect(() => {
    if (profileTab === 'titles' && urlUsername) {
      const fetchTitles = async () => {
        setIsTitlesLoading(true);
        try {
          // Отримуємо списки через бекенд для профілю (навіть чужого)
          const response = await fetch(`${API_BASE}/api/user-list/user/${urlUsername}`);
          const data = await response.json();
          
          if (data.success) {
            const lists = data.data; // Масив { manga: { _id, title, ... }, status, ... }
            if (lists.length === 0) {
              setUserTitles([]);
              return;
            }

            const userMangaDetails = lists
              .filter(item => item.manga) // Відсікаємо якщо манґу видалили з бази
              .map(item => ({
                ...item.manga,
                statusInList: item.status
              }));
              
            setUserTitles(userMangaDetails);
          }
        } catch (err) {
          console.error('Помилка завантаження тайтлів:', err);
        } finally {
          setIsTitlesLoading(false);
        }
      };
      fetchTitles();
    }
  }, [profileTab, urlUsername]);

  useEffect(() => {
    if ((profileTab === 'comments' || profileTab === 'reviews') && user?._id) {
      const fetchActivity = async () => {
        setIsActivityLoading(true);
        try {
          const endpoint = profileTab === 'comments' ? 'comments' : 'reviews';
          const response = await fetch(`${API_BASE}/api/${endpoint}/user/${user._id}`);
          const data = await response.json();
          if (data.success) {
            if (profileTab === 'comments') setUserComments(data.data);
            else setUserReviews(data.data);
          }
        } catch (err) {
          console.error('Помилка завантаження активності:', err);
        } finally {
          setIsActivityLoading(false);
        }
      };
      fetchActivity();
    }
  }, [profileTab, user]);

  useEffect(() => {
    if (profileTab === 'history' && user?._id) {
      const fetchHistory = async () => {
        setIsHistoryLoading(true);
        try {
          const response = await fetch(`${API_BASE}/api/history/user/${user._id}`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new TypeError("Oops, we haven't got JSON!");
          }

          const data = await response.json();
          if (data.success) {
            setUserHistory(data.data);
          }
        } catch (err) {
          console.error('Помилка завантаження історії:', err);
        } finally {
          setIsHistoryLoading(false);
        }
      };
      fetchHistory();
    }
  }, [profileTab, user]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'settings') {
      setIsSettingsOpen(true);
      return;
    }
    setIsSettingsOpen(false);
    if (tab) setProfileTab(tab);

    const timer = setTimeout(() => {
      if (tab === 'stats') {
        analyticsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (tab) {
        tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    if (tabId === 'settings') {
      setSearchParams({ tab: 'settings' });
    } else {
      setProfileTab(tabId);
      setSearchParams({ tab: tabId });
    }
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('tab');
    setSearchParams(newParams);
  };

  const handleSaveSuccess = () => {
    setToastMessage('Зміни збережено!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAnnouncementSuccess = () => {
    setToastMessage('Новину опубліковано!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => {
    if (profileTab === 'my-creations' && (isOwnProfile || user?.role === 'author' || user?.role === 'admin')) {
      const fetchMyWorks = async () => {
        setIsMyWorksLoading(true);
        try {
          const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
          const [mangaRes, litRes] = await Promise.all([
            fetch(`${API_BASE}/api/manga/my-titles`, { headers }),
            fetch(`${API_BASE}/api/literature`)
          ]);
          
          const mangaData = await mangaRes.json();
          const litData = await litRes.json();
          
          let myManga = [];
          let myLit = [];

          if (mangaData.success) myManga = mangaData.data;
          if (litData.success) {
            const profileUserId = user?._id || user?.id;
            myLit = litData.data.filter(l => (l.author?._id || l.author) === profileUserId);
          }
          
          setMyWorks({ manga: myManga, literature: myLit });
        } catch (err) {
          console.error('Помилка завантаження робіт:', err);
        } finally {
          setIsMyWorksLoading(false);
        }
      };
      fetchMyWorks();
    }
  }, [profileTab, user, isOwnProfile]);

  const PROFILE_TABS = useMemo(() => [
    { id: 'titles', label: 'Тайтли' },
    { id: 'stats', label: 'Аналітика' },
    ...(isOwnProfile || user?.role === 'author' || user?.role === 'admin' ? [{ id: 'my-creations', label: 'Творчість' }] : []),
    { id: 'comments', label: 'Коментарі' },
    { id: 'reviews', label: 'Відгуки' },
    { id: 'history', label: 'Історія' }
  ], [user, isOwnProfile]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/users/profile/${urlUsername}`);
        const data = await response.json();
        if (data.success) {
          setUser(data.data);
        } else {
          setUser({ username: urlUsername, role: 'Гість', avatar: null, error: true });
        }
      } catch (err) {
        console.error('Помилка завантаження профілю:', err);
      }
    };
    if (urlUsername) fetchUserData();

    const handleProfileUpdate = () => {
      const loggedIn = JSON.parse(localStorage.getItem('user') || 'null');
      if (loggedIn && (loggedIn.username === urlUsername || loggedIn.id === user?._id)) {
        setUser(prev => ({ ...prev, ...loggedIn }));
      }
    };
    window.addEventListener('profileUpdate', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdate', handleProfileUpdate);
  }, [urlUsername]);

  if (!user) return <div className={styles.profileWrapper}><Header /><div className={styles.loading}>Завантаження...</div></div>;

  const STATS_DYNAMIC = [
    { label: 'Тайтли', value: user.stats?.titles || 0, icon: <FiBook size={18} /> },
    { label: 'Коментарі', value: user.stats?.comments || 0, icon: <FiMessageSquare size={18} /> },
    { label: 'Оцінки', value: user.stats?.ratings || 0, icon: <FiStar size={18} /> },
    { label: 'Прочитано', value: user.stats?.readCount || 0, icon: <FiBookOpen size={18} /> }
  ];

  const renderProfileTabContent = () => {
    switch(profileTab) {
      case 'my-creations':
        const hasWorks = myWorks.manga.length > 0 || myWorks.literature.length > 0;
        return (
          <div className={styles.creationsWrapper}>
            {isOwnProfile && (
              <div className={styles.creationsActions}>
                {(user?.role === 'author' || user?.role === 'admin') && (
                  <>
                    <button className={styles.creationsBtn} onClick={() => setIsAnnouncementOpen(true)}>
                      <FiPlus /> <span>Новина тайтлу</span>
                    </button>
                    <button className={styles.creationsBtn} onClick={() => navigate('/create-manga')}>
                      <FiPlus /> <span>Додати тайтл</span>
                    </button>
                  </>
                )}
                <button className={styles.creationsBtn} onClick={() => navigate('/create-fanfic')}>
                  <FiPlus /> <span>Написати фанфік</span>
                </button>
              </div>
            )}
            
            <div className={styles.myWorksSection}>
              {isMyWorksLoading ? (
                <div className={styles.loading}>Завантаження ваших робіт...</div>
              ) : hasWorks ? (
                <>
                  {myWorks.manga.length > 0 && (
                    <div className={styles.worksGroup}>
                      <h3 className={styles.groupTitle}>Манґа та комікси</h3>
                      <div className={styles.myTitlesGrid}>
                        {myWorks.manga.map(m => (
                          <div key={m._id} className={styles.mangaCard}>
                            <div className={styles.imageWrapper} onClick={() => navigate(`/manga/${m._id}`)}>
                              <img src={`${API_BASE}${m.coverImage}`} alt={m.title} />
                            </div>
                            <h3 className={styles.cardTitle} onClick={() => navigate(`/manga/${m._id}`)}>{m.title}</h3>
                            {isOwnProfile && (
                              <button className={styles.editCreationBtn} onClick={() => navigate(`/edit-manga/${m._id}`)}>Редагувати</button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {myWorks.literature.length > 0 && (
                    <div className={styles.worksGroup}>
                      <h3 className={styles.groupTitle}>Фанфіки та література</h3>
                      <div className={styles.fanficsGrid}>
                        {myWorks.literature.map(lit => (
                          <div 
                            key={lit._id} 
                            className={styles.fanficCard}
                            onClick={() => navigate(`/fanfic/${lit._id}`)}
                          >
                            <div className={styles.fanficIcon}>
                              <FiBookOpen size={24} />
                            </div>
                            <div className={styles.fanficInfo}>
                              <div className={styles.fanficTop}>
                                <h3 className={styles.fanficTitle}>{lit.title}</h3>
                                {lit.isOfficial && <span className={styles.officialBadge}>Від автора</span>}
                              </div>
                              <div className={styles.fanficMeta}>
                                <span className={styles.direction}>{lit.direction}</span>
                                <span className={styles.dot}>•</span>
                                <span className={styles.status}>
                                  {lit.status === 'completed' ? 'Завершено' : 'В процесі'}
                                </span>
                              </div>
                            </div>
                            <div className={styles.fanficLikes}>
                              <FiHeart size={14} fill="#ff4d00" stroke="none" />
                              <span>{lit.likes?.length || 0}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.emptyState}>
                  <p>У вас ще немає створених творів.</p>
                  <div className={styles.emptyActions}>
                    <button onClick={() => navigate('/create-fanfic')} className={styles.createBtn}>Написати перший фанфік</button>
                    {(user?.role === 'author' || user?.role === 'admin') && (
                      <button onClick={() => navigate('/create-manga')} className={styles.createBtnSecondary}>Додати манґу</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'titles':
        const filteredTitles = userTitles.filter(item => {
          if (activeCategory === 'all') return true;
          return item.statusInList === activeCategory;
        });

        return (
          <div className={styles.titlesWrapper}>
            {isTitlesLoading ? (
              <div className={styles.loading}>Завантаження списку...</div>
            ) : filteredTitles.length > 0 ? (
              <div className={styles.progressGrid}>
                {filteredTitles.map(manga => (
                  <div key={manga._id} className={styles.progressCard} onClick={() => navigate(`/manga/${manga._id}`)} style={{ cursor: 'pointer' }}>
                    <img src={manga.coverImage ? (manga.coverImage.startsWith('http') ? manga.coverImage : `${API_BASE}${manga.coverImage}`) : ''} alt={manga.title} className={styles.cardCover} />
                    <div className={styles.cardInfo}>
                      <h3 className={styles.cardTitle}>{manga.title}</h3>
                      <div className={styles.progressText}>
                        Статус: {TITLE_CATEGORIES.find(c => c.id === manga.statusInList)?.label || 'Невідомо'}
                      </div>
                      <div className={styles.progressTrack}>
                         <div className={styles.progressFill} style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>У цій категорії ще немає тайтлів.</p>
              </div>
            )}
          </div>
        );
      case 'stats':
        return (
          <div className={styles.analyticsSection} ref={analyticsRef}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Прочитано розділів</span>
                <span className={styles.statNumber}>{analytics.totalChaptersRead}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Годин читання (приблизно)</span>
                <span className={styles.statNumber}>{analytics.totalHoursRead} год.</span>
              </div>
            </div>
            <div className={styles.chartContainer}>
              <h3 className={styles.chartTitle}>Активність читання (Останні 7 днів)</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={analytics.chartData}>
                    <XAxis dataKey="name" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                      itemStyle={{ color: 'var(--primary-color)' }}
                    />
                    <Line type="monotone" dataKey="rozdivly" name="Розділи" stroke="var(--primary-color)" strokeWidth={3} dot={{ r: 5, fill: 'var(--primary-color)' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      case 'comments':
      case 'reviews':
        const activityData = profileTab === 'comments' ? userComments : userReviews;
        const filteredActivity = activityData.filter(item => {
          const typeMap = { 'manga': 'Манґа', 'manhwa': 'Манхва', 'fanfic': 'Література', 'manhua': 'Маньхуа' };
          const matchType = commentTypeFilter === 'all' || item.resourceId?.type === typeMap[commentTypeFilter];
          const matchLocation = commentLocationFilter === 'all' || commentLocationFilter === 'under_title';
          return matchType && matchLocation;
        });

        return (
          <div className={styles.activityContainer}>
            {isActivityLoading ? (
              <div className={styles.loading}>Завантаження...</div>
            ) : filteredActivity.length > 0 ? (
              <div className={styles.activityList}>
                {filteredActivity.map(item => (
                  <div key={item._id} className={styles.activityCard}>
                    <div className={styles.activityHeader}>
                      <span className={styles.targetTitle} onClick={() => navigate(`/${item.resourceType?.toLowerCase() === 'manga' ? 'manga' : 'fanfic'}/${item.resourceId?._id}`)}>
                        {item.resourceId?.title || 'Видалений твір'}
                      </span>
                      <span className={styles.activityDate}>{new Date(item.createdAt).toLocaleDateString('uk-UA')}</span>
                    </div>
                    <p className={styles.activityContent}>{item.content}</p>
                    <div className={styles.activityMeta}>
                      <span className={styles.typeBadge}>{item.resourceId?.type || (item.resourceType === 'Literature' ? 'Література' : 'Твір')}</span>
                      <span className={styles.activityDate}>
                        {profileTab === 'reviews' ? 'Відгук' : 'Коментар'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>Тут поки що порожньо.</div>
            )}
          </div>
        );
      case 'history':
        return (
          <div className={styles.historyWrapper}>
            {isHistoryLoading ? (
              <div className={styles.loading}>Завантаження історії...</div>
            ) : userHistory.length > 0 ? (
              <div className={styles.historyGrid}>
                {userHistory.map(item => (
                  <div 
                    key={item._id} 
                    className={styles.historyCard}
                    onClick={() => navigate(`/manga/${item.manga?._id}/read/${item.chapter?._id}`)}
                  >
                    <div className={styles.historyCover}>
                      <img src={item.manga?.coverImage ? (item.manga.coverImage.startsWith('http') ? item.manga.coverImage : `${API_BASE}${item.manga.coverImage}`) : ''} alt={item.manga?.title} />
                      <div className={styles.historyOverlay}>
                        <FiBookOpen size={24} />
                      </div>
                    </div>
                    <div className={styles.historyInfo}>
                      <h3 className={styles.historyMangaTitle}>{item.manga?.title || 'Видалений твір'}</h3>
                      <div className={styles.historyChapterDetails}>
                        <span className={styles.historyChapterNumber}>Розділ {item.chapter?.number}</span>
                        {item.chapter?.title && <span className={styles.historyChapterTitle}> - {item.chapter.title}</span>}
                      </div>
                      <span className={styles.historyDate}>Прочитано: {new Date(item.readAt).toLocaleDateString('uk-UA')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>Тут поки що порожньо.</p>
              </div>
            )}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className={styles.profileWrapper}>
      <Header />
      <div className={styles.container}>
        <section className={styles.headerSection}>
          <div className={styles.banner}>
            <div className={styles.bannerImage} style={{ backgroundImage: user.banner ? `url("${user.banner}")` : 'none' }} />
            {isOwnProfile && (
              <div className={styles.bannerActions}>
                {user.role === 'admin' && (
                  <button className={styles.adminPanelBtn} onClick={() => navigate('/admin')} title="Панель адміністратора">
                    <FiShield size={20} />
                    <span>Адмін-панель</span>
                  </button>
                )}
                <button className={styles.settingsBtn} onClick={() => handleTabChange('settings')} title="Налаштування">
                  <FiSettings size={20} />
                </button>
              </div>
            )}
          </div>
          <div className={styles.userInfoBar}>
            <div className={styles.avatarWrapper}>
              {user.avatar ? <img src={user.avatar} alt={user.username} className={styles.avatarImage} /> : <div className={styles.avatarPlaceholder}><FiUser size={40} /></div>}
            </div>
            <div className={styles.userDetails}>
              <div className={styles.nameRow}>
                <h1 className={styles.nickname}>{user.username}</h1>
                {user.role === 'admin' && (
                  <div className={`${styles.authorBadge} ${styles.adminBadge}`}>
                    <LuShieldCheck size={14} strokeWidth={2.5} /> 
                    <span>Адміністратор</span>
                  </div>
                )}
                {user.role === 'author' && <div className={styles.authorBadge}><FiEdit3 size={12} /> <span>Автор</span></div>}
              </div>
              {user.aboutMe && <p className={styles.aboutText}>{user.aboutMe}</p>}
              <div className={styles.statsPanel}>
                {STATS_DYNAMIC.map((s, i) => (
                  <div key={i} className={styles.statItem}>
                    <span>{s.icon}</span><span className={styles.statLabel}>{s.label}</span><span className={styles.statValue}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <div className={styles.profileTabsMenu} ref={tabsRef}>
          {PROFILE_TABS.map(t => (
            <button key={t.id} type="button" className={`${styles.tabBtn} ${profileTab === t.id ? styles.activeProfileTab : ''}`} onClick={() => handleTabChange(t.id)}>{t.label}</button>
          ))}
        </div>
        <div className={styles.tabLayout}>
          <main className={styles.tabContentArea}>{renderProfileTabContent()}</main>
          <ProfileSidebar 
            activeTab={profileTab} 
            listFilter={activeCategory}
            setListFilter={setActiveCategory}
            commentType={commentTypeFilter}
            setCommentType={setCommentTypeFilter}
            commentLocation={commentLocationFilter}
            setCommentLocation={setCommentLocationFilter}
          />
        </div>
      </div>
      <ProfileSettingsModal isOpen={isSettingsOpen} onClose={handleCloseSettings} user={user} onSaveSuccess={handleSaveSuccess} />
      <CreateAnnouncementModal isOpen={isAnnouncementOpen} onClose={() => setIsAnnouncementOpen(false)} onSaveSuccess={handleAnnouncementSuccess} />
      <div className={`${styles.toast} ${showToast ? styles.show : ''}`}><FiCheckCircle className={styles.toastIcon} /><span>{toastMessage}</span></div>
    </div>
  );
};

export default Profile;

```

## frontend\src\pages\Profile.module.scss
```scss
@import '../styles/variables';

.profileWrapper {
  min-height: 100vh;
  background-color: var(--bg-main);
  color: var(--text-main);
  padding-bottom: 50px;
  transition: background-color var(--transition-speed), color var(--transition-speed);
}

.container {
  max-width: 1170px;
  margin: 0 auto;
  padding: 0 15px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Header Section */
.headerSection {
  width: 100%;
  border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-main);
}

.banner {
  width: 100%;
  height: 300px;
  background-color: var(--bg-card);
  position: relative;

  @media (max-width: 768px) {
    height: 180px;
  }
  
  .bannerImage {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0.8;
  }

  .bannerActions {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    gap: 12px;
    z-index: 10;
  }

  .settingsBtn, .adminPanelBtn {
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    width: auto;
    height: 40px;
    padding: 0 15px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 600;
    font-size: 0.9rem;

    &:hover {
      background: rgba(0, 0, 0, 0.6);
      transform: translateY(-2px);
    }
  }

  .adminPanelBtn {
    color: #ff4757;
    border-color: rgba(255, 71, 87, 0.3);
    
    &:hover {
      background: #ff4757;
      color: white;
      border-color: #ff4757;
    }
  }

  .settingsBtn {
    width: 40px;
    padding: 0;
    border-radius: 50%;
    
    &:hover {
      transform: rotate(45deg);
    }
  }
}

.userInfoBar {
  background-color: var(--bg-card);
  padding: 0 40px 20px 40px;
  display: flex;
  align-items: center;
  gap: 30px;
  position: relative;
  border-bottom: 1px solid var(--border-color);

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 0 20px 30px 20px;
    text-align: center;
    gap: 15px;
  }
}

.avatarWrapper {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background-color: var(--bg-card);
  border: 6px solid var(--bg-card);
  margin-top: -80px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: var(--shadow-lg);
  z-index: 2;

  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
    margin-top: -60px;
    border-width: 4px;
  }

  .avatarImage {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatarPlaceholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 70px;
    font-weight: bold;
    color: white;
    background-color: var(--primary-color);

    @media (max-width: 768px) {
      font-size: 50px;
    }
  }
}

.userDetails {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 15px;
}

.nameRow {
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    justify-content: center;
  }
}

.nickname {
  font-size: 28px;
  font-weight: 800;
  margin: 0;
  color: var(--text-main);

  @media (max-width: 768px) {
    font-size: 22px;
  }
}

.authorBadge {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
  color: white;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(124, 58, 237, 0.3);
  margin-left: 5px;

  .authorIcon {
    flex-shrink: 0;
  }
}

.adminBadge {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
  box-shadow: none;
}

.genderBadge {
  font-size: 0.9rem;
  background: var(--bg-secondary);
  padding: 4px 8px;
  border-radius: 6px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.male {
    color: #3498db;
    background: rgba(52, 152, 219, 0.1);
  }
  
  &.female {
    color: #e84393;
    background: rgba(232, 67, 147, 0.1);
  }
}

.aboutText {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
  max-width: 600px;
  line-height: 1.5;

  @media (max-width: 768px) {
    margin: 0 auto;
  }
}

/* Stats Panel */
.statsPanel {
  display: flex;
  gap: 30px;

  @media (max-width: 768px) {
    justify-content: center;
    gap: 15px;
    flex-wrap: wrap;
  }
}

.statItem {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-muted);

  .statValue {
    font-weight: 700;
    color: var(--primary-color);
    font-size: 16px;
  }
}

/* Analytics Section */
.analyticsSection {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.statCard {
  background-color: var(--bg-card);
  padding: 20px;
  border-radius: var(--border-radius-md);
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid var(--border-color);
}

.statLabel {
  color: var(--text-muted);
  font-size: 14px;
}

.statNumber {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1;
}

.chartContainer {
  background-color: var(--bg-card);
  padding: 24px;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
}

.chartTitle {
  color: var(--text-muted);
  font-size: 12px;
  text-transform: uppercase;
  margin: 0 0 24px 0;
}

/* Tabs System */
.tabLayout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
  padding-top: 20px;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
}

.profileTabsMenu {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid var(--border-color);
  margin-top: 10px;
  overflow-x: auto;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
}

.tabBtn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1rem;
  font-weight: 600;
  padding: 10px 0 15px;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
  white-space: nowrap;

  &:hover {
    color: var(--text-main);
  }

  &.activeProfileTab {
    color: var(--primary-color);

    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 3px;
      background-color: var(--primary-color);
      border-radius: 3px 3px 0 0;
    }
  }
}

.tabContentArea {
  padding-top: 20px;
}

/* Titles Tab (Reading Now) */
.titlesWrapper {
  display: flex;
  flex-direction: column;
}

.filterMenu {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 8px;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;
  }
}

.filterBtn {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover {
    color: var(--text-main);
    border-color: var(--text-muted);
  }

  &.activeFilter {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }
}

.progressGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.progressCard {
  background: var(--bg-card);
  border-radius: var(--border-radius-md);
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--border-color);
  transition: transform 0.2s, border-color 0.2s;

  &:hover {
    transform: translateY(-2px);
    border-color: var(--primary-color);
  }
}

.cardCover {
  width: 60px;
  height: 85px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: var(--shadow-main);
}

.cardInfo {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cardTitle {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.progressTrack {
  width: 100%;
  height: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
}

.progressFill {
  height: 100%;
  background: linear-gradient(90deg, #ff8c00, #ff4757);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progressText {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Lists (Comments, Reviews, History) */
.listContainer {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.listItem {
  background: var(--bg-card);
  padding: 20px;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--primary-color);
  }
}

.listHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.listTitle {
  font-weight: 700;
  color: var(--primary-color);
  font-size: 1.1rem;
}

.listDate {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.reviewRating {
  color: #ffd700;
  font-weight: bold;
}

.listText {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 12px 0;
  font-style: italic;

  &:last-child {
    margin-bottom: 0;
  }
}

/* History Item */
.historyWrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.historyGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.historyCard {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  display: flex;
  gap: 16px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    background: var(--bg-secondary);

    .historyOverlay {
      opacity: 1;
    }
  }
}

.historyCover {
  width: 70px;
  height: 100px;
  position: relative;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.historyOverlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.2s;
}

.historyInfo {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  min-width: 0;
}

.historyMangaTitle {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.historyChapterDetails {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
  color: var(--primary-color);
  font-weight: 600;
}

.historyChapterTitle {
  color: var(--text-muted);
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.historyDate {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 4px;
}

/* Friends Grid */
.friendsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

/* My Creations Tab */
.creationsWrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.creationsActions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
}

.creationsBtn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: var(--primary-color);
  color: white;
  font-size: 0.9rem;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
  }

  svg {
    font-size: 1.1rem;
  }
}

.myWorksSection {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.worksGroup {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.groupTitle {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-main);
  padding-left: 12px;
  border-left: 4px solid var(--primary-color);
}

.fanficsGrid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fanficCard {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary-color);
    transform: translateX(8px);
    background: var(--bg-secondary);
  }
}

.fanficIcon {
  width: 50px;
  height: 50px;
  background: var(--bg-secondary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  flex-shrink: 0;
}

.fanficInfo {
  flex-grow: 1;
  min-width: 0;
}

.fanficTop {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.fanficTitle {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.officialBadge {
  background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  flex-shrink: 0;
}

.fanficMeta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--text-muted);

  .direction {
    color: var(--primary-color);
    font-weight: 600;
  }
}

.fanficLikes {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-weight: 700;
  background: var(--bg-secondary);
  padding: 4px 10px;
  border-radius: 20px;
}

.emptyActions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.createBtnSecondary {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  &:hover { color: white; border-color: white; }
}

.myTitlesGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.mangaCard {
  background: var(--bg-card);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    border-color: var(--primary-color);
    box-shadow: var(--shadow-lg);

    .imageWrapper img {
      transform: scale(1.05);
    }
  }
}

.imageWrapper {
  position: relative;
  aspect-ratio: 2 / 3;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
}

.statusBadge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 4px;
  text-transform: uppercase;
  z-index: 1;
}

.cardTitle {
  padding: 12px 12px 4px 12px;
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cardMeta {
  padding: 0 12px 12px 12px;
  display: flex;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.activityContainer {
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeIn 0.3s ease;
}

.activityList {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activityCard {
  background-color: var(--bg-card);
  border-radius: var(--border-radius-lg);
  padding: 20px;
  border: 1px solid var(--border-color);
  transition: transform 0.2s, border-color 0.2s;

  &:hover {
    border-color: var(--primary-color);
    transform: translateX(4px);
  }
}

.activityHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 10px;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

.targetTitle {
  font-weight: 700;
  color: var(--primary-color);
  font-size: 1.1rem;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    text-decoration: underline;
    opacity: 0.8;
  }
}

.activityDate {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 500;
}

.activityContent {
  color: var(--text-main);
  line-height: 1.6;
  font-size: 0.95rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.activityMeta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  font-size: 0.8rem;
}

.typeBadge {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--text-muted);
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.emptyState {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  background: var(--bg-card);
  border-radius: var(--border-radius-md);
  border: 2px dashed var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

  p {
    color: var(--text-muted);
    font-size: 1.1rem;
    margin: 0;
  }
}

.createBtn {
  padding: 10px 24px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--primary-dark);
  }
}

.editCreationBtn {
  margin: 0 12px 12px 12px;
  padding: 8px;
  background: var(--bg-main);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }
}

.friendCard {
  background: var(--bg-card);
  border-radius: var(--border-radius-md);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--border-color);
  transition: transform 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    border-color: var(--primary-color);
  }
}

.friendAvatarWrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  position: relative;
}

.friendAvatarImg {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.friendAvatarPlaceholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--secondary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  color: white;
}

.onlineIndicator, .offlineIndicator {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid var(--bg-card);
}

.onlineIndicator {
  background-color: #2ecc71;
  box-shadow: 0 0 8px #2ecc71;
}

.offlineIndicator {
  background-color: #555;
}

.friendName {
font-weight: 600;
color: var(--text-main);
text-align: center;
}

/* ТОСТ (ПОВІДОМЛЕННЯ) */
.toast {
position: fixed;
bottom: 30px;
right: 30px;
background: #2ecc71;
color: white;
padding: 12px 24px;
border-radius: 50px;
display: flex;
align-items: center;
gap: 12px;
box-shadow: 0 10px 25px rgba(46, 204, 113, 0.3);
z-index: 9999;
transform: translateY(100px);
opacity: 0;
transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
pointer-events: none;
font-weight: 600;

&.show {
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}

.toastIcon {
  font-size: 1.4rem;
}
}

@media (max-width: 600px) {
.toast {
  bottom: 20px;
  right: 20px;
  left: 20px;
  justify-content: center;
}
}


```

## frontend\src\pages\ReadingNow\ReadingNow.jsx
```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import Header from '../../components/Header';
import styles from './ReadingNow.module.scss';

const ReadingNow = () => {
  const navigate = useNavigate();
  const [readingList, setReadingList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    const fetchReadingNow = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/manga`);
        const data = await response.json();
        if (data.success) {
          // Поки що беремо всі тайтли як "зараз читають" для наповнення
          setReadingList(data.data);
        }
      } catch (err) {
        console.error('Помилка завантаження даних:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReadingNow();
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Зараз читають спільнотою StoryFlow</h1>
        {!isLoading ? (
          readingList.length > 0 ? (
            <div className={styles.grid}>
              {readingList.map(item => (
                <div 
                  key={item._id} 
                  className={styles.mangaCard}
                  onClick={() => navigate(`/manga/${item._id}`)}
                >
                  <div className={styles.imageWrapper}>
                    <img src={item.coverImage ? (item.coverImage.startsWith('http') ? item.coverImage : `${API_BASE}${item.coverImage}`) : ''} alt={item.title} />
                    <div className={styles.rating}>
                      <FiStar size={12} fill="currentColor" /> {item.rating ? item.rating.toFixed(1) : '0.0'}
                    </div>
                    <div className={styles.typeBadge}>{item.type}</div>
                  </div>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>Тут поки що порожньо.</div>
          )
        ) : (
          <div className={styles.loading}>Завантаження...</div>
        )}
      </div>
    </div>
  );
};

export default ReadingNow;

```

## frontend\src\pages\ReadingNow\ReadingNow.module.scss
```scss
@import '../../styles/variables';

.pageWrapper {
  min-height: 100vh;
  background-color: var(--bg-main);
  color: var(--text-main);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
}

.pageTitle {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 32px;
  background: linear-gradient(135deg, #fff 0%, #aaa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (max-width: 480px) {
    font-size: 1.5rem;
    margin-bottom: 24px;
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

.mangaCard {
  width: 100%;
  cursor: pointer;
  transition: transform var(--transition-speed) ease;

  &:hover {
    transform: translateY(-8px);
    
    .imageWrapper {
      border-color: var(--primary-color);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
    }
  }

  .imageWrapper {
    position: relative;
    aspect-ratio: 2/3;
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    margin-bottom: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.03);
    transition: all 0.3s ease;
    background-color: #2a2a2a;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .rating {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.75);
      color: #ffca28;
      padding: 4px 8px;
      border-radius: var(--border-radius-sm);
      font-size: 0.85rem;
      font-weight: bold;
      backdrop-filter: blur(4px);
    }

    .typeBadge {
      position: absolute;
      bottom: 10px;
      left: 10px;
      background-color: var(--primary-color);
      padding: 4px 8px;
      border-radius: var(--border-radius-sm);
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      box-shadow: 0 4px 8px rgba(255, 71, 87, 0.3);
    }
  }
}

.cardTitle {
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

```

## frontend\src\pages\Updates\Updates.jsx
```javascript
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import styles from './Updates.module.scss';

const Updates = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const typeFilter = searchParams.get('type'); // 'manga', 'manhwa', 'fanfic'
  const [updates, setUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const typeMap = {
    'manga': 'Манґа',
    'manhwa': 'Манхва',
    'fanfic': 'Література',
    'literature': 'Література'
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/manga/latest?type=${typeFilter}&limit=50`);
        const result = await response.json();
        
        if (result.success) {
          setUpdates(result.data);
        }
      } catch (error) {
        console.error('Помилка завантаження оновлень:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [typeFilter]);

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Щойно';
    if (minutes < 60) return `Оновлено ${minutes} хв. тому`;
    if (hours < 24) return `Оновлено ${hours} год. тому`;
    return `Оновлено ${days} дн. тому`;
  };

  const handleUpdateClick = (update) => {
    if (typeFilter === 'fanfic' || typeFilter === 'literature') {
      navigate(`/fanfic/${update._id}`);
    } else {
      navigate(`/manga/${update._id}`);
    }
  };

  const formatStatus = (status) => {
    const statusMap = {
      'in_progress': 'В процесі',
      'completed': 'Завершено',
      'Анонс': 'Анонс',
      'В процесі': 'В процесі',
      'Завершено': 'Завершено',
      'Призупинено': 'Призупинено'
    };
    return statusMap[status] || status;
  };

  return (
    <div className={styles.updatesPage}>
      <Header />
      
      <main className={styles.container}>
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>
            {typeFilter && typeMap[typeFilter] ? `Оновлення: ${typeMap[typeFilter]}` : 'Усі оновлення'}
          </h1>
          <p className={styles.subtitle}>Хронологія останніх розділів та тайтлів</p>
        </header>

        <div className={styles.updatesList}>
          {!isLoading ? (
            updates.length > 0 ? (
              updates.map((update) => (
                <div 
                  key={update._id} 
                  className={`${styles.updateCard} ${typeFilter === 'fanfic' ? styles.literatureCard : ''}`}
                  onClick={() => handleUpdateClick(update)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.cardMain}>
                    <div className={styles.info}>
                      <div className={styles.titleRow}>
                        {(typeFilter === 'fanfic' || typeFilter === 'literature') && <span className={styles.fanficBadge}>Література</span>}
                        <h3 className={styles.mangaTitle}>
                          {update.title}
                        </h3>
                      </div>
                      
                      <div className={styles.meta}>
                        <span className={styles.badge}>
                          {typeFilter === 'fanfic' || typeFilter === 'literature' ? 'Література' : update.type}
                        </span>
                        <span className={styles.chapter}>
                          {update.moderationStatus === 'pending' ? 'Очікує модерації' : formatStatus(update.status) || 'Додано'}
                        </span>
                      </div>
                    </div>
                    <div className={styles.timeInfo}>
                      <span className={styles.time}>{formatRelativeTime(update.updatedAt || update.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.empty}>Оновлень не знайдено</div>
            )
          ) : (
            <div className={styles.loading}>Завантаження...</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Updates;

```

## frontend\src\pages\Updates\Updates.module.scss
```scss
@import '../../styles/variables';

.updatesPage {
  min-height: 100vh;
  background-color: var(--bg-main);
  color: var(--text-main);
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

.pageHeader {
  margin-bottom: 40px;
  text-align: center;
}

.title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 8px;
  color: var(--text-main);
}

.subtitle {
  color: var(--text-muted);
  font-size: 1.1rem;
}

.updatesList {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.updateCard {
  background-color: var(--bg-card);
  border-radius: var(--border-radius-lg);
  padding: 20px 24px;
  border: 1px solid var(--border-color);
  transition: transform 0.2s, border-color 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateX(5px);
    border-color: var(--primary-color);
  }

  &.announcementCard {
    border-left: 4px solid var(--primary-color);
    background: rgba(255, 140, 0, 0.05);

    &:hover {
      background: rgba(255, 140, 0, 0.1);
    }
  }

  &.literatureCard {
    border-left: 4px solid #a855f7;
    background: rgba(168, 85, 247, 0.05);

    &:hover {
      background: rgba(168, 85, 247, 0.1);
    }
  }
}

.titleRow {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.newsBadge, .fanficBadge {
  color: #000;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  height: fit-content;
}

.newsBadge {
  background: var(--primary-color);
}

.fanficBadge {
  background: #a855f7;
  color: white;
}

.newsContent {
  margin: 4px 0 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.empty {
  text-align: center;
  padding: 60px 0;
  color: var(--text-muted);
  font-size: 1.2rem;
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  border: 1px dashed var(--border-color);
}


.cardMain {
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

.info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mangaTitle {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-main);
}

.meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.badge {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--text-muted);
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.chapter {
  color: var(--primary-color);
  font-weight: 600;
  font-size: 0.95rem;
}

.timeInfo {
  text-align: right;

  @media (max-width: 600px) {
    text-align: left;
  }
}

.time {
  font-size: 0.9rem;
  color: var(--text-muted);
  font-weight: 500;
}

```

## frontend\src\styles\_variables.scss
```scss
/* frontend/src/styles/_variables.scss */

:root {
  /* DARK THEME (Default) */
  --bg-main: #121212;
  --bg-navbar: rgba(26, 26, 26, 0.8);
  --bg-card: #1e1e1e;
  --bg-sidebar: #181818;
  --bg-modal: #1e1e1e;
  --bg-input: #2a2a2a;
  --bg-secondary: #2f3542;
  --bg-overlay: rgba(0, 0, 0, 0.7);
  --bg-badge: rgba(0, 0, 0, 0.7);
  
  --primary-color: #ff4757; 
  --primary-light: rgba(255, 71, 87, 0.1);
  --secondary-color: #2f3542;
  --accent-color: #ff8c00;
  --accent-light: rgba(255, 140, 0, 0.1);
  
  --text-main: #ffffff;
  --text-secondary: #e0e0e0;
  --text-muted: #a4b0be;
  --text-inverse: #121212;
  
  --border-color: rgba(255, 255, 255, 0.1);
  --border-light: rgba(255, 255, 255, 0.05);
  
  --border-radius-lg: 12px;
  --border-radius-md: 8px;
  --border-radius-sm: 4px;
  
  --transition-speed: 0.3s;
  --shadow-main: 0 4px 20px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 30px rgba(0, 0, 0, 0.5);

  --rating-color: #ffb800;
  --rating-bg: rgba(255, 184, 0, 0.1);
}

:root.light-theme {
  /* LIGHT THEME */
  --bg-main: #f5f7fa;
  --bg-navbar: rgba(255, 255, 255, 0.8);
  --bg-card: #ffffff;
  --bg-sidebar: #ffffff;
  --bg-modal: #ffffff;
  --bg-input: #f1f2f6;
  --bg-secondary: #f1f2f6;
  --bg-overlay: rgba(0, 0, 0, 0.4);
  --bg-badge: rgba(255, 255, 255, 0.8);
  
  --primary-color: #ff4757;
  --primary-light: rgba(255, 71, 87, 0.08);
  --secondary-color: #f1f2f6;
  --accent-color: #ff8c00;
  --accent-light: rgba(255, 140, 0, 0.08);
  
  --text-main: #2f3542;
  --text-secondary: #57606f;
  --text-muted: #747d8c;
  --text-inverse: #ffffff;
  
  --border-color: rgba(0, 0, 0, 0.08);
  --border-light: rgba(0, 0, 0, 0.04);
  
  --shadow-main: 0 4px 20px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 10px 30px rgba(0, 0, 0, 0.05);

  --rating-bg: rgba(255, 184, 0, 0.15);
}


/* View Transitions CSS */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root) {
  z-index: 1;
}
::view-transition-new(root) {
  z-index: 2147483647;
}

```

