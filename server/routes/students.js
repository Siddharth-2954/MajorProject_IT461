const express = require('express');
const router = express.Router();
const studentsController = require('../controllers/studentsController');

router.post('/', studentsController.createStudent);
router.post('/login', studentsController.login);
router.get('/me', studentsController.me);

module.exports = router;
