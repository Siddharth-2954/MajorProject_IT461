const express = require('express');
const router = express.Router();

// GET /auth/me - return session user or admin
router.get('/me', (req, res) => {
  try {
    if (req.session && req.session.user) return res.json({ authenticated: true, user: req.session.user });
    if (req.session && req.session.admin) return res.json({ authenticated: true, admin: req.session.admin });
    return res.status(401).json({ authenticated: false });
  } catch (e) {
    console.error('auth me error', e && e.message ? e.message : e);
    return res.status(500).json({ authenticated: false });
  }
});

// POST /auth/logout - destroy session
router.post('/logout', (req, res) => {
  try {
    if (req.session) {
      req.session.destroy(() => {});
    }
    res.json({ success: true });
  } catch (e) {
    console.error('auth logout error', e && e.message ? e.message : e);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
