const pool = require('../config/database');

// Ensure admins table exists
async function ensureTable() {
  const createSql = `
    CREATE TABLE IF NOT EXISTS admins (
      registrationId VARCHAR(100) PRIMARY KEY,
      firstName VARCHAR(100),
      lastName VARCHAR(100),
      email VARCHAR(255),
      password VARCHAR(255),
      dob DATE,
      organization_name VARCHAR(255)
    );
  `;
  await pool.query(createSql);
}

async function findByEmail(email) {
  if (!email) return null;
  const [rows] = await pool.execute('SELECT registrationId, firstName, lastName, email, password, dob, organization_name FROM admins WHERE email = ? LIMIT 1', [email]);
  return rows && rows.length ? rows[0] : null;
}

async function findByRegistrationId(registrationId) {
  if (!registrationId) return null;
  const [rows] = await pool.execute('SELECT registrationId, firstName, lastName, email, password, dob, organization_name FROM admins WHERE registrationId = ? LIMIT 1', [registrationId]);
  return rows && rows.length ? rows[0] : null;
}

// Find admin by full credentials (used for admin login checks)
async function findByCredentials(email, registrationId, dob, password) {
  if (!email && !registrationId) return null;
  const [rows] = await pool.execute('SELECT registrationId, firstName, lastName, email, password, dob, organization_name FROM admins WHERE email = ? AND registrationId = ? AND dob = ? AND password = ? LIMIT 1', [email, registrationId, dob, password]);
  return rows && rows.length ? rows[0] : null;
}

async function insertAdmin(admin) {
  await ensureTable();
  const columns = ['registrationId','firstName','lastName','email','password','dob','organization_name'];
  const vals = columns.map((c) => admin[c] ?? null);
  const placeholders = columns.map(() => '?').join(',');
  const sql = `INSERT INTO admins (${columns.join(',')}) VALUES (${placeholders})`;
  const [result] = await pool.execute(sql, vals);
  return result;
}

async function countByEmail(email) {
  if (!email) return 0;
  const [rows] = await pool.execute('SELECT COUNT(*) AS cnt FROM admins WHERE email = ?', [email]);
  return rows && rows[0] ? (rows[0].cnt ?? rows[0]['COUNT(*)'] ?? 0) : 0;
}

module.exports = {
  ensureTable,
  findByEmail,
  findByRegistrationId,
  findByCredentials,
  insertAdmin,
  countByEmail,
};
