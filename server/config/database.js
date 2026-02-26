require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');

// Debug: Log environment variables
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lms',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test connection after pool creation
pool.getConnection()
  .then(conn => {
    conn.ping().then(() => {
      conn.release();
      console.log('MySQL: connected to database successfully');
    }).catch(err => {
      console.error('MySQL: ping failed', err.message);
      conn.release();
    });
  })
  .catch(err => {
    console.error('MySQL: unable to get connection', err.message || err);
  });

module.exports = pool;