const pool = require('../config/database');

// Ensure students table exists (idempotent)
async function ensureTable() {
  const createSql = `
    CREATE TABLE IF NOT EXISTS students (
      registrationId VARCHAR(100) PRIMARY KEY,
      firstName VARCHAR(100),
      lastName VARCHAR(100),
      email VARCHAR(255),
      mobile VARCHAR(50),
      confirmPassword VARCHAR(255),
      dob DATE,
      addressLine1 VARCHAR(255),
      addressLine2 VARCHAR(255),
      city VARCHAR(100),
      state VARCHAR(100),
      pincode VARCHAR(50),
      country VARCHAR(100),
      qualification VARCHAR(255),
      fieldOfStudy VARCHAR(255),
      institution VARCHAR(255),
      yearOfPassing INT,
      grade VARCHAR(50),
      experience VARCHAR(255),
      company VARCHAR(255)
    );
  `;
  await pool.query(createSql);
}

async function findByEmail(email) {
  if (!email) return null;
  const [rows] = await pool.execute('SELECT registrationId, email, confirmPassword, firstName, lastName FROM students WHERE email = ? LIMIT 1', [email]);
  return rows && rows.length ? rows[0] : null;
}

async function findByRegistrationId(registrationId) {
  if (!registrationId) return null;
  const [rows] = await pool.execute('SELECT registrationId, email, confirmPassword, firstName, lastName FROM students WHERE registrationId = ? LIMIT 1', [registrationId]);
  return rows && rows.length ? rows[0] : null;
}

async function insertStudent(student) {
  // student should be an object with keys matching columns; registrationId recommended
  await ensureTable();
  const columns = [
    'registrationId','firstName','lastName','email','mobile','confirmPassword','dob','addressLine1','addressLine2','city','state','pincode','country','qualification','fieldOfStudy','institution','yearOfPassing','grade','experience','company'
  ];
  const vals = columns.map((c) => student[c] ?? null);
  // Use parameter placeholders
  const placeholders = columns.map(() => '?').join(',');
  const sql = `INSERT INTO students (${columns.join(',')}) VALUES (${placeholders})`;
  const [result] = await pool.execute(sql, vals);
  return result;
}

async function countByEmail(email) {
  if (!email) return 0;
  const [rows] = await pool.execute('SELECT COUNT(*) AS cnt FROM students WHERE email = ?', [email]);
  return rows && rows[0] ? (rows[0].cnt ?? rows[0]['COUNT(*)'] ?? 0) : 0;
}

async function updatePasswordByRegistrationId(registrationId, hashedPassword) {
  if (!registrationId) return null;
  const [result] = await pool.execute('UPDATE students SET confirmPassword = ? WHERE registrationId = ?', [hashedPassword, registrationId]);
  return result;
}

module.exports = {
  ensureTable,
  findByEmail,
  findByRegistrationId,
  insertStudent,
  countByEmail,
  updatePasswordByRegistrationId,
};
