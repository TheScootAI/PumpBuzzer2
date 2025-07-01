const { Pool } = require('pg');

// Parse the connection string or use individual environment variables
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;



const pool = new Pool({
  connectionString: connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : { rejectUnauthorized: false },
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err);
});

// Initialize database tables
const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    
    try {
      // Users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          discord_channel_id TEXT,
          webhook_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_pump_at TIMESTAMP
        )
      `);
      
      console.log('Users table ready');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

module.exports = {
  pool,
  initializeDatabase
};