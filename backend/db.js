const mysql = require('mysql2');
const path  = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || 'praweera.789',
  database: process.env.DB_NAME     || 'vinucare',
});

module.exports = pool.promise();