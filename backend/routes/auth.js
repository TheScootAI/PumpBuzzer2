const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/database');
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

    // Check if user already exists
    db.get(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username],
      async (err, existingUser) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (existingUser) {
          return res.status(400).json({ error: 'User with this email or username already exists' });
        }

        try {
          // Hash password
          const saltRounds = 12;
          const passwordHash = await bcrypt.hash(password, saltRounds);

          // Insert user
          db.run(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, passwordHash],
            function(err) {
              if (err) {
                return res.status(500).json({ error: 'Failed to create user' });
              }

              // Generate JWT
              const token = jwt.sign(
                { id: this.lastID, username, email },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
              );

              res.status(201).json({
                message: 'User created successfully',
                token,
                user: {
                  id: this.lastID,
                  username,
                  email
                }
              });
            }
          );
        } catch (error) {
          res.status(500).json({ error: 'Failed to hash password' });
        }
      }
    );
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

    db.get(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        try {
          const isPasswordValid = await bcrypt.compare(password, user.password_hash);
          
          if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
          }

          // If user doesn't have Discord setup, set it up now
          if (!user.discord_channel_id || !user.webhook_url) {
            try {
              const discordSetup = await discordService.setupUserDiscord(user.username);
              
              // Update user with Discord info
              db.run(
                'UPDATE users SET discord_channel_id = ?, webhook_url = ? WHERE id = ?',
                [discordSetup.channelId, discordSetup.webhookUrl, user.id],
                (err) => {
                  if (err) {
                    console.error('Failed to update user with Discord info:', err);
                  }
                }
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
          res.status(500).json({ error: 'Authentication error' });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;