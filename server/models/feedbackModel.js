const pool = require('../config/database');

async function ensureTable() {
  try {
    const createSql = `
      CREATE TABLE IF NOT EXISTS feedbacks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        scheduleId INT NOT NULL,
        scheduleType VARCHAR(50) NOT NULL COMMENT 'lvc or lvrc',
        studentId VARCHAR(255) NOT NULL,
        studentName VARCHAR(255),
        studentEmail VARCHAR(255),
        lectureDate DATE,
        session VARCHAR(50) COMMENT 'morning, afternoon, evening',
        subject VARCHAR(255),
        instructor VARCHAR(255),
        topic TEXT,
        quality INT COMMENT 'Rating 1-5',
        aligned VARCHAR(50),
        explanation VARCHAR(100),
        pace VARCHAR(50),
        interaction VARCHAR(100),
        timings VARCHAR(50),
        av_quality VARCHAR(100),
        technical_issues TEXT,
        feedback_ease VARCHAR(100),
        escalation_awareness VARCHAR(50),
        escalation_experience TEXT,
        feedback_valued VARCHAR(50),
        material_provided VARCHAR(50),
        material_quality INT,
        material_aligned VARCHAR(50),
        material_suggestions TEXT,
        language_clarity VARCHAR(100),
        language_preference VARCHAR(50),
        language_suggestions TEXT,
        liked_most TEXT,
        could_improve TEXT,
        other_comments TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_schedule (scheduleId),
        KEY idx_type (scheduleType),
        KEY idx_student (studentId),
        KEY idx_date (lectureDate)
      );
    `;
    await pool.query(createSql);
    console.log('Feedbacks table ensured');
  } catch (err) {
    console.error('ensureTable error:', err);
    throw err;
  }
}

async function addFeedback(feedbackData) {
  try {
    await ensureTable();
    const {
      scheduleId,
      scheduleType,
      studentId,
      studentName,
      studentEmail,
      lectureDate,
      session,
      subject,
      instructor,
      topic,
      quality,
      aligned,
      explanation,
      pace,
      interaction,
      timings,
      av_quality,
      technical_issues,
      feedback_ease,
      escalation_awareness,
      escalation_experience,
      feedback_valued,
      material_provided,
      material_quality,
      material_aligned,
      material_suggestions,
      language_clarity,
      language_preference,
      language_suggestions,
      liked_most,
      could_improve,
      other_comments
    } = feedbackData;

    const sql = `
      INSERT INTO feedbacks (
        scheduleId, scheduleType, studentId, studentName, studentEmail,
        lectureDate, session, subject, instructor, topic,
        quality, aligned, explanation, pace, interaction, timings,
        av_quality, technical_issues, feedback_ease, escalation_awareness,
        escalation_experience, feedback_valued, material_provided, material_quality,
        material_aligned, material_suggestions, language_clarity, language_preference,
        language_suggestions, liked_most, could_improve, other_comments
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [res] = await pool.execute(sql, [
      scheduleId,
      scheduleType,
      studentId,
      studentName || null,
      studentEmail || null,
      lectureDate || null,
      session || null,
      subject || null,
      instructor || null,
      topic || null,
      quality || null,
      aligned || null,
      explanation || null,
      pace || null,
      interaction || null,
      timings || null,
      av_quality || null,
      technical_issues || null,
      feedback_ease || null,
      escalation_awareness || null,
      escalation_experience || null,
      feedback_valued || null,
      material_provided || null,
      material_quality || null,
      material_aligned || null,
      material_suggestions || null,
      language_clarity || null,
      language_preference || null,
      language_suggestions || null,
      liked_most || null,
      could_improve || null,
      other_comments || null
    ]);

    console.log('Feedback added with ID:', res.insertId);
    return res.insertId;
  } catch (err) {
    console.error('addFeedback error:', err);
    throw err;
  }
}

async function getFeedbacksByScheduleType(scheduleType = 'lvc', limit = 100, offset = 0) {
  try {
    await ensureTable();
    const safeLimit = Number.isFinite(Number(limit)) ? Math.max(0, Number(limit)) : 100;
    const safeOffset = Number.isFinite(Number(offset)) ? Math.max(0, Number(offset)) : 0;
    const sql = `
      SELECT * FROM feedbacks
      WHERE scheduleType = ?
      ORDER BY createdAt DESC
      LIMIT ${safeLimit} OFFSET ${safeOffset}
    `;
    const [rows] = await pool.execute(sql, [scheduleType]);
    return rows;
  } catch (err) {
    console.error('getFeedbacksByScheduleType error:', err);
    throw err;
  }
}

async function getFeedbacksBySchedule(scheduleId, scheduleType = 'lvc') {
  try {
    await ensureTable();
    const sql = `
      SELECT * FROM feedbacks
      WHERE scheduleId = ? AND scheduleType = ?
      ORDER BY createdAt DESC
    `;
    const [rows] = await pool.execute(sql, [scheduleId, scheduleType]);
    return rows;
  } catch (err) {
    console.error('getFeedbacksBySchedule error:', err);
    throw err;
  }
}

async function getFeedbackCount(scheduleType = 'lvc') {
  try {
    await ensureTable();
    const sql = `SELECT COUNT(*) as count FROM feedbacks WHERE scheduleType = ?`;
    const [rows] = await pool.execute(sql, [scheduleType]);
    return rows[0]?.count || 0;
  } catch (err) {
    console.error('getFeedbackCount error:', err);
    throw err;
  }
}

async function getFeedbackById(id) {
  try {
    await ensureTable();
    const sql = `SELECT * FROM feedbacks WHERE id = ?`;
    const [rows] = await pool.execute(sql, [id]);
    return rows[0] || null;
  } catch (err) {
    console.error('getFeedbackById error:', err);
    throw err;
  }
}

async function deleteFeedback(id) {
  try {
    await ensureTable();
    const sql = `DELETE FROM feedbacks WHERE id = ?`;
    const [res] = await pool.execute(sql, [id]);
    return res.affectedRows > 0;
  } catch (err) {
    console.error('deleteFeedback error:', err);
    throw err;
  }
}

module.exports = {
  ensureTable,
  addFeedback,
  getFeedbacksByScheduleType,
  getFeedbacksBySchedule,
  getFeedbackCount,
  getFeedbackById,
  deleteFeedback
};
