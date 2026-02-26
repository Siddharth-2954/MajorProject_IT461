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

async function countUniquSubjects() {
  await ensureTable();
  const sql = `SELECT COUNT(DISTINCT subject) AS cnt FROM study_materials WHERE subject IS NOT NULL AND subject != ''`;
  const [rows] = await pool.execute(sql);
  return (rows && rows[0] && rows[0].cnt) || 0;
}

async function countAllSubjects() {
  await ensureSubjectsTable();
  const sql = `SELECT COUNT(*) AS cnt FROM subjects`;
  const [rows] = await pool.execute(sql);
  return (rows && rows[0] && rows[0].cnt) || 0;
}

async function ensureSubjectsTable() {
  const createSql = `
    CREATE TABLE IF NOT EXISTS subjects (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      coverImage VARCHAR(500),
      assignedTo VARCHAR(100),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (assignedTo) REFERENCES admins(username) ON DELETE SET NULL
    );
  `;
  await pool.query(createSql);
  
  // Check if assignedTo column exists, if not add it
  try {
    const [cols] = await pool.execute(
      `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'subjects' 
       AND COLUMN_NAME = 'assignedTo'`
    );
    const cnt = (cols && cols[0] && (cols[0].cnt || cols[0]['COUNT(*)'])) ? (cols[0].cnt || cols[0]['COUNT(*)']) : 0;
    if (!cnt) {
      await pool.query("ALTER TABLE subjects ADD COLUMN assignedTo VARCHAR(100)");
      await pool.query("ALTER TABLE subjects ADD FOREIGN KEY (assignedTo) REFERENCES admins(username) ON DELETE SET NULL");
    }
  } catch (e) {
    // Column might already exist
  }
}

async function createSubject({ name, description, coverImage }) {
  await ensureSubjectsTable();
  const sql = `INSERT INTO subjects (name, description, coverImage) VALUES (?, ?, ?)`;
  const [res] = await pool.execute(sql, [name, description || null, coverImage || null]);
  return res.insertId;
}

async function getAllSubjects() {
  await ensureSubjectsTable();
  const sql = `
    SELECT s.id, s.name, s.description, s.coverImage, s.assignedTo, s.createdAt,
           a.firstName, a.lastName, a.displayName
    FROM subjects s
    LEFT JOIN admins a ON s.assignedTo = a.username
    ORDER BY s.createdAt DESC
  `;
  const [rows] = await pool.execute(sql);
  return rows || [];
}

async function getUnassignedSubjects() {
  await ensureSubjectsTable();
  const sql = `
    SELECT id, name, description, coverImage, assignedTo, createdAt
    FROM subjects
    WHERE assignedTo IS NULL
    ORDER BY createdAt DESC
  `;
  const [rows] = await pool.execute(sql);
  return rows || [];
}

async function getAssignedSubjects(adminUsername) {
  await ensureSubjectsTable();
  const sql = `
    SELECT id, name, description, coverImage, assignedTo, createdAt
    FROM subjects
    WHERE assignedTo = ?
    ORDER BY createdAt DESC
  `;
  const [rows] = await pool.execute(sql, [adminUsername]);
  return rows || [];
}

async function assignSubjectToAdmin(subjectId, adminUsername) {
  await ensureSubjectsTable();
  const sql = `UPDATE subjects SET assignedTo = ? WHERE id = ?`;
  const [res] = await pool.execute(sql, [adminUsername, subjectId]);
  return res.affectedRows || 0;
}

async function unassignSubject(subjectId) {
  await ensureSubjectsTable();
  const sql = `UPDATE subjects SET assignedTo = NULL WHERE id = ?`;
  const [res] = await pool.execute(sql, [subjectId]);
  return res.affectedRows || 0;
}

async function deleteSubject(id) {
  await ensureSubjectsTable();
  const sql = `DELETE FROM subjects WHERE id = ?`;
  const [res] = await pool.execute(sql, [id]);
  return res.affectedRows || 0;
}

module.exports = {
  ensureTable,
  insertMaterial,
  listMaterials,
  countUniquSubjects,
  countAllSubjects,
  ensureSubjectsTable,
  createSubject,
  getAllSubjects,
  getUnassignedSubjects,
  getAssignedSubjects,
  assignSubjectToAdmin,
  unassignSubject,
  deleteSubject,
};
