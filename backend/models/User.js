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
