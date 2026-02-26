const pool = require('../config/database');

async function ensureTable() {
  const createSql = `
    CREATE TABLE IF NOT EXISTS chapters (
      id INT PRIMARY KEY AUTO_INCREMENT,
      subjectId INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_subject (subjectId),
      UNIQUE KEY unique_subject_chapter (subjectId, name),
      FOREIGN KEY (subjectId) REFERENCES subjects(id) ON DELETE CASCADE
    );
  `;
  try {
    await pool.query(createSql);
  } catch (err) {
    if (err.code !== 'ER_TABLE_EXISTS_ERROR') {
      throw err;
    }
  }
}

async function createChapter({ subjectId, name, description }) {
  await ensureTable();
  const sql = `
    INSERT INTO chapters (subjectId, name, description)
    VALUES (?, ?, ?)
  `;
  const [res] = await pool.execute(sql, [subjectId, name, description || null]);
  return res.insertId;
}

async function getChaptersBySubject(subjectId) {
  await ensureTable();
  const sql = `
    SELECT id, subjectId, name, description, createdAt, updatedAt
    FROM chapters
    WHERE subjectId = ?
    ORDER BY createdAt ASC
  `;
  const [rows] = await pool.execute(sql, [subjectId]);
  return rows || [];
}

async function getChapterById(id) {
  await ensureTable();
  const sql = `
    SELECT id, subjectId, name, description, createdAt, updatedAt
    FROM chapters
    WHERE id = ?
  `;
  const [rows] = await pool.execute(sql, [id]);
  return rows?.[0] || null;
}

async function updateChapter(id, { name, description }) {
  await ensureTable();
  const sql = `
    UPDATE chapters
    SET name = ?, description = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  const [res] = await pool.execute(sql, [name, description || null, id]);
  return res.affectedRows || 0;
}

async function deleteChapter(id) {
  await ensureTable();
  const sql = `DELETE FROM chapters WHERE id = ?`;
  const [res] = await pool.execute(sql, [id]);
  return res.affectedRows || 0;
}

module.exports = {
  ensureTable,
  createChapter,
  getChaptersBySubject,
  getChapterById,
  updateChapter,
  deleteChapter,
};
