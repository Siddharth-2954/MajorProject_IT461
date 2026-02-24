const pool = require('../config/database');

async function ensureTable() {
  const createSql = `
    CREATE TABLE IF NOT EXISTS study_materials (
      id INT PRIMARY KEY AUTO_INCREMENT,
      topic VARCHAR(255) NOT NULL,
      uploaderName VARCHAR(200),
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      category ENUM('Notes','Assignment') DEFAULT 'Notes',
      subject VARCHAR(150),
      fileUrl VARCHAR(500),
      fileName VARCHAR(255),
      fileType VARCHAR(50) DEFAULT 'PDF'
    );
  `;
  await pool.query(createSql);
  try {
    const [cols] = await pool.execute("SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'study_materials' AND COLUMN_NAME = 'subject'");
    const cnt = (cols && cols[0] && (cols[0].cnt || cols[0]['COUNT(*)'])) ? (cols[0].cnt || cols[0]['COUNT(*)']) : 0;
    if (!cnt) {
      await pool.query("ALTER TABLE study_materials ADD COLUMN subject VARCHAR(150)");
    }
  } catch (e) {
    // ignore - some environments may not allow information_schema access or ALTER
  }
}

async function insertMaterial({ topic, uploaderName, category, subject, fileUrl, fileName, fileType }) {
  await ensureTable();
  const sql = `INSERT INTO study_materials (topic, uploaderName, category, subject, fileUrl, fileName, fileType) VALUES (?,?,?,?,?,?,?)`;
  const [res] = await pool.execute(sql, [topic || null, uploaderName || null, category || 'Notes', subject || null, fileUrl || null, fileName || null, fileType || 'PDF']);
  return res.insertId;
}

async function listMaterials(limit = 100) {
  await ensureTable();
  const lim = Number(limit) || 100;
  const sql = `SELECT id, topic, uploaderName, date, category, subject, fileUrl, fileName, fileType FROM study_materials ORDER BY date DESC LIMIT ${lim}`;
  const [rows] = await pool.execute(sql);
  return rows || [];
}

module.exports = {
  ensureTable,
  insertMaterial,
  listMaterials,
};
