module.exports = function requireAdminSession(req, res, next) {
  try {
    if (req && req.session && req.session.admin) return next();
    return res.status(401).json({ success: false, error: 'Not authenticated as admin' });
  } catch (err) {
    console.error('requireAdminSession error', err && err.message ? err.message : err);
    return res.status(500).json({ success: false, error: 'server error' });
  }
};