const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');

// Public listing: ?type=lms|exam
router.get('/', announcementController.listPublic);

module.exports = router;
