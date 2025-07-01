const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const discordService = require('../services/discordService');
const router = express.Router();

// Validation rules
const signupValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, hyphens, and underscores'),
  body('email').isEmail().withMessage('Must be a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('email').isEmail().withMessage('Must be a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Sign up
router.post('/signup', signupValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      // Check if user already exists
      const existingUserResult = await pool.query(
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        [email, username]
      );

      if (existingUserResult.rows.length > 0) {
        return res.status(400).json({ error: 'User with this email or username already exists' });
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Insert user
      const insertResult = await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
        [username, email, passwordHash]
      );

      const userId = insertResult.rows[0].id;

      // Generate JWT
      const token = jwt.sign(
        { id: userId, username, email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: userId,
          username,
          email
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const userResult = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = userResult.rows[0];

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // If user doesn't have Discord setup, set it up now
      if (!user.discord_channel_id || !user.webhook_url) {
        try {
          const discordSetup = await discordService.setupUserDiscord(user.username);
          
          // Update user with Discord info
          await pool.query(
            'UPDATE users SET discord_channel_id = $1, webhook_url = $2 WHERE id = $3',
            [discordSetup.channelId, discordSetup.webhookUrl, user.id]
          );

          user.discord_channel_id = discordSetup.channelId;
          user.webhook_url = discordSetup.webhookUrl;
        } catch (discordError) {
          console.error('Discord setup failed:', discordError);
          // Continue with login even if Discord setup fails
        }
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          hasDiscordSetup: !!(user.discord_channel_id && user.webhook_url),
          lastPumpAt: user.last_pump_at
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Authentication error' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;