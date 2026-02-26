const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const lvcScheduleController = require('../controllers/lvcScheduleController');
const lvrcScheduleController = require('../controllers/lvrcScheduleController');
const chapterController = require('../controllers/chapterController');
const requireSuperAdmin = require('../middleware/requireSuperAdmin');
const auditLogger = require('../middleware/auditLogger');
const { subjectUpload } = require('../config/multer');

// All routes require super admin authentication
router.use(requireSuperAdmin);

// Dashboard
router.get('/dashboard', superAdminController.getDashboard);

// Admin Management
router.get('/admins', superAdminController.listAdmins);
router.patch('/admins/:username/status', 
  auditLogger('UPDATE_ADMIN_STATUS', 'admin'),
  superAdminController.updateAdminStatus
);
router.patch('/admins/:username/role',
  auditLogger('UPDATE_ADMIN_ROLE', 'admin'),
  superAdminController.updateAdminRole
);
router.delete('/admins/:username',
  auditLogger('DELETE_ADMIN', 'admin'),
  superAdminController.deleteAdmin
);

// Admin Activity
router.get('/admins/:username/activity', superAdminController.getAdminActivity);

// Audit Logs
router.get('/audit-logs', superAdminController.getAuditLogs);

// System Health
router.get('/system-health', superAdminController.getSystemHealth);

// Student Oversight (view-only)
router.get('/students', superAdminController.getAllStudents);

// Subject Management
router.post('/subjects', (req, res, next) => {
  console.log('POST /subjects called');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
}, subjectUpload.single('coverImage'), (req, res, next) => {
  console.log('After multer middleware');
  console.log('req.file:', req.file);
  next();
}, superAdminController.createSubject);
router.get('/subjects', superAdminController.getAllSubjects);
router.get('/subjects/unassigned', superAdminController.getUnassignedSubjects);
router.delete('/subjects/:id', superAdminController.deleteSubject);
router.post('/subjects/:id/assign', superAdminController.assignSubjectToAdmin);
router.post('/subjects/:id/unassign', superAdminController.unassignSubject);

// Chapter Management
router.post('/chapters', chapterController.createChapter);
router.get('/chapters/subject/:subjectId', chapterController.getChaptersBySubject);
router.get('/chapters/:id', chapterController.getChapterById);
router.put('/chapters/:id', chapterController.updateChapter);
router.delete('/chapters/:id', chapterController.deleteChapter);

// LVC Schedule Management
router.post('/lvc-schedules', lvcScheduleController.createSchedule);
router.get('/lvc-schedules/subject/:subjectId', lvcScheduleController.getSchedulesBySubject);
router.get('/lvc-schedules/:id', lvcScheduleController.getScheduleById);
router.get('/lvc-schedules', lvcScheduleController.getAllSchedules);
router.put('/lvc-schedules/:id', lvcScheduleController.updateSchedule);
router.delete('/lvc-schedules/:id', lvcScheduleController.deleteSchedule);

// LVRC Schedule Management
router.post('/lvrc-schedules', lvrcScheduleController.createSchedule);
router.post('/lvrc-schedules/auto-create', lvrcScheduleController.autoCreateLVRCFromLVC);
router.get('/lvrc-schedules/subject/:subjectId', lvrcScheduleController.getSchedulesBySubject);
router.get('/lvrc-schedules/:id', lvrcScheduleController.getScheduleById);
router.get('/lvrc-schedules', lvrcScheduleController.getAllSchedules);
router.put('/lvrc-schedules/:id', lvrcScheduleController.updateSchedule);
router.delete('/lvrc-schedules/:id', lvrcScheduleController.deleteSchedule);

module.exports = router;