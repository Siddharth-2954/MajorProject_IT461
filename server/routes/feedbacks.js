const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const requireSuperAdmin = require('../middleware/requireSuperAdmin');

// Add feedback (students submit)
router.post('/', feedbackController.addFeedback);

// Get all feedbacks by type (super admin only)
router.get('/', requireSuperAdmin, feedbackController.getFeedbacks);

// Get feedbacks for a specific schedule (super admin only)
router.get('/schedule/:scheduleId', requireSuperAdmin, feedbackController.getFeedbacksBySchedule);

// Get single feedback by ID (super admin only)
router.get('/:id', requireSuperAdmin, feedbackController.getFeedbackById);

// Delete feedback (super admin only)
router.delete('/:id', requireSuperAdmin, feedbackController.deleteFeedback);

module.exports = router;
