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
