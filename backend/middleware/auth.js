const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    try {
      // Fetch user from database to ensure they still exist
      const result = await pool.query(
        'SELECT id, username, email, discord_channel_id, webhook_url FROM users WHERE id = $1',
        [user.id]
      );
      
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      req.user = result.rows[0];
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ error: 'Database error' });
    }
  });
};

module.exports = { authenticateToken };