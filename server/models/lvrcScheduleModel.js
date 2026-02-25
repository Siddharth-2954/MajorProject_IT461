const pool = require('../config/database');

async function ensureSubjectsTable() {
  try {
    const createSql = `
      CREATE TABLE IF NOT EXISTS subjects (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        coverImage VARCHAR(500),
        assignedTo VARCHAR(100),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createSql);
    
    try {
      await pool.query(
        `ALTER TABLE subjects ADD FOREIGN KEY (assignedTo) REFERENCES admins(username) ON DELETE SET NULL`
      );
    } catch (e) {
      console.log('Note: Foreign key for subjects.assignedTo could not be added:', e.message);
    }
  } catch (err) {
    console.error('ensureSubjectsTable error:', err);
    throw err;
  }
}

async function ensureTable() {
  try {
    await ensureSubjectsTable();
    console.log('Subjects table ensured');
    
    const createSql = `
      CREATE TABLE IF NOT EXISTS lvrc_schedules (
        id INT PRIMARY KEY AUTO_INCREMENT,
        subjectId INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        scheduledDate DATE NOT NULL,
        startTime TIME NOT NULL,
        endTime TIME NOT NULL,
        instructorName VARCHAR(255),
        meetingLink VARCHAR(500),
        capacity INT DEFAULT 50,
        relatedLvcScheduleId INT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_subject (subjectId),
        KEY idx_date (scheduledDate),
        KEY idx_related_lvc (relatedLvcScheduleId)
      );
    `;
    await pool.query(createSql);
    console.log('LVRC schedules table ensured');
    
    try {
      await pool.query(
        `ALTER TABLE lvrc_schedules ADD FOREIGN KEY (subjectId) REFERENCES subjects(id) ON DELETE CASCADE`
      );
    } catch (e) {
      console.log('Note: Foreign key for lvrc_schedules.subjectId could not be added:', e.message);
    }
  } catch (err) {
    console.error('ensureTable error:', err);
    throw err;
  }
}

async function createSchedule({ subjectId, title, description, scheduledDate, startTime, endTime, instructorName, meetingLink, capacity, relatedLvcScheduleId }) {
  try {
    await ensureTable();
    const sql = `
      INSERT INTO lvrc_schedules (subjectId, title, description, scheduledDate, startTime, endTime, instructorName, meetingLink, capacity, relatedLvcScheduleId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [res] = await pool.execute(sql, [
      subjectId,
      title,
      description || null,
      scheduledDate,
      startTime,
      endTime,
      instructorName || null,
      meetingLink || null,
      capacity || 50,
      relatedLvcScheduleId || null
    ]);
    console.log('LVRC Schedule created with ID:', res.insertId);
    return res.insertId;
  } catch (err) {
    console.error('createSchedule error:', err);
    throw err;
  }
}

async function getSchedulesBySubject(subjectId) {
  try {
    await ensureTable();
    const sql = `
      SELECT id, subjectId, title, description, scheduledDate, startTime, endTime, 
             instructorName, meetingLink, capacity, relatedLvcScheduleId, createdAt, updatedAt
      FROM lvrc_schedules
      WHERE subjectId = ?
      ORDER BY scheduledDate ASC, startTime ASC
    `;
    const [rows] = await pool.execute(sql, [subjectId]);
    return rows || [];
  } catch (err) {
    console.error('getSchedulesBySubject error:', err);
    throw err;
  }
}

async function getScheduleById(id) {
  try {
    await ensureTable();
    const sql = `
      SELECT id, subjectId, title, description, scheduledDate, startTime, endTime,
             instructorName, meetingLink, capacity, relatedLvcScheduleId, createdAt, updatedAt
      FROM lvrc_schedules
      WHERE id = ?
    `;
    const [rows] = await pool.execute(sql, [id]);
    return rows?.[0] || null;
  } catch (err) {
    console.error('getScheduleById error:', err);
    throw err;
  }
}

async function getAllSchedules(limit = 100) {
  try {
    await ensureTable();
    // Ensure limit is a valid integer
    const limitValue = Math.max(1, Math.min(parseInt(limit, 10) || 100, 10000));
    
    const sql = `
      SELECT s.id, s.subjectId, s.title, s.description, s.scheduledDate, s.startTime, s.endTime,
             s.instructorName, s.meetingLink, s.capacity, s.relatedLvcScheduleId, s.createdAt, s.updatedAt,
             COALESCE(sub.name, 'Unknown Subject') as subjectName
      FROM lvrc_schedules s
      LEFT JOIN subjects sub ON s.subjectId = sub.id
      ORDER BY s.scheduledDate DESC, s.startTime DESC
      LIMIT ${limitValue}
    `;
    console.log('getAllSchedules query (LVRC)');
    const [rows] = await pool.query(sql);
    console.log('getAllSchedules result rows (LVRC):', rows);
    return rows || [];
  } catch (err) {
    console.error('getAllSchedules error (LVRC):', err);
    // Fallback query without join
    try {
      const limitValue = Math.max(1, Math.min(parseInt(limit, 10) || 100, 10000));
      const fallbackSql = `
        SELECT id, subjectId, title, description, scheduledDate, startTime, endTime,
               instructorName, meetingLink, capacity, relatedLvcScheduleId, createdAt, updatedAt
        FROM lvrc_schedules
        ORDER BY scheduledDate DESC, startTime DESC
        LIMIT ${limitValue}
      `;
      console.log('Using fallback query (LVRC - no join)');
      const [fallbackRows] = await pool.query(fallbackSql);
      return fallbackRows || [];
    } catch (fallbackErr) {
      console.error('getAllSchedules fallback error (LVRC):', fallbackErr);
      return [];
    }
  }
}

async function updateSchedule(id, { title, description, scheduledDate, startTime, endTime, instructorName, meetingLink, capacity }) {
  try {
    await ensureTable();
    const sql = `
      UPDATE lvrc_schedules 
      SET title = ?, description = ?, scheduledDate = ?, startTime = ?, endTime = ?,
          instructorName = ?, meetingLink = ?, capacity = ?
      WHERE id = ?
    `;
    const [res] = await pool.execute(sql, [
      title,
      description || null,
      scheduledDate,
      startTime,
      endTime,
      instructorName || null,
      meetingLink || null,
      capacity || 50,
      id
    ]);
    console.log('LVRC Schedule updated:', id);
    return res.affectedRows;
  } catch (err) {
    console.error('updateSchedule error (LVRC):', err);
    throw err;
  }
}

async function deleteSchedule(id) {
  try {
    await ensureTable();
    const sql = `DELETE FROM lvrc_schedules WHERE id = ?`;
    const [res] = await pool.execute(sql, [id]);
    console.log('LVRC Schedule deleted:', id);
    return res.affectedRows;
  } catch (err) {
    console.error('deleteSchedule error (LVRC):', err);
    throw err;
  }
}

module.exports = {
  createSchedule,
  getSchedulesBySubject,
  getScheduleById,
  getAllSchedules,
  updateSchedule,
  deleteSchedule,
  ensureTable
};
