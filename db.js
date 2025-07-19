// db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'vehicle_service',
  password: 'chandru2005',
  port: 5000,
});

module.exports = pool;
