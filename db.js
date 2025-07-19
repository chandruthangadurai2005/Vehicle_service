const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Render will inject this automatically
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;
