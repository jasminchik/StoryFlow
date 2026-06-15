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
