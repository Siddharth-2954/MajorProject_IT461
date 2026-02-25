// Middleware to ensure the user is authenticated as a super admin
module.exports = function requireSuperAdmin(req, res, next) {
  try {
    if (req && req.session && req.session.admin) {
      const admin = req.session.admin;
      // Check if the admin has super_admin role
      if (admin.role === 'super_admin') {
        return next();
      }
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied. Super admin privileges required.' 
      });
    }
    return res.status(401).json({ 
      success: false, 
      error: 'Not authenticated as admin' 
    });
  } catch (err) {
    console.error('requireSuperAdmin error', err && err.message ? err.message : err);
    return res.status(500).json({ success: false, error: 'server error' });
  }
};
