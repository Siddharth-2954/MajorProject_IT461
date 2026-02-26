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
    
    // Try to add foreign key if it doesn't exist
    try {
      await pool.query(
        `ALTER TABLE subjects ADD FOREIGN KEY (assignedTo) REFERENCES admins(username) ON DELETE SET NULL`
      );
    } catch (e) {
      // Foreign key might already exist or admins table might not exist yet
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
      CREATE TABLE IF NOT EXISTS lvc_schedules (
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
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_subject (subjectId),
        KEY idx_date (scheduledDate)
      );
    `;
    await pool.query(createSql);
    console.log('LVC schedules table ensured');
    
    // Try to add foreign key if it doesn't exist
    try {
      await pool.query(
        `ALTER TABLE lvc_schedules ADD FOREIGN KEY (subjectId) REFERENCES subjects(id) ON DELETE CASCADE`
      );
    } catch (e) {
      console.log('Note: Foreign key for lvc_schedules.subjectId could not be added:', e.message);
    }
  } catch (err) {
    console.error('ensureTable error:', err);
    throw err;
  }
}

async function createSchedule({ subjectId, title, description, scheduledDate, startTime, endTime, instructorName, meetingLink, capacity }) {
  try {
    await ensureTable();
    const sql = `
      INSERT INTO lvc_schedules (subjectId, title, description, scheduledDate, startTime, endTime, instructorName, meetingLink, capacity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      capacity || 50
    ]);
    console.log('Schedule created with ID:', res.insertId);
    return res.insertId;
  } catch (err) {
    console.error('createSchedule error:', err);
    throw err;
  }
}

async function getSchedulesBySubject(subjectId) {
  await ensureTable();
  const sql = `
    SELECT id, subjectId, title, description,
           DATE_FORMAT(scheduledDate, '%Y-%m-%d') AS scheduledDate,
           startTime, endTime, instructorName, meetingLink, capacity, createdAt, updatedAt
    FROM lvc_schedules
    WHERE subjectId = ?
    ORDER BY scheduledDate ASC, startTime ASC
  `;
  const [rows] = await pool.execute(sql, [subjectId]);
  return rows || [];
}

async function getScheduleById(id) {
  await ensureTable();
  const sql = `
    SELECT id, subjectId, title, description,
           DATE_FORMAT(scheduledDate, '%Y-%m-%d') AS scheduledDate,
           startTime, endTime, instructorName, meetingLink, capacity, createdAt, updatedAt
    FROM lvc_schedules
    WHERE id = ?
  `;
  const [rows] = await pool.execute(sql, [id]);
  return rows?.[0] || null;
}

async function getAllSchedules(limit = 100) {
  try {
    await ensureTable();
    // Ensure limit is a valid integer
    const limitValue = Math.max(1, Math.min(parseInt(limit, 10) || 100, 10000));
    
    const sql = `
      SELECT s.id, s.subjectId, s.title, s.description,
             DATE_FORMAT(s.scheduledDate, '%Y-%m-%d') AS scheduledDate,
             s.startTime, s.endTime, s.instructorName, s.meetingLink, s.capacity, s.createdAt, s.updatedAt,
             COALESCE(sub.name, 'Unknown Subject') as subjectName
      FROM lvc_schedules s
      LEFT JOIN subjects sub ON s.subjectId = sub.id
      ORDER BY s.scheduledDate DESC, s.startTime DESC
      LIMIT ${limitValue}
    `;
    console.log('getAllSchedules query:', sql);
    const [rows] = await pool.query(sql);
    console.log('getAllSchedules result rows:', rows);
    return rows || [];
  } catch (err) {
    console.error('getAllSchedules error:', err);
    // If JOIN fails, try without join
    try {
      const limitValue = Math.max(1, Math.min(parseInt(limit, 10) || 100, 10000));
      const fallbackSql = `
        SELECT id, subjectId, title, description,
               DATE_FORMAT(scheduledDate, '%Y-%m-%d') AS scheduledDate,
               startTime, endTime, instructorName, meetingLink, capacity, createdAt, updatedAt
        FROM lvc_schedules
        ORDER BY scheduledDate DESC, startTime DESC
        LIMIT ${limitValue}
      `;
      console.log('Using fallback query (no join)');
      const [fallbackRows] = await pool.query(fallbackSql);
      return fallbackRows || [];
    } catch (fallbackErr) {
      console.error('getAllSchedules fallback error:', fallbackErr);
      return [];
    }
  }
}

async function updateSchedule(id, { title, description, scheduledDate, startTime, endTime, instructorName, meetingLink, capacity }) {
  await ensureTable();
  const sql = `
    UPDATE lvc_schedules 
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
  return res.affectedRows || 0;
}

async function deleteSchedule(id) {
  await ensureTable();
  const sql = `DELETE FROM lvc_schedules WHERE id = ?`;
  const [res] = await pool.execute(sql, [id]);
  return res.affectedRows || 0;
}

module.exports = {
  ensureTable,
  createSchedule,
  getSchedulesBySubject,
  getScheduleById,
  getAllSchedules,
  updateSchedule,
  deleteSchedule,
};
