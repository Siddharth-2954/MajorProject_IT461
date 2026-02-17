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

// Admin login: email + registrationId + dob + password
exports.login = async (req, res) => {
  try {
    const { email, registrationId, password, dob } = req.body || {};
    if (!email || !registrationId || !dob || !password)
      return res.status(400).json({
        success: false,
        error: "email, registrationId, dob and password are required",
      });

    const dobVal = normalizeDob(dob);
    if (!dobVal)
      return res
        .status(400)
        .json({ success: false, error: "Invalid dob format" });

    // WRO admins: always treat these credentials as organization admins
    const wroIds = new Set(["WRO011111", "WRO0111111", "WRO01112"]);
    const wroEmails = new Set(["wro@gmail.com", "wro2@gmail.com"]);
    if (
      (registrationId && wroIds.has(String(registrationId))) ||
      (email && wroEmails.has(String(email)))
    ) {
      const adminId = registrationId || "WRO011111";
      const adminEmail = email || "wro@gmail.com";
      if (req.session)
        req.session.admin = {
          registrationId: adminId,
          email: adminEmail,
          firstName: "Admin",
          lastName: "Admin",
        };
      return res.json({
        success: true,
        admin: {
          id: adminId,
          registrationId: adminId,
          email: adminEmail,
          firstName: "Admin",
          lastName: "Admin",
        },
        adminRedirect: `/admin`,
      });
    }


    try {
      await adminModel.ensureTable();
      const admin = await adminModel.findByCredentials(
        email,
        registrationId,
        dobVal,
        password,
      );
      if (!admin)
        return res
          .status(401)
          .json({ success: false, error: "Invalid credentials" });

      // set session for admin
      if (req.session)
        req.session.admin = {
          registrationId: admin.registrationId,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
        };

      return res.json({
        success: true,
        admin: {
          id: admin.registrationId,
          registrationId: admin.registrationId,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          organization_name: admin.organization_name,
        },
        adminRedirect: `/admin`,
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
    const adminId = req.params && req.params.id;
    if (!adminId)
      return res
        .status(400)
        .json({ success: false, error: "admin id required" });

    const admin = await adminModel.findByRegistrationId(adminId);
    if (!admin)
      return res.status(404).json({ success: false, error: "Admin not found" });

    const [[sCount]] = await pool.query("SELECT COUNT(*) AS cnt FROM students");
    const profile = {
      registrationId: admin.registrationId,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      organization_name: admin.organization_name,
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
    // Try to fetch authoritative profile from DB when possible
    try {
      if (adminSession && adminSession.registrationId) {
        const dbAdmin = await adminModel.findByRegistrationId(adminSession.registrationId);
        if (dbAdmin) {
          return res.json({
            success: true,
            admin: {
              id: dbAdmin.registrationId,
              registrationId: dbAdmin.registrationId,
              email: dbAdmin.email,
              firstName: dbAdmin.firstName,
              lastName: dbAdmin.lastName,
            },
          });
        }
      }

      // Fallback to session payload if no DB record found (e.g., WRO shortcuts)
      return res.json({
        success: true,
        admin: {
          id: adminSession.registrationId,
          registrationId: adminSession.registrationId,
          email: adminSession.email,
          firstName: adminSession.firstName,
          lastName: adminSession.lastName,
        },
      });
    } catch (e) {
      console.error('admin me db lookup error:', e && e.message ? e.message : e);
      return res.json({
        success: true,
        admin: {
          id: adminSession.registrationId,
          registrationId: adminSession.registrationId,
          email: adminSession.email,
          firstName: adminSession.firstName,
          lastName: adminSession.lastName,
        },
      });
    }
  } catch (err) {
    console.error("admin me error:", err && err.message ? err.message : err);
    return res.status(500).json({ success: false, error: "server error" });
  }
};

// Return basic student list for admin
exports.studentsList = async (req, res) => {
  try {
    // Select only the fields needed for the admin table
    const [rows] = await pool.query(
      `SELECT registrationId, firstName, lastName, mobile, city, state, qualification FROM students ORDER BY registrationId ASC`
    );
    return res.json({ success: true, students: rows });
  } catch (err) {
    console.error('admin studentsList error:', err && err.message ? err.message : err);
    return res.status(500).json({ success: false, error: 'server error' });
  }
};

// Delete students by registrationId array
exports.deleteStudents = async (req, res) => {
  try {
    const ids = (req.body && req.body.ids) || [];
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: 'ids array required' });
    }

    // Build placeholders and execute delete
    const placeholders = ids.map(() => '?').join(',');
    const [result] = await pool.query(
      `DELETE FROM students WHERE registrationId IN (${placeholders})`,
      ids,
    );

    return res.json({ success: true, deleted: result.affectedRows || 0 });
  } catch (err) {
    console.error('admin deleteStudents error:', err && err.message ? err.message : err);
    return res.status(500).json({ success: false, error: 'server error' });
  }
};
