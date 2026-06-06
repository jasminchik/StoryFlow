const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Налаштування конфігурації Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Налаштування сховища CloudinaryStorage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'storyflow_manga',
    allowed_formats: ['jpeg', 'png', 'jpg', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }]
  },
});

// Створення multer з налаштованим сховищем
const upload = multer({ storage: storage });

module.exports = upload;
