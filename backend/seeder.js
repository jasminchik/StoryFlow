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
    console.log('Creating essential users...');
    
    const adminUser = await User.create({
      username: 'admin_test',
      email: 'admin@gmail.com',
      password: '123456',
      role: 'admin'
    });

    await User.create({
      username: 'admin',
      email: 'admin@storyflow.com',
      password: 'password123',
      role: 'admin'
    });

    const authorUser = await User.create({
      username: 'author_official',
      email: 'author@storyflow.com',
      password: 'password123',
      role: 'author'
    });

    await User.create({
      username: 'reader_test',
      email: 'reader@storyflow.com',
      password: 'password123',
      role: 'user'
    });

    console.log('Essential users created.');

    // 2. Seed Mock Mangas
    console.log('Creating mock mangas...');
    const manga1 = await Manga.create({
      title: 'Берсерк: Початок',
      alternativeTitle: 'Berserk',
      description: 'Легендарна історія Гатса, Чорного Мечника, що мандрує темним світом.',
      type: 'Манґа',
      genres: ['Сейнен', 'Темне фентезі', 'Бойовик', 'Драма'],
      status: 'Завершено',
      releaseYear: 1989,
      author: authorUser._id,
      moderationStatus: 'approved',
      averageRating: 9.8,
      ratingCount: 150,
      coverImage: 'https://cdn.readmanga.live/manga_posters/berserk.jpg' // Заглушка
    });

    const manga2 = await Manga.create({
      title: 'Підняття рівня наодинці',
      alternativeTitle: 'Solo Leveling',
      description: 'Історія про найслабшого мисливця E-рангу, який отримує унікальну здатність підвищувати свій рівень.',
      type: 'Манхва',
      genres: ['Екшн', 'Пригоди', 'Фентезі'],
      status: 'В процесі',
      releaseYear: 2018,
      author: authorUser._id,
      moderationStatus: 'approved',
      averageRating: 9.5,
      ratingCount: 320,
      coverImage: 'https://cdn.readmanga.live/manga_posters/solo_leveling.jpg' // Заглушка
    });

    // 3. Seed Mock Literature (Fanfics)
    console.log('Creating mock literature...');
    await Literature.create({
      title: 'Альтернативний кінець',
      description: 'Як би завершилася історія, якби головний герой обрав інший шлях...',
      direction: 'Джен',
      ageRating: 'PG-13',
      status: 'completed',
      genres: ['Драма', 'Ангст'],
      manga: manga2._id, // Прив'язка до Манхви
      author: adminUser._id, // Написав адмін
      moderationStatus: 'approved',
      isOfficial: false
    });

    console.log('Database successfully initialized with essential users and mock data! 🌱');
    process.exit(0);
  } catch (error) {
    console.error('Error during data import:', error);
    process.exit(1);
  }
};

importData();
