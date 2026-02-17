const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

const requireAdminSession = require('../middleware/requireAdminSession');

// Public admin login
router.post('/login', adminController.login);

// Protected admin endpoints
router.get('/me', requireAdminSession, adminController.me);
router.get('/stats', requireAdminSession, adminController.stats);
router.get('/students-list', requireAdminSession, adminController.studentsList);
router.delete('/students', requireAdminSession, adminController.deleteStudents);
router.get('/:id/stats', requireAdminSession, adminController.statsForAdmin);

module.exports = router;
