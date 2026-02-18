const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

const requireAdminSession = require('../middleware/requireAdminSession');

// Public admin login
router.post('/login', adminController.login);
// Alternate login endpoint that accepts /admin/!login by matching the segment as a param
router.post('/:slug', (req, res, next) => {
	if (req.params.slug === '!login') {
		return adminController.login(req, res, next);
	}
	// Not the bang-login route; let other handlers (or 404) take over
	return next();
});
// Public admin register (create admin user)
router.post('/register', adminController.register);

// Activity endpoints
router.get('/activity', requireAdminSession, adminController.activityList);
router.delete('/activity/:id', requireAdminSession, adminController.deleteActivity);

// Update admin preference for saving activity logs
router.post('/save-activity', requireAdminSession, async (req, res) => {
	try {
		const username = req.session && req.session.admin && req.session.admin.username;
		if (!username) return res.status(401).json({ success: false });
		const enabled = !!req.body && !!req.body.save;
		const updated = await adminController.setSaveActivity(username, enabled);
		return res.json({ success: !!updated });
	} catch (e) {
		console.error('save-activity error', e && e.message ? e.message : e);
		return res.status(500).json({ success: false });
	}
});

// Admin announcements management (allow file upload attachments)
const announcementController = require('../controllers/announcementController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'announcements');
try { fs.mkdirSync(UPLOAD_DIR, { recursive: true }); } catch (e) {}

const storage = multer.diskStorage({
	destination: function (req, file, cb) { cb(null, UPLOAD_DIR); },
	filename: function (req, file, cb) {
		const safe = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
		cb(null, safe);
	}
});
const upload = multer({ storage });

router.post('/announcements', requireAdminSession, upload.single('attachment'), announcementController.createAdmin);
router.get('/announcements', requireAdminSession, announcementController.listAdmin);
router.delete('/announcements/:id', requireAdminSession, announcementController.deleteAdmin);

// Protected admin endpoints
router.get('/me', requireAdminSession, adminController.me);
router.get('/stats', requireAdminSession, adminController.stats);
router.get('/students-list', requireAdminSession, adminController.studentsList);
router.delete('/students', requireAdminSession, adminController.deleteStudents);
router.get('/:id/stats', requireAdminSession, adminController.statsForAdmin);

module.exports = router;
