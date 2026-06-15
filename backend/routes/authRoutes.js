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
