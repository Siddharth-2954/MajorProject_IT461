const announcementModel = require('../models/announcementModel');
const adminModel = require('../models/adminModel');
const path = require('path');
const fs = require('fs');

exports.listPublic = async (req, res) => {
  try {
    const type = req.query && req.query.type ? String(req.query.type) : null;
    const rows = type ? await announcementModel.getAnnouncementsByType(type) : await announcementModel.getAllAnnouncements();
    // attach full URL for attachments and include admin info
    const list = (rows || []).map(r => {
      const rec = { ...r };
      if (rec.attachment) {
        rec.attachment_url = `${req.protocol}://${req.get('host')}/uploads/announcements/${rec.attachment}`;
      }
      rec.admin = {
        username: rec.admin_username || null,
        firstName: rec.admin_firstName || null,
        lastName: rec.admin_lastName || null,
      };
      return rec;
    });
    return res.json({ success: true, announcements: list });
  } catch (e) {
    console.error('announcement list public error', e && e.message ? e.message : e);
    return res.status(500).json({ success: false });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const adminSession = req.session && req.session.admin;
    if (!adminSession || !adminSession.username) return res.status(401).json({ success: false });
    // support multipart/form-data via multer (attachment file available at req.file)
    const { type, title, body } = req.body || {};
    if (!title) return res.status(400).json({ success: false, error: 'title required' });
    const author = adminSession.displayName || adminSession.username;
    const attachment = req.file ? req.file.filename : null;
    const admin_username = adminSession.username;
    const id = await announcementModel.insertAnnouncement({ type: type || 'lms', title, body, author, attachment, admin_username });
    
    // Log to audit trail
    try {
      const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip || '').split(',')[0].trim();
      await adminModel.insertAuditLog({
        actor_username: admin_username,
        actor_role: adminSession.role || 'admin',
        action: 'CREATE_ANNOUNCEMENT',
        target_type: 'announcement',
        target_id: String(id),
        details: { type, title, hasAttachment: !!attachment },
        ip
      });
    } catch (auditErr) {
      console.error('Audit log error:', auditErr);
    }
    
    return res.json({ success: true, id });
  } catch (e) {
    console.error('announcement create error', e && e.message ? e.message : e);
    return res.status(500).json({ success: false });
  }
};

exports.listAdmin = async (req, res) => {
  try {
    const adminSession = req.session && req.session.admin;
    if (!adminSession || !adminSession.username) return res.status(401).json({ success: false });
    const type = req.query && req.query.type ? String(req.query.type) : null;
    const rows = type ? await announcementModel.getAnnouncementsByType(type, 500) : await announcementModel.getAllAnnouncements(500);
    const list = (rows || []).map(r => {
      const rec = { ...r };
      if (rec.attachment) rec.attachment_url = `${req.protocol}://${req.get('host')}/uploads/announcements/${rec.attachment}`;
      rec.admin = {
        username: rec.admin_username || null,
        firstName: rec.admin_firstName || null,
        lastName: rec.admin_lastName || null,
      };
      return rec;
    });
    return res.json({ success: true, announcements: list });
  } catch (e) {
    console.error('announcement list admin error', e && e.message ? e.message : e);
    return res.status(500).json({ success: false });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const adminSession = req.session && req.session.admin;
    if (!adminSession || !adminSession.username) return res.status(401).json({ success: false });
    const id = parseInt(req.params && req.params.id, 10);
    if (!id) return res.status(400).json({ success: false });
    // fetch announcement to remove attached file if any
    const rec = await announcementModel.getAnnouncementById(id);
    if (rec && rec.attachment) {
      try {
        const p = path.join(__dirname, '..', 'uploads', 'announcements', rec.attachment);
        fs.unlinkSync(p);
      } catch (e) {
        // ignore missing file
      }
    }
    const deleted = await announcementModel.deleteAnnouncementById(id);
    
    // Log to audit trail
    try {
      const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip || '').split(',')[0].trim();
      await adminModel.insertAuditLog({
        actor_username: adminSession.username,
        actor_role: adminSession.role || 'admin',
        action: 'DELETE_ANNOUNCEMENT',
        target_type: 'announcement',
        target_id: String(id),
        details: { title: rec ? rec.title : null },
        ip
      });
    } catch (auditErr) {
      console.error('Audit log error:', auditErr);
    }
    
    return res.json({ success: !!deleted });
  } catch (e) {
    console.error('announcement delete admin error', e && e.message ? e.message : e);
    return res.status(500).json({ success: false });
  }
};
