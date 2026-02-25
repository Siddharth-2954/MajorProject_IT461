const pool = require('../config/database');

// Ensure admins table exists (username primary key)
async function ensureTable() {
  const createSql = `
    CREATE TABLE IF NOT EXISTS admins (
      username VARCHAR(100) PRIMARY KEY,
      firstName VARCHAR(100),
      lastName VARCHAR(100),
      dob DATE,
      password VARCHAR(255)
    );
  `;
  await pool.query(createSql);
  
  // Helper function to check if column exists
  async function columnExists(tableName, columnName) {
    try {
      const [rows] = await pool.query(
        `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = ? 
         AND COLUMN_NAME = ?`,
        [tableName, columnName]
      );
      return rows[0].cnt > 0;
    } catch (e) {
      return false;
    }
  }
  
  // Add columns if missing (compatible with all MySQL versions)
  try {
    if (!(await columnExists('admins', 'displayName'))) {
      await pool.query("ALTER TABLE admins ADD COLUMN displayName VARCHAR(150)");
    }
    if (!(await columnExists('admins', 'email'))) {
      await pool.query("ALTER TABLE admins ADD COLUMN email VARCHAR(200)");
    }
    if (!(await columnExists('admins', 'phone'))) {
      await pool.query("ALTER TABLE admins ADD COLUMN phone VARCHAR(50)");
    }
    if (!(await columnExists('admins', 'save_activity_logs'))) {
      await pool.query("ALTER TABLE admins ADD COLUMN save_activity_logs TINYINT(1) DEFAULT 1");
    }
    if (!(await columnExists('admins', 'role'))) {
      await pool.query("ALTER TABLE admins ADD COLUMN role ENUM('super_admin', 'admin') DEFAULT 'admin'");
      console.log('✅ Added role column to admins table');
    }
    if (!(await columnExists('admins', 'status'))) {
      await pool.query("ALTER TABLE admins ADD COLUMN status ENUM('active', 'suspended', 'pending') DEFAULT 'active'");
      console.log('✅ Added status column to admins table');
    }
    if (!(await columnExists('admins', 'created_at'))) {
      await pool.query("ALTER TABLE admins ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP");
      console.log('✅ Added created_at column to admins table');
    }
  } catch (e) {
    console.error('Error adding columns to admins table:', e.message);
    // Continue anyway - columns might already exist
  }
}

async function findByUsername(username) {
  if (!username) return null;
  const [rows] = await pool.execute(
    'SELECT username, firstName, lastName, dob, password, save_activity_logs, role, status, email, phone, displayName, created_at FROM admins WHERE username = ? LIMIT 1',
    [username]
  );
  return rows && rows.length ? rows[0] : null;
}

// Check credentials: username + password (plaintext comparison as requested)
async function findByCredentials(username, password) {
  if (!username || !password) return null;
  try {
    // First try with status check (for newer schema with role/status columns)
    const [rows] = await pool.execute(
      'SELECT username, firstName, lastName, dob, password, save_activity_logs, role, status, email, phone, displayName FROM admins WHERE username = ? AND password = ? AND (status = "active" OR status IS NULL) LIMIT 1',
      [username, password]
    );
    return rows && rows.length ? rows[0] : null;
  } catch (e) {
    // If the query fails (e.g., status column doesn't exist), try without status check
    console.log('Fallback: trying login without status check (older schema)');
    try {
      const [rows] = await pool.execute(
        'SELECT username, firstName, lastName, dob, password FROM admins WHERE username = ? AND password = ? LIMIT 1',
        [username, password]
      );
      return rows && rows.length ? rows[0] : null;
    } catch (fallbackError) {
      console.error('Login query failed:', fallbackError.message);
      return null;
    }
  }
}

async function insertAdmin(admin) {
  await ensureTable();
  const columns = ['username','firstName','lastName','dob','password','role','status'];
  const vals = [
    admin.username ?? null,
    admin.firstName ?? null,
    admin.lastName ?? null,
    admin.dob ?? null,
    admin.password ?? null,
    admin.role ?? 'admin',  // Default to 'admin' if not specified
    admin.status ?? 'active', // Default to 'active' if not specified
  ];
  const placeholders = columns.map(() => '?').join(',');
  const sql = `INSERT INTO admins (${columns.join(',')}) VALUES (${placeholders})`;
  const [result] = await pool.execute(sql, vals);
  return result;
}

async function countAdmins() {
  const [rows] = await pool.execute('SELECT COUNT(*) AS cnt FROM admins');
  return rows && rows[0] ? (rows[0].cnt ?? rows[0]['COUNT(*)'] ?? 0) : 0;
}

// Activity table for admin sessions/actions
async function ensureActivityTable() {
  const createSql = `
    CREATE TABLE IF NOT EXISTS admin_activity (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(100) NOT NULL,
      ip VARCHAR(100),
      browser VARCHAR(255),
      ts DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(createSql);
}

async function insertActivity({ username, ip, browser }) {
  await ensureActivityTable();
  const sql = `INSERT INTO admin_activity (username, ip, browser) VALUES (?,?,?)`;
  const [res] = await pool.execute(sql, [username, ip || null, browser || null]);
  return res.insertId;
}

async function getActivitiesByUsername(username, limit = 100) {
  await ensureActivityTable();
  // Some MySQL drivers have issues binding LIMIT as a parameter; interpolate safely as integer.
  const lim = Number(limit) || 100;
  const sql = `SELECT id, browser, ip, ts FROM admin_activity WHERE username = ? ORDER BY ts DESC LIMIT ${lim}`;
  const [rows] = await pool.execute(sql, [username]);
  return rows;
}

async function getAllAdmins() {
  await ensureTable();
  const [rows] = await pool.execute('SELECT username, firstName, lastName, role, status, email, created_at FROM admins ORDER BY created_at DESC');
  return rows || [];
}

// Super Admin Functions
async function updateAdminStatus(username, status) {
  if (!username || !status) return 0;
  const [res] = await pool.execute('UPDATE admins SET status = ? WHERE username = ?', [status, username]);
  return res.affectedRows || 0;
}

async function updateAdminRole(username, role) {
  if (!username || !role) return 0;
  const [res] = await pool.execute('UPDATE admins SET role = ? WHERE username = ?', [role, username]);
  return res.affectedRows || 0;
}

async function deleteAdminByUsername(username) {
  if (!username) return 0;
  const [res] = await pool.execute('DELETE FROM admins WHERE username = ?', [username]);
  return res.affectedRows || 0;
}

// Audit Log System
async function ensureAuditTable() {
  const createSql = `
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INT PRIMARY KEY AUTO_INCREMENT,
      actor_username VARCHAR(100),
      actor_role VARCHAR(50),
      action VARCHAR(100) NOT NULL,
      target_type VARCHAR(100),
      target_id VARCHAR(255),
      details TEXT,
      ip VARCHAR(100),
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_actor (actor_username),
      INDEX idx_action (action),
      INDEX idx_timestamp (timestamp)
    );
  `;
  await pool.query(createSql);
}

async function insertAuditLog({ actor_username, actor_role, action, target_type, target_id, details, ip }) {
  await ensureAuditTable();
  const sql = `INSERT INTO audit_logs (actor_username, actor_role, action, target_type, target_id, details, ip) VALUES (?,?,?,?,?,?,?)`;
  const [res] = await pool.execute(sql, [
    actor_username || null,
    actor_role || null,
    action,
    target_type || null,
    target_id || null,
    details ? JSON.stringify(details) : null,
    ip || null
  ]);
  return res.insertId;
}

async function getAuditLogs(limit = 100, filters = {}) {
  await ensureAuditTable();
  let sql = 'SELECT * FROM audit_logs WHERE 1=1';
  const params = [];
  
  if (filters.actor_username) {
    sql += ' AND actor_username = ?';
    params.push(filters.actor_username);
  }
  if (filters.action) {
    sql += ' AND action = ?';
    params.push(filters.action);
  }
  if (filters.target_type) {
    sql += ' AND target_type = ?';
    params.push(filters.target_type);
  }
  
  // Use safe integer interpolation for LIMIT (some MySQL drivers have issues with bound LIMIT)
  const lim = Number(limit) || 100;
  sql += ` ORDER BY timestamp DESC LIMIT ${lim}`;
  
  const [rows] = await pool.execute(sql, params);
  return rows || [];
}

// Admin Statistics for Super Admin
async function getAdminStats() {
  await ensureTable();
  const [stats] = await pool.execute(`
    SELECT 
      COUNT(*) as total_admins,
      SUM(CASE WHEN role = 'super_admin' THEN 1 ELSE 0 END) as super_admins,
      SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as regular_admins,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_admins,
      SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended_admins,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_admins
    FROM admins
  `);
  return stats && stats[0] ? stats[0] : {};
}

async function deleteActivityById(id, username) {
  // Only delete if the record belongs to the username
  const [res] = await pool.execute('DELETE FROM admin_activity WHERE id = ? AND username = ?', [id, username]);
  return res.affectedRows || 0;
}

module.exports = {
  ensureTable,
  findByUsername,
  findByCredentials,
  insertAdmin,
  countAdmins,
  ensureActivityTable,
  insertActivity,
  // update preference for save activity logs
  updateSaveActivity: async function(username, enabled) {
    if (!username) return 0;
    const val = enabled ? 1 : 0;
    const [res] = await pool.execute('UPDATE admins SET save_activity_logs = ? WHERE username = ?', [val, username]);
    return res.affectedRows || 0;
  },
  getActivitiesByUsername,
  deleteActivityById,
  getAllAdmins,
  // Super Admin Functions
  updateAdminStatus,
  updateAdminRole,
  deleteAdminByUsername,
  getAdminStats,
  // Audit Logging
  ensureAuditTable,
  insertAuditLog,
  getAuditLogs,
};
