const pool = require("../config/database");

const MCQQuizModel = {
  // Ensure quiz tables exist
  async ensureTables() {
    try {
      async function columnExists(tableName, columnName) {
        try {
          const [rows] = await pool.query(
            `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS 
             WHERE TABLE_SCHEMA = DATABASE() 
             AND TABLE_NAME = ? 
             AND COLUMN_NAME = ?`,
            [tableName, columnName]
          );
          return rows[0].cnt > 0;
        } catch (err) {
          return false;
        }
      }

      // Create quizzes table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS quizzes (
          id INT PRIMARY KEY AUTO_INCREMENT,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          subjectId INT,
          chapterId INT,
          createdByUsername VARCHAR(100),
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      if (!(await columnExists('quizzes', 'createdByUsername'))) {
        await pool.query("ALTER TABLE quizzes ADD COLUMN createdByUsername VARCHAR(100)");
      }

      // Create quiz_questions table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS quiz_questions (
          id INT PRIMARY KEY AUTO_INCREMENT,
          quizId INT NOT NULL,
          questionNumber INT NOT NULL,
          questionText TEXT NOT NULL,
          correctAnswerIndex INT,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE,
          UNIQUE KEY unique_question (quizId, questionNumber)
        )
      `);

      // Create quiz_options table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS quiz_options (
          id INT PRIMARY KEY AUTO_INCREMENT,
          questionId INT NOT NULL,
          optionIndex INT NOT NULL,
          optionText TEXT NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (questionId) REFERENCES quiz_questions(id) ON DELETE CASCADE,
          UNIQUE KEY unique_option (questionId, optionIndex)
        )
      `);

      // Create quiz_submissions table for tracking student performance
      await pool.query(`
        CREATE TABLE IF NOT EXISTS quiz_submissions (
          id INT PRIMARY KEY AUTO_INCREMENT,
          studentRegistrationId VARCHAR(100) NOT NULL,
          quizId INT NOT NULL,
          score INT NOT NULL,
          totalQuestions INT NOT NULL,
          submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE,
          FOREIGN KEY (studentRegistrationId) REFERENCES students(registrationId) ON DELETE CASCADE
        )
      `);

      console.log("Quiz tables ensured");
    } catch (err) {
      console.error("Error ensuring quiz tables:", err);
      throw err;
    }
  },

  // Create new quiz with questions and options
  async createQuiz(quizData) {
    let connection;
    try {
      await this.ensureTables();
      connection = await pool.getConnection();
      await connection.beginTransaction();

      // Insert quiz
      const [quizResult] = await connection.query(
        `INSERT INTO quizzes (title, description, subjectId, chapterId, createdByUsername)
         VALUES (?, ?, ?, ?, ?)`,
        [
          quizData.title,
          quizData.description || null,
          quizData.subjectId,
          quizData.chapterId,
          quizData.createdByUsername || null,
        ]
      );

      const quizId = quizResult.insertId;

      // Insert questions and options
      for (let i = 0; i < quizData.questions.length; i++) {
        const question = quizData.questions[i];

        // Insert question
        const [questionResult] = await connection.query(
          `INSERT INTO quiz_questions (quizId, questionNumber, questionText, correctAnswerIndex)
           VALUES (?, ?, ?, ?)`,
          [quizId, i + 1, question.question, question.correctAnswer]
        );

        const questionId = questionResult.insertId;

        // Insert options
        for (let j = 0; j < question.options.length; j++) {
          await connection.query(
            `INSERT INTO quiz_options (questionId, optionIndex, optionText)
             VALUES (?, ?, ?)`,
            [questionId, j, question.options[j]]
          );
        }
      }

      await connection.commit();
      return quizId;
    } catch (err) {
      if (connection) {
        await connection.rollback();
      }
      console.error("Error creating quiz:", err);
      throw err;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  },

  // Get quiz by ID with all questions and options
  async getQuizById(quizId) {
    try {
      const [quizRows] = await pool.query(
        `SELECT * FROM quizzes WHERE id = ?`,
        [quizId]
      );

      if (quizRows.length === 0) {
        return null;
      }

      const quiz = quizRows[0];

      // Get questions
      const [questions] = await pool.query(
        `SELECT * FROM quiz_questions WHERE quizId = ? ORDER BY questionNumber`,
        [quizId]
      );

      // Get options for each question
      const questionsWithOptions = await Promise.all(
        questions.map(async (q) => {
          const [options] = await pool.query(
            `SELECT * FROM quiz_options WHERE questionId = ? ORDER BY optionIndex`,
            [q.id]
          );
          return {
            ...q,
            options: options.map((o) => o.optionText),
          };
        })
      );

      return {
        ...quiz,
        questions: questionsWithOptions,
      };
    } catch (err) {
      console.error("Error getting quiz:", err);
      throw err;
    }
  },

  // Get quizzes by subject and chapter
  async getQuizzesBySubjectAndChapter(subjectId, chapterId) {
    try {
      const [quizzes] = await pool.query(
        `SELECT id, title, description, createdAt FROM quizzes 
         WHERE subjectId = ? AND chapterId = ? 
         ORDER BY createdAt DESC`,
        [subjectId, chapterId]
      );
      return quizzes;
    } catch (err) {
      console.error("Error getting quizzes:", err);
      throw err;
    }
  },

  // Delete quiz
  async deleteQuiz(quizId) {
    try {
      const [result] = await pool.query(
        `DELETE FROM quizzes WHERE id = ?`,
        [quizId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      console.error("Error deleting quiz:", err);
      throw err;
    }
  },

  // Submit quiz answers
  async submitQuizAnswers(studentRegistrationId, quizId, answers) {
    try {
      await this.ensureTables();
      
      // Get quiz with questions
      const quiz = await this.getQuizById(quizId);
      if (!quiz) {
        throw new Error("Quiz not found");
      }

      // Calculate score
      let correctCount = 0;
      const totalQuestions = quiz.questions.length;

      quiz.questions.forEach((question, index) => {
        const studentAnswer = answers[index];
        if (studentAnswer === question.correctAnswerIndex) {
          correctCount++;
        }
      });

      // Save submission
      const [result] = await pool.query(
        `INSERT INTO quiz_submissions (studentRegistrationId, quizId, score, totalQuestions)
         VALUES (?, ?, ?, ?)`,
        [studentRegistrationId, quizId, correctCount, totalQuestions]
      );

      return {
        submissionId: result.insertId,
        score: correctCount,
        totalQuestions,
        percentage: Math.round((correctCount / totalQuestions) * 100),
      };
    } catch (err) {
      console.error("Error submitting quiz:", err);
      throw err;
    }
  },

  // Get student statistics by subject
  async getStudentStatsBySubject(studentRegistrationId) {
    try {
      await this.ensureTables();
      
      const [rows] = await pool.query(
        `SELECT 
          s.id as subjectId,
          s.name as subjectName,
          COUNT(DISTINCT q.id) as totalQuizzes,
          COUNT(DISTINCT qq.id) as totalQuestions,
          COALESCE((
            SELECT SUM(t.score)
            FROM (
              SELECT qs1.quizId, qs1.score
              FROM quiz_submissions qs1
              INNER JOIN (
                SELECT quizId, MAX(submittedAt) as maxSubmittedAt
                FROM quiz_submissions
                WHERE studentRegistrationId = ?
                GROUP BY quizId
              ) qs2 ON qs1.quizId = qs2.quizId AND qs1.submittedAt = qs2.maxSubmittedAt
              WHERE qs1.studentRegistrationId = ?
                AND qs1.quizId IN (SELECT id FROM quizzes WHERE subjectId = s.id)
            ) t
          ), 0) as correctAnswers,
          (
            SELECT COUNT(DISTINCT quizId)
            FROM quiz_submissions
            WHERE studentRegistrationId = ?
              AND quizId IN (SELECT id FROM quizzes WHERE subjectId = s.id)
          ) as completedQuizzes
         FROM subjects s
         LEFT JOIN quizzes q ON s.id = q.subjectId
         LEFT JOIN quiz_questions qq ON q.id = qq.quizId
         GROUP BY s.id, s.name
         ORDER BY s.name`,
        [studentRegistrationId, studentRegistrationId, studentRegistrationId]
      );

      return rows.map((row) => ({
        subjectId: row.subjectId,
        subjectName: row.subjectName,
        totalQuestions: row.totalQuestions || 0,
        correctAnswers: row.correctAnswers || 0,
        completedQuizzes: row.completedQuizzes || 0,
        percentage:
          row.totalQuestions > 0
            ? Math.round((row.correctAnswers / row.totalQuestions) * 100)
            : 0,
      }));
    } catch (err) {
      console.error("Error getting student stats:", err);
      throw err;
    }
  },

  // Get all quizzes for a subject
  async getQuizzesBySubject(subjectId) {
    try {
      const [quizzes] = await pool.query(
        `SELECT q.id, q.title, q.description, q.createdAt,
          (SELECT COUNT(*) FROM quiz_questions WHERE quizId = q.id) as questionCount
         FROM quizzes q
         WHERE q.subjectId = ?
         ORDER BY q.createdAt DESC`,
        [subjectId]
      );
      return quizzes;
    } catch (err) {
      console.error("Error getting quizzes by subject:", err);
      throw err;
    }
  },
};

module.exports = MCQQuizModel;
