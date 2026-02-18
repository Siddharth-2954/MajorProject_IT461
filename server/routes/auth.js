const express = require('express');
const router = express.Router();
const adminModel = require('../models/adminModel');

// GET /auth/me - return session user or admin (fetch fresh admin profile from DB when possible)
router.get('/me', async (req, res) => {
  try {
    if (req.session && req.session.user) return res.json({ authenticated: true, user: req.session.user });
    if (req.session && req.session.admin) {
      // attempt to load latest admin profile from DB
      try {
        if (req.session.admin.username) {
          const dbAdmin = await adminModel.findByUsername(req.session.admin.username);
          if (dbAdmin) return res.json({ authenticated: true, admin: dbAdmin });
        }
      } catch (e) {
        // fallback to session payload if DB lookup fails
        console.error('auth me admin db lookup error', e && e.message ? e.message : e);
      }
      return res.json({ authenticated: true, admin: req.session.admin });
    }
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

// Public: list registered admins (basic info)
router.get('/admins', async (req, res) => {
  try {
    const rows = await adminModel.getAllAdmins();
    // Normalize to displayName or first+last or username
    const admins = (rows || []).map(a => ({
      username: a.username,
      displayName: a.displayName || [a.firstName, a.lastName].filter(Boolean).join(' ') || a.username,
      email: a.email || null,
    }));
    return res.json({ success: true, admins });
  } catch (e) {
    console.error('public admins list error', e && e.message ? e.message : e);
    return res.status(500).json({ success: false });
  }
});

module.exports = router;
