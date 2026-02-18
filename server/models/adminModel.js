const pool = require('../config/database');

// Ensure admins table exists (username primary key)
async function ensureTable() {
  const createSql = `
    CREATE TABLE IF NOT EXISTS admins (
      username VARCHAR(100) PRIMARY KEY,
      firstName VARCHAR(100),
      lastName VARCHAR(100),
      dob DATE,
      password VARCHAR(255)
    );
  `;
  await pool.query(createSql);
  // best-effort add columns if missing (some MySQL versions may not support IF NOT EXISTS for ALTER)
  try {
    await pool.query("ALTER TABLE admins ADD COLUMN IF NOT EXISTS displayName VARCHAR(150)");
    await pool.query("ALTER TABLE admins ADD COLUMN IF NOT EXISTS email VARCHAR(200)");
    await pool.query("ALTER TABLE admins ADD COLUMN IF NOT EXISTS phone VARCHAR(50)");
    // add preference column for saving activity logs (default ON)
    await pool.query("ALTER TABLE admins ADD COLUMN IF NOT EXISTS save_activity_logs TINYINT(1) DEFAULT 1");
  } catch (e) {
    // ignore - non-fatal
  }
}

async function findByUsername(username) {
  if (!username) return null;
  const [rows] = await pool.execute(
    'SELECT username, firstName, lastName, dob, password, save_activity_logs FROM admins WHERE username = ? LIMIT 1',
    [username]
  );
  return rows && rows.length ? rows[0] : null;
}

// Check credentials: username + password (plaintext comparison as requested)
async function findByCredentials(username, password) {
  if (!username || !password) return null;
  const [rows] = await pool.execute(
    'SELECT username, firstName, lastName, dob, password, save_activity_logs FROM admins WHERE username = ? AND password = ? LIMIT 1',
    [username, password]
  );
  return rows && rows.length ? rows[0] : null;
}

async function insertAdmin(admin) {
  await ensureTable();
  const columns = ['username','firstName','lastName','dob','password'];
  const vals = [
    admin.username ?? null,
    admin.firstName ?? null,
    admin.lastName ?? null,
    admin.dob ?? null,
    admin.password ?? null,
  ];
  const placeholders = columns.map(() => '?').join(',');
  const sql = `INSERT INTO admins (${columns.join(',')}) VALUES (${placeholders})`;
  const [result] = await pool.execute(sql, vals);
  return result;
}

async function countAdmins() {
  const [rows] = await pool.execute('SELECT COUNT(*) AS cnt FROM admins');
  return rows && rows[0] ? (rows[0].cnt ?? rows[0]['COUNT(*)'] ?? 0) : 0;
}

// Activity table for admin sessions/actions
async function ensureActivityTable() {
  const createSql = `
    CREATE TABLE IF NOT EXISTS admin_activity (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(100) NOT NULL,
      ip VARCHAR(100),
      browser VARCHAR(255),
      ts DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(createSql);
}

async function insertActivity({ username, ip, browser }) {
  await ensureActivityTable();
  const sql = `INSERT INTO admin_activity (username, ip, browser) VALUES (?,?,?)`;
  const [res] = await pool.execute(sql, [username, ip || null, browser || null]);
  return res.insertId;
}

async function getActivitiesByUsername(username, limit = 100) {
  await ensureActivityTable();
  // Some MySQL drivers have issues binding LIMIT as a parameter; interpolate safely as integer.
  const lim = Number(limit) || 100;
  const sql = `SELECT id, browser, ip, ts FROM admin_activity WHERE username = ? ORDER BY ts DESC LIMIT ${lim}`;
  const [rows] = await pool.execute(sql, [username]);
  return rows;
}

async function getAllAdmins() {
  await ensureTable();
  const [rows] = await pool.execute('SELECT username, firstName, lastName FROM admins ORDER BY username ASC');
  return rows || [];
}

async function deleteActivityById(id, username) {
  // Only delete if the record belongs to the username
  const [res] = await pool.execute('DELETE FROM admin_activity WHERE id = ? AND username = ?', [id, username]);
  return res.affectedRows || 0;
}

module.exports = {
  ensureTable,
  findByUsername,
  findByCredentials,
  insertAdmin,
  countAdmins,
  ensureActivityTable,
  insertActivity,
  // update preference for save activity logs
  updateSaveActivity: async function(username, enabled) {
    if (!username) return 0;
    const val = enabled ? 1 : 0;
    const [res] = await pool.execute('UPDATE admins SET save_activity_logs = ? WHERE username = ?', [val, username]);
    return res.affectedRows || 0;
  },
  getActivitiesByUsername,
  deleteActivityById,
  getAllAdmins,
};
