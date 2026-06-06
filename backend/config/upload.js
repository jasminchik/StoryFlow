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
