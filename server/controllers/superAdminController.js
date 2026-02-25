const pool = require("../config/database");
const adminModel = require("../models/adminModel");
const studyMaterialModel = require("../models/studyMaterialModel");

// Dashboard Statistics for Super Admin
exports.getDashboard = async (req, res) => {
  try {
    const adminStats = await adminModel.getAdminStats();
    
    // Get student count
    const [[studentCount]] = await pool.query("SELECT COUNT(*) AS cnt FROM students");
    
    // Get announcement count
    const [[announcementCount]] = await pool.query("SELECT COUNT(*) AS cnt FROM announcements");
    
    // Get study materials count
    const [[materialCount]] = await pool.query("SELECT COUNT(*) AS cnt FROM study_materials");
    
    // Get unique subjects count
    const subjectsCount = await studyMaterialModel.countUniquSubjects();
    
    // Recent activity from audit logs
    const recentActivity = await adminModel.getAuditLogs(20);
    
    // Recent admin logins
    const [recentLogins] = await pool.query(`
      SELECT DISTINCT username, ts as last_login
      FROM admin_activity
      ORDER BY ts DESC
      LIMIT 10
    `);
    
    return res.json({
      success: true,
      dashboard: {
        admins: adminStats,
        students: studentCount.cnt || studentCount["COUNT(*)"] || 0,
        announcements: announcementCount.cnt || announcementCount["COUNT(*)"] || 0,
        studyMaterials: materialCount.cnt || materialCount["COUNT(*)"] || 0,
        subjects: subjectsCount,
        recentActivity: recentActivity.map(log => ({
          id: log.id,
          actor: log.actor_username,
          role: log.actor_role,
          action: log.action,
          targetType: log.target_type,
          targetId: log.target_id,
          timestamp: log.timestamp,
          details: log.details ? JSON.parse(log.details) : null
        })),
        recentLogins
      }
    });
  } catch (err) {
    console.error("Super admin dashboard error:", err);
    return res.status(500).json({ success: false, error: "server error" });
  }
};

// List All Admins (for super admin management)
exports.listAdmins = async (req, res) => {
  try {
    const admins = await adminModel.getAllAdmins();
    
    // Get activity count for each admin
    const adminsWithActivity = await Promise.all(
      admins.map(async (admin) => {
        const activities = await adminModel.getActivitiesByUsername(admin.username, 1);
        const lastLogin = activities.length > 0 ? activities[0].ts : null;
        
        return {
          ...admin,
          lastLogin,
          // Don't send password to frontend
          password: undefined
        };
      })
    );
    
    return res.json({
      success: true,
      admins: adminsWithActivity
    });
  } catch (err) {
    console.error("List admins error:", err);
    return res.status(500).json({ success: false, error: "server error" });
  }
};

// Update Admin Status (activate, suspend, pending)
exports.updateAdminStatus = async (req, res) => {
  try {
    const { username } = req.params;
    const { status } = req.body;
    
    if (!username || !status) {
      return res.status(400).json({ success: false, error: "username and status required" });
    }
    
    if (!['active', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }
    
    // Don't allow super admin to suspend themselves
    const currentAdmin = req.session.admin;
    if (currentAdmin.username === username) {
      return res.status(400).json({ success: false, error: "Cannot change your own status" });
    }
    
    const updated = await adminModel.updateAdminStatus(username, status);
    
    // Log the action
    if (req.auditInfo && req.auditInfo.logAudit) {
      await req.auditInfo.logAudit(username, { status, previousStatus: 'unknown' });
    }
    
    return res.json({
      success: true,
      updated: updated > 0
    });
  } catch (err) {
    console.error("Update admin status error:", err);
    return res.status(500).json({ success: false, error: "server error" });
  }
};

// Update Admin Role (promote/demote)
exports.updateAdminRole = async (req, res) => {
  try {
    const { username } = req.params;
    const { role } = req.body;
    
    if (!username || !role) {
      return res.status(400).json({ success: false, error: "username and role required" });
    }
    
    if (!['admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ success: false, error: "Invalid role" });
    }
    
    // Don't allow super admin to change their own role
    const currentAdmin = req.session.admin;
    if (currentAdmin.username === username) {
      return res.status(400).json({ success: false, error: "Cannot change your own role" });
    }
    
    const updated = await adminModel.updateAdminRole(username, role);
    
    // Log the action
    if (req.auditInfo && req.auditInfo.logAudit) {
      await req.auditInfo.logAudit(username, { role, action: 'role_change' });
    }
    
    return res.json({
      success: true,
      updated: updated > 0
    });
  } catch (err) {
    console.error("Update admin role error:", err);
    return res.status(500).json({ success: false, error: "server error" });
  }
};

// Delete Admin (soft delete - changes status to suspended)
exports.deleteAdmin = async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({ success: false, error: "username required" });
    }
    
    // Don't allow super admin to delete themselves
    const currentAdmin = req.session.admin;
    if (currentAdmin.username === username) {
      return res.status(400).json({ success: false, error: "Cannot delete yourself" });
    }
    
    // Instead of hard delete, we suspend the admin (following "no direct DB writes" principle)
    const updated = await adminModel.updateAdminStatus(username, 'suspended');
    
    // Log the action
    if (req.auditInfo && req.auditInfo.logAudit) {
      await req.auditInfo.logAudit(username, { action: 'admin_suspended' });
    }
    
    return res.json({
      success: true,
      deleted: updated > 0
    });
  } catch (err) {
    console.error("Delete admin error:", err);
    return res.status(500).json({ success: false, error: "server error" });
  }
};

// Get Audit Logs
exports.getAuditLogs = async (req, res) => {
  try {
    const { limit = 100, actor, action, targetType } = req.query;
    
    const filters = {};
    if (actor) filters.actor_username = actor;
    if (action) filters.action = action;
    if (targetType) filters.target_type = targetType;
    
    const logs = await adminModel.getAuditLogs(Number(limit), filters);
    
    return res.json({
      success: true,
      logs: logs.map(log => ({
        id: log.id,
        actor: log.actor_username,
        role: log.actor_role,
        action: log.action,
        targetType: log.target_type,
        targetId: log.target_id,
        timestamp: log.timestamp,
        ip: log.ip,
        details: log.details ? JSON.parse(log.details) : null
      }))
    });
  } catch (err) {
    console.error("Get audit logs error:", err);
    return res.status(500).json({ success: false, error: "server error" });
  }
};

// View System Health
exports.getSystemHealth = async (req, res) => {
  try {
    // Check database connection
    const dbStatus = await pool.query('SELECT 1').then(() => 'healthy').catch(() => 'unhealthy');
    
    // Get table sizes
    const [tables] = await pool.query(`
      SELECT 
        table_name,
        table_rows,
        ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
      FROM information_schema.TABLES
      WHERE table_schema = DATABASE()
      ORDER BY (data_length + index_length) DESC
    `);
    
    return res.json({
      success: true,
      health: {
        database: dbStatus,
        tables: tables,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error("System health error:", err);
    return res.status(500).json({ success: false, error: "server error" });
  }
};

// Get Admin Activity History
exports.getAdminActivity = async (req, res) => {
  try {
    const { username } = req.params;
    const { limit = 50 } = req.query;
    
    if (!username) {
      return res.status(400).json({ success: false, error: "username required" });
    }
    
    const activities = await adminModel.getActivitiesByUsername(username, Number(limit));
    
    return res.json({
      success: true,
      activities
    });
  } catch (err) {
    console.error("Get admin activity error:", err);
    return res.status(500).json({ success: false, error: "server error" });
  }
};

// Get All Students List (for super admin oversight)
exports.getAllStudents = async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    
    const [students] = await pool.query(`
      SELECT 
        registrationId,
        firstName,
        lastName,
        email,
        mobile,
        city,
        state,
        qualification
      FROM students
      ORDER BY registrationId DESC
      LIMIT ? OFFSET ?
    `, [Number(limit), Number(offset)]);
    
    const [[total]] = await pool.query('SELECT COUNT(*) as total FROM students');
    
    return res.json({
      success: true,
      students,
      total: total.total || total['COUNT(*)'] || 0
    });
  } catch (err) {
    console.error("Get all students error:", err);
    return res.status(500).json({ success: false, error: "server error" });
  }
};

// Create Subject
exports.createSubject = async (req, res) => {
  try {
    const { subject, description } = req.body;
    
    console.log('Creating subject:', { subject, description, hasFile: !!req.file });
    if (req.file) {
      console.log('File received:', { originalname: req.file.originalname, filename: req.file.filename, path: req.file.path });
    }
    
    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, error: "subject name is required" });
    }
    
    let coverImagePath = null;
    if (req.file) {
      coverImagePath = `/uploads/subjects/${req.file.filename}`;
      console.log('Cover image path set to:', coverImagePath);
    }
    
    const subjectId = await studyMaterialModel.createSubject({
      name: subject.trim(),
      description: description || null,
      coverImage: coverImagePath
    });
    
    return res.json({
      success: true,
      id: subjectId,
      message: "Subject created successfully",
      coverImage: coverImagePath
    });
  } catch (err) {
    console.error("Create subject error:", err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, error: "Subject already exists" });
    }
    return res.status(500).json({ success: false, error: "server error" });
  }
};

// Get All Subjects
exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await studyMaterialModel.getAllSubjects();
    
    return res.json({
      success: true,
      subjects
    });
  } catch (err) {
    console.error("Get all subjects error:", err);
    return res.status(500).json({ success: false, error: "server error" });
  }
};

// Delete Subject
exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ success: false, error: "subject id is required" });
    }
    
    const deleted = await studyMaterialModel.deleteSubject(id);
    
    if (deleted === 0) {
      return res.status(404).json({ success: false, error: "Subject not found" });
    }
    
    return res.json({
      success: true,
      message: "Subject deleted successfully"
    });
  } catch (err) {
    console.error("Delete subject error:", err);
    return res.status(500).json({ success: false, error: "server error" });
  }
};

// Get Unassigned Subjects
exports.getUnassignedSubjects = async (req, res) => {
  try {
    const subjects = await studyMaterialModel.getUnassignedSubjects();
    
    return res.json({
      success: true,
      subjects
    });
  } catch (err) {
    console.error("Get unassigned subjects error:", err);
    return res.status(500).json({ success: false, error: "server error" });
  }
};

// Assign Subject to Admin
exports.assignSubjectToAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminUsername } = req.body;
    
    if (!id || !adminUsername) {
      return res.status(400).json({ success: false, error: "subject id and admin username are required" });
    }
    
    // Verify admin exists
    const [adminExists] = await pool.query(
      "SELECT username FROM admins WHERE username = ?",
      [adminUsername]
    );
    
    if (!adminExists || adminExists.length === 0) {
      return res.status(404).json({ success: false, error: "Admin not found" });
    }
    
    const assigned = await studyMaterialModel.assignSubjectToAdmin(id, adminUsername);
    
    if (assigned === 0) {
      return res.status(404).json({ success: false, error: "Subject not found" });
    }
    
    return res.json({
      success: true,
      message: "Subject assigned successfully"
    });
  } catch (err) {
    console.error("Assign subject error:", err);
    return res.status(500).json({ success: false, error: "server error" });
  }
};

// Unassign Subject from Admin
exports.unassignSubject = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ success: false, error: "subject id is required" });
    }
    
    const unassigned = await studyMaterialModel.unassignSubject(id);
    
    if (unassigned === 0) {
      return res.status(404).json({ success: false, error: "Subject not found" });
    }
    
    return res.json({
      success: true,
      message: "Subject unassigned successfully"
    });
  } catch (err) {
    console.error("Unassign subject error:", err);
    return res.status(500).json({ success: false, error: "server error" });
  }
};
