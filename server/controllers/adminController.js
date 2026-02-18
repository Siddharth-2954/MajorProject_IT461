const pool = require("../config/database");
const adminModel = require("../models/adminModel");

function normalizeDob(v) {
  if (!v) return null;
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  const m = String(v).match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return null;
}

// Admin login: username + password
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password)
      return res
        .status(400)
        .json({ success: false, error: "username and password are required" });

    try {
      await adminModel.ensureTable();
      const admin = await adminModel.findByCredentials(username, password);
      if (!admin)
        return res
          .status(401)
          .json({ success: false, error: "Invalid credentials" });

      // set session for admin (include profile fields)
      if (req.session)
        req.session.admin = {
          username: admin.username,
          firstName: admin.firstName,
          lastName: admin.lastName,
          dob: admin.dob || null,
        };

      // Record login/activity for this admin (ip + browser) only if admin allows it
      try {
        const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip || '').split(',')[0].trim();
        const ua = req.headers['user-agent'] || '';
        const browser = ua.split(') ').pop() || ua;
        // admin may include save_activity_logs flag from DB (added in findByCredentials)
        const allowSave = admin && (typeof admin.save_activity_logs !== 'undefined' ? !!admin.save_activity_logs : true);
        if (allowSave && adminModel.insertActivity) await adminModel.insertActivity({ username: admin.username, ip, browser });
      } catch (e) {
        console.error('failed to record admin activity', e && e.message ? e.message : e);
      }

      return res.json({
        success: true,
        admin: {
          username: admin.username,
          firstName: admin.firstName,
          lastName: admin.lastName,
          dob: admin.dob || null,
        },
        adminRedirect: "/admin",
      });
    } catch (e) {
      console.error("admin login error", e && e.message ? e.message : e);
      return res.status(500).json({ success: false, error: "server error" });
    }
  } catch (err) {
    console.error(
      "admin login error outer",
      err && err.message ? err.message : err,
    );
    return res.status(500).json({ success: false, error: "server error" });
  }
};

// Protected admin route: return basic stats
exports.stats = async (req, res) => {
  try {
    const [[sCount]] = await pool.query("SELECT COUNT(*) AS cnt FROM students");
    const [[aCount]] = await pool.query("SELECT COUNT(*) AS cnt FROM admins");
    return res.json({
      success: true,
      stats: {
        students: sCount.cnt ?? sCount["COUNT(*)"],
        admins: aCount.cnt ?? aCount["COUNT(*)"],
      },
    });
  } catch (err) {
    console.error("admin stats error:", err && err.message ? err.message : err);
    return res.status(500).json({ success: false, error: "server error" });
  }
};

// Stats for specific admin (owner must match middleware)
exports.statsForAdmin = async (req, res) => {
  try {
    const adminName = req.params && req.params.id;
    if (!adminName)
      return res
        .status(400)
        .json({ success: false, error: "admin username required" });

    const admin = await adminModel.findByUsername(adminName);
    if (!admin)
      return res.status(404).json({ success: false, error: "Admin not found" });

    const [[sCount]] = await pool.query("SELECT COUNT(*) AS cnt FROM students");
    const profile = {
      username: admin.username,
      firstName: admin.firstName,
      lastName: admin.lastName,
      dob: admin.dob,
    };
    return res.json({
      success: true,
      profile,
      stats: { students: sCount.cnt ?? sCount["COUNT(*)"] },
    });
  } catch (err) {
    console.error(
      "admin statsForAdmin error:",
      err && err.message ? err.message : err,
    );
    return res.status(500).json({ success: false, error: "server error" });
  }
};

// Return current admin from session
exports.me = async (req, res) => {
  try {
    const adminSession = req.session && req.session.admin;
    if (!adminSession)
      return res.status(401).json({ success: false, authenticated: false });

    try {
      if (adminSession && adminSession.username) {
        const dbAdmin = await adminModel.findByUsername(adminSession.username);
        if (dbAdmin) {
          return res.json({
            success: true,
            admin: {
              username: dbAdmin.username,
              firstName: dbAdmin.firstName,
              lastName: dbAdmin.lastName,
              dob: dbAdmin.dob || null,
              save_activity_logs: typeof dbAdmin.save_activity_logs !== 'undefined' ? !!dbAdmin.save_activity_logs : true,
            },
          });
        }
      }

      // Fallback to session payload
      return res.json({
        success: true,
        admin: {
          username: adminSession.username,
          firstName: adminSession.firstName,
          lastName: adminSession.lastName,
          dob: adminSession.dob || null,
        },
      });
    } catch (e) {
      console.error(
        "admin me db lookup error:",
        e && e.message ? e.message : e,
      );
      return res.json({
        success: true,
        admin: {
          username: adminSession.username,
          firstName: adminSession.firstName,
          lastName: adminSession.lastName,
          dob: adminSession.dob || null
        },
      });
    }
  } catch (err) {
    console.error("admin me error:", err && err.message ? err.message : err);
    return res.status(500).json({ success: false, error: "server error" });
  }
};

// Set save_activity_logs preference for current admin (used by client toggle)
exports.setSaveActivity = async (username, enabled) => {
  try {
    if (!username) return 0;
    if (adminModel && adminModel.updateSaveActivity) {
      const updated = await adminModel.updateSaveActivity(username, !!enabled);
      return updated;
    }
    return 0;
  } catch (e) {
    console.error('setSaveActivity error', e && e.message ? e.message : e);
    return 0;
  }
};

// Return activity list for the logged-in admin
exports.activityList = async (req, res) => {
  try {
    const adminSession = req.session && req.session.admin;
    if (!adminSession || !adminSession.username)
      return res.status(401).json({ success: false, error: 'unauthorized' });

    const activities = await adminModel.getActivitiesByUsername(adminSession.username, 200);
    return res.json({ success: true, activities });
  } catch (e) {
    console.error('admin activityList error', e && e.message ? e.message : e);
    return res.status(500).json({ success: false, error: 'server error' });
  }
};

// Delete single activity row by id (owner only)
exports.deleteActivity = async (req, res) => {
  try {
    const adminSession = req.session && req.session.admin;
    if (!adminSession || !adminSession.username)
      return res.status(401).json({ success: false, error: 'unauthorized' });

    const id = parseInt(req.params && req.params.id, 10);
    if (!id) return res.status(400).json({ success: false, error: 'id required' });

    const deleted = await adminModel.deleteActivityById(id, adminSession.username);
    if (!deleted) return res.status(404).json({ success: false, error: 'not found' });
    return res.json({ success: true, deleted });
  } catch (e) {
    console.error('admin deleteActivity error', e && e.message ? e.message : e);
    return res.status(500).json({ success: false, error: 'server error' });
  }
};

// Public register endpoint to create an admin user
exports.register = async (req, res) => {
  try {
    const { username, firstName, lastName, dob, password } = req.body || {};
    if (!username || !password)
      return res.status(400).json({ success: false, error: 'username and password are required' });

    const dobVal = normalizeDob(dob);
    // dob is optional but if provided must parse
    if (dob && !dobVal) return res.status(400).json({ success: false, error: 'Invalid dob format' });

    try {
      await adminModel.ensureTable();
      const existing = await adminModel.findByUsername(username);
      if (existing) return res.status(409).json({ success: false, error: 'username already exists' });

      await adminModel.insertAdmin({ username, firstName, lastName, dob: dobVal, password });
      return res.json({ success: true, message: 'admin created' });
    } catch (e) {
      console.error('admin register error', e && e.message ? e.message : e);
      return res.status(500).json({ success: false, error: 'server error' });
    }
  } catch (err) {
    console.error('admin register outer error', err && err.message ? err.message : err);
    return res.status(500).json({ success: false, error: 'server error' });
  }
};

// Return basic student list for admin
exports.studentsList = async (req, res) => {
  try {
    // Select only the fields needed for the admin table
    const [rows] = await pool.query(
      `SELECT registrationId, firstName, lastName, mobile, city, state, qualification FROM students ORDER BY registrationId ASC`,
    );
    return res.json({ success: true, students: rows });
  } catch (err) {
    console.error(
      "admin studentsList error:",
      err && err.message ? err.message : err,
    );
    return res.status(500).json({ success: false, error: "server error" });
  }
};

// Delete students by registrationId array
exports.deleteStudents = async (req, res) => {
  try {
    const ids = (req.body && req.body.ids) || [];
    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "ids array required" });
    }

    // Build placeholders and execute delete
    const placeholders = ids.map(() => "?").join(",");
    const [result] = await pool.query(
      `DELETE FROM students WHERE registrationId IN (${placeholders})`,
      ids,
    );

    return res.json({ success: true, deleted: result.affectedRows || 0 });
  } catch (err) {
    console.error(
      "admin deleteStudents error:",
      err && err.message ? err.message : err,
    );
    return res.status(500).json({ success: false, error: "server error" });
  }
};
