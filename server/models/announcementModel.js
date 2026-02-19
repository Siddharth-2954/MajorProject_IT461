const pool = require('../config/database');
const adminModel = require('./adminModel');

async function ensureTable() {
  // Ensure admins table exists before creating announcements so FK can be added
  try {
    await adminModel.ensureTable();
  } catch (e) {
    // ignore - best effort
  }
  const createSql = `
    CREATE TABLE IF NOT EXISTS announcements (
      id INT PRIMARY KEY AUTO_INCREMENT,
      type VARCHAR(32) NOT NULL,
      title VARCHAR(255) NOT NULL,
      body TEXT,
      author VARCHAR(200),
      admin_username VARCHAR(100) NOT NULL,
      attachment VARCHAR(255),
      ts DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `;
  await pool.query(createSql);
  // Ensure columns exist (safer than relying on ALTER ... IF NOT EXISTS)
  try {
    const [[{ cnt: attachCnt }]] = await pool.query("SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'announcements' AND COLUMN_NAME = 'attachment'");
    if (!attachCnt) {
      await pool.query("ALTER TABLE announcements ADD COLUMN attachment VARCHAR(255)");
    }
  } catch (e) {
    // ignore
  }
  try {
    const [[{ cnt: adminCnt }]] = await pool.query("SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'announcements' AND COLUMN_NAME = 'admin_username'");
    if (!adminCnt) {
      await pool.query("ALTER TABLE announcements ADD COLUMN admin_username VARCHAR(100) DEFAULT NULL");
    }
  } catch (e) {
    // ignore
  }
  // Try creating FK constraint if not already present
  try {
    const [fkRows] = await pool.query("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'announcements' AND COLUMN_NAME = 'admin_username' AND REFERENCED_TABLE_NAME = 'admins'");
    if (!fkRows || fkRows.length === 0) {
      try {
        await pool.query("ALTER TABLE announcements ADD CONSTRAINT fk_ann_admin_username FOREIGN KEY (admin_username) REFERENCES admins(username)");
      } catch (e) {
        // ignore FK creation failures
      }
    }
  } catch (e) {
    // ignore
  }
}
async function insertAnnouncement({ type, title, body, author, attachment, admin_username }) {
  await ensureTable();
  const sql = `INSERT INTO announcements (type, title, body, author, admin_username, attachment) VALUES (?,?,?,?,?,?)`;
  const [res] = await pool.execute(sql, [type || 'lms', title || '', body || null, author || null, admin_username || null, attachment || null]);
  return res.insertId;
}

async function getAnnouncementsByType(type, limit = 100) {
  await ensureTable();
  const lim = Number(limit) || 100;
  const sql = `
    SELECT a.id, a.type, a.title, a.body, a.author, a.admin_username, ad.firstName AS admin_firstName, ad.lastName AS admin_lastName, a.attachment, a.ts
    FROM announcements a
    LEFT JOIN admins ad ON a.admin_username = ad.username
    WHERE LOWER(TRIM(a.type)) = LOWER(TRIM(?))
    ORDER BY a.ts DESC
    LIMIT ${lim}
  `;
  const [rows] = await pool.execute(sql, [type || 'lms']);
  return rows || [];
}

async function getAllAnnouncements(limit = 200) {
  await ensureTable();
  const lim = Number(limit) || 200;
  const sql = `
    SELECT a.id, a.type, a.title, a.body, a.author, a.admin_username, ad.firstName AS admin_firstName, ad.lastName AS admin_lastName, a.attachment, a.ts
    FROM announcements a
    LEFT JOIN admins ad ON a.admin_username = ad.username
    ORDER BY a.ts DESC
    LIMIT ${lim}
  `;
  const [rows] = await pool.execute(sql);
  return rows || [];
}

async function deleteAnnouncementById(id) {
  const [res] = await pool.execute('DELETE FROM announcements WHERE id = ?', [id]);
  return res.affectedRows || 0;
}

async function getAnnouncementById(id) {
  await ensureTable();
  const [rows] = await pool.execute(
    'SELECT a.id, a.type, a.title, a.body, a.author, a.admin_username, ad.firstName AS admin_firstName, ad.lastName AS admin_lastName, a.attachment, a.ts FROM announcements a LEFT JOIN admins ad ON a.admin_username = ad.username WHERE a.id = ? LIMIT 1',
    [id]
  );
  return (rows && rows[0]) || null;
}
module.exports = {
  ensureTable,
  insertAnnouncement,
  getAnnouncementsByType,
  getAllAnnouncements,
  deleteAnnouncementById,
  getAnnouncementById,
};