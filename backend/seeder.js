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
    
    await User.create({
      username: 'admin',
      email: 'admin@storyflow.com',
      password: 'password123',
      role: 'admin'
    });

    await User.create({
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
    console.log('Database successfully initialized with essential users! 🌱');
    process.exit(0);
  } catch (error) {
    console.error('Error during data import:', error);
    process.exit(1);
  }
};

importData();
