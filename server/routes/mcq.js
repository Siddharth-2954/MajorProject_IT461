const express = require('express');
const MCQQuizController = require('../controllers/quizController');
const requireSuperAdmin = require('../middleware/requireSuperAdmin');

const router = express.Router();

// Initialize tables on startup
router.post("/init", MCQQuizController.initialize);

// Create quiz (only super admin)
router.post("/quizzes", requireSuperAdmin, MCQQuizController.createQuiz);

// Get quiz by ID
router.get("/quizzes/:quizId", MCQQuizController.getQuiz);

// Get chapters by subject
router.get("/subjects/:subjectId/chapters", MCQQuizController.getChaptersBySubject);

// Get quizzes by chapter
router.get("/chapters/:subjectId/:chapterId", MCQQuizController.getQuizzesByChapter);

// Get quizzes by subject
router.get("/subjects/:subjectId", MCQQuizController.getQuizzesBySubject);

// Submit quiz answers
router.post("/quizzes/:quizId/submit", MCQQuizController.submitQuiz);

// Get student statistics
router.get("/student/stats", MCQQuizController.getStudentStats);

// Delete quiz (only super admin)
router.delete("/quizzes/:quizId", requireSuperAdmin, MCQQuizController.deleteQuiz);

module.exports = router;
