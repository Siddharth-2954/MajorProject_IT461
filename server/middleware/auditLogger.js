const adminModel = require('../models/adminModel');

/**
 * Middleware to log actions to audit trail
 * Usage: router.post('/route', auditLogger('ACTION_NAME', 'TargetType'), controller)
 */
function auditLogger(action, targetType = null) {
  return async (req, res, next) => {
    try {
      // Store audit info in request for later use
      req.auditInfo = {
        action,
        targetType,
        logAudit: async (targetId, details = {}) => {
          try {
            const admin = req.session && req.session.admin;
            const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip || '').split(',')[0].trim();
            
            await adminModel.insertAuditLog({
              actor_username: admin ? admin.username : null,
              actor_role: admin ? admin.role : null,
              action,
              target_type: targetType,
              target_id: targetId ? String(targetId) : null,
              details,
              ip
            });
          } catch (err) {
            console.error('Audit logging error:', err);
          }
        }
      };
      next();
    } catch (err) {
      console.error('auditLogger middleware error:', err);
      next();
    }
  };
}

module.exports = auditLogger;
