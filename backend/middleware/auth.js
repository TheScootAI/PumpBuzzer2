const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    // Fetch user from database to ensure they still exist
    db.get(
      'SELECT id, username, email, discord_channel_id, webhook_url FROM users WHERE id = ?',
      [user.id],
      (err, dbUser) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (!dbUser) {
          return res.status(401).json({ error: 'User not found' });
        }
        
        req.user = dbUser;
        next();
      }
    );
  });
};

module.exports = { authenticateToken };