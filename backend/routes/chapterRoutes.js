const express = require('express');
const router = express.Router();
const Chapter = require('../models/Chapter');
const Manga = require('../models/Manga');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../config/upload');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-poppler');

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
router.post('/', protect, authorize('admin', 'author'), upload.array('pages', 100), async (req, res) => {
  try {
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
      
      // ПЕРЕВІРКА НА PDF
      if (firstFile.mimetype === 'application/pdf') {
        const pdfPath = firstFile.path;
        const outputDir = path.join(path.dirname(pdfPath), `pages-${Date.now()}`);
        
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const opts = {
          format: 'jpeg',
          out_dir: outputDir,
          out_prefix: 'page',
          page: null
        };

        try {
          await pdf.convert(pdfPath, opts);
          
          // Зчитуємо сконвертовані сторінки
          const files = fs.readdirSync(outputDir);
          const sortedFiles = files.sort((a, b) => 
            a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
          );
          
          const relativeDir = path.basename(outputDir);
          req.body.pages = sortedFiles.map(file => `/uploads/${relativeDir}/${file}`);
          
          // Видаляємо оригінальний PDF
          fs.unlinkSync(pdfPath);
        } catch (pdfError) {
          console.error('PDF Conversion Error:', pdfError);
          return res.status(500).json({ success: false, error: 'Помилка конвертації PDF: ' + pdfError.message });
        }
      } else {
        // Звичайна логіка для картинок
        if (req.files.length > 100) {
          return res.status(400).json({ success: false, error: 'Максимальна кількість сторінок у розділі - 100' });
        }
        req.body.pages = req.files.map(file => `/uploads/${file.filename}`);
      }
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
