const MCQQuizModel = require("../models/quizModel");

const MCQQuizController = {
  // Initialize quiz tables on startup
  async initialize(req, res) {
    try {
      await MCQQuizModel.ensureTables();
      res.json({ success: true, message: "Quiz tables initialized" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to initialize quiz tables" });
    }
  },

  // Create new quiz
  async createQuiz(req, res) {
    try {
      const { title, description, subjectId, chapterId, questionCount, questions } = req.body;
      
      // Validation
      if (!title || !subjectId || !chapterId || !questions || questions.length === 0) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Get admin from session (super admin env account may not have an id)
      const adminSession = req.session && req.session.admin;
      if (!adminSession) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      if (adminSession.role !== "super_admin") {
        return res.status(403).json({ error: "Super admin required" });
      }
      const createdByUsername = adminSession.username || null;

      // Create quiz
      const quizId = await MCQQuizModel.createQuiz({
        title,
        description,
        subjectId,
        chapterId,
        questions,
        createdByUsername,
      });

      res.status(201).json({
        success: true,
        quizId,
        message: "Quiz created successfully",
      });
    } catch (err) {
      console.error("Error creating quiz:", err);
      res.status(500).json({ error: "Failed to create quiz" });
    }
  },

  // Get quiz by ID
  async getQuiz(req, res) {
    try {
      const { quizId } = req.params;
      const quiz = await MCQQuizModel.getQuizById(quizId);

      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }

      res.json(quiz);
    } catch (err) {
      console.error("Error getting quiz:", err);
      res.status(500).json({ error: "Failed to get quiz" });
    }
  },

  // Get quizzes by subject and chapter
  async getQuizzesByChapter(req, res) {
    try {
      const { subjectId, chapterId } = req.params;
      const quizzes = await MCQQuizModel.getQuizzesBySubjectAndChapter(subjectId, chapterId);

      res.json({
        success: true,
        quizzes,
        count: quizzes.length,
      });
    } catch (err) {
      console.error("Error getting quizzes:", err);
      res.status(500).json({ error: "Failed to get quizzes" });
    }
  },

  // Delete quiz
  async deleteQuiz(req, res) {
    try {
      const { quizId } = req.params;
      const success = await MCQQuizModel.deleteQuiz(quizId);

      if (!success) {
        return res.status(404).json({ error: "Quiz not found" });
      }

      res.json({ success: true, message: "Quiz deleted successfully" });
    } catch (err) {
      console.error("Error deleting quiz:", err);
      res.status(500).json({ error: "Failed to delete quiz" });
    }
  },

  // Submit quiz answers
  async submitQuiz(req, res) {
    try {
      const { quizId } = req.params;
      const { answers } = req.body;

      // Get student from session
      const studentSession = req.session && req.session.user;
      if (!studentSession || !studentSession.registrationId) {
        return res.status(401).json({ error: "Student not authenticated" });
      }

      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: "Invalid answers format" });
      }

      const result = await MCQQuizModel.submitQuizAnswers(studentSession.registrationId, quizId, answers);

      res.json({
        success: true,
        ...result,
      });
    } catch (err) {
      console.error("Error submitting quiz:", err);
      res.status(500).json({ error: "Failed to submit quiz" });
    }
  },

  // Get student statistics
  async getStudentStats(req, res) {
    try {
      // Get student from session
      const studentSession = req.session && req.session.user;
      if (!studentSession || !studentSession.registrationId) {
        return res.status(401).json({ error: "Student not authenticated" });
      }

      const stats = await MCQQuizModel.getStudentStatsBySubject(studentSession.registrationId);

      res.json({
        success: true,
        stats,
      });
    } catch (err) {
      console.error("Error getting student stats:", err);
      res.status(500).json({ error: "Failed to get student stats" });
    }
  },

  // Get all quizzes for a subject
  async getQuizzesBySubject(req, res) {
    try {
      const { subjectId } = req.params;
      const quizzes = await MCQQuizModel.getQuizzesBySubject(subjectId);

      res.json({
        success: true,
        quizzes,
      });
    } catch (err) {
      console.error("Error getting quizzes by subject:", err);
      res.status(500).json({ error: "Failed to get quizzes" });
    }
  },

  // Get chapters by subject
  async getChaptersBySubject(req, res) {
    try {
      const { subjectId } = req.params;
      const chapterModel = require('../models/chapterModel');
      const chapters = await chapterModel.getChaptersBySubject(subjectId);

      res.json({
        success: true,
        chapters,
      });
    } catch (err) {
      console.error("Error getting chapters:", err);
      res.status(500).json({ error: "Failed to get chapters" });
    }
  },
};

module.exports = MCQQuizController;
