const express = require('express');
const router = express.Router();
const studyMaterialController = require('../controllers/studyMaterialController');

// Public listing of study materials (no admin session required)
router.get('/', studyMaterialController.listAdmin);

module.exports = router;
