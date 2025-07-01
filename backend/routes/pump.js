const express = require('express');
const { db } = require('../config/database');
const discordService = require('../services/discordService');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Send pump message
router.post('/pump', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    // Check if user has Discord setup
    if (!user.webhook_url) {
      // Try to set up Discord for user
      try {
        const discordSetup = await discordService.setupUserDiscord(user.username);
        
        // Update user with Discord info
        await new Promise((resolve, reject) => {
          db.run(
            'UPDATE users SET discord_channel_id = ?, webhook_url = ? WHERE id = ?',
            [discordSetup.channelId, discordSetup.webhookUrl, user.id],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });

        user.webhook_url = discordSetup.webhookUrl;
        user.discord_channel_id = discordSetup.channelId;
        
      } catch (discordError) {
        console.error('Failed to set up Discord for user:', discordError);
        return res.status(500).json({ error: 'Discord setup failed. Please try again.' });
      }
    }

    // Send pump message to Discord
    await discordService.sendPumpMessage(user.webhook_url, user.username);

    // Update last pump time
    const now = new Date().toISOString();
    db.run(
      'UPDATE users SET last_pump_at = ? WHERE id = ?',
      [now, user.id],
      (err) => {
        if (err) {
          console.error('Failed to update last pump time:', err);
        }
      }
    );

    res.json({
      message: 'Pump message sent successfully!',
      timestamp: now
    });

  } catch (error) {
    console.error('Error sending pump message:', error);
    res.status(500).json({ error: 'Failed to send pump message' });
  }
});

// Get user pump stats
router.get('/stats', authenticateToken, (req, res) => {
  const user = req.user;
  
  db.get(
    'SELECT last_pump_at FROM users WHERE id = ?',
    [user.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        username: user.username,
        lastPumpAt: result?.last_pump_at,
        hasDiscordSetup: !!(user.discord_channel_id && user.webhook_url)
      });
    }
  );
});

module.exports = router;