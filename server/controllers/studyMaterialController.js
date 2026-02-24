const path = require('path');
const fs = require('fs');
const model = require('../models/studyMaterialModel');

async function listAdmin(req, res) {
  try {
    const rows = await model.listMaterials(1000);
    // Map to client-friendly fields (include subject)
    const out = rows.map((r) => ({ id: r.id, topic: r.topic, uploaderName: r.uploaderName, date: r.date, category: r.category, subject: r.subject, fileUrl: r.fileUrl, fileName: r.fileName, fileType: r.fileType }));
    res.json(out);
  } catch (e) {
    console.error('studyMaterial.listAdmin error', e && e.message ? e.message : e);
    res.status(500).json({ error: 'server error' });
  }
}

async function createAdmin(req, res) {
  try {
    // Expecting multer to attach file as 'file'
    if (!req.file) return res.status(400).json({ error: 'no file uploaded' });

    // Enforce PDF file type
    const mimetype = req.file.mimetype || '';
    const ext = path.extname(req.file.originalname || '').toLowerCase();
    if (!(mimetype === 'application/pdf' || ext === '.pdf')) {
      // delete the uploaded file
      try { fs.unlinkSync(req.file.path); } catch (e) {}
      return res.status(400).json({ error: 'only PDF files are accepted' });
    }

    const topic = req.body.topic || req.file.originalname || 'Untitled';
    const category = (req.body.category === 'Assignment') ? 'Assignment' : 'Notes';
    const subject = req.body.subject || null;
    const uploaderName = req.body.uploaderName || (req.session && req.session.admin && `${req.session.admin.firstName || ''} ${req.session.admin.lastName || ''}`.trim()) || 'Admin';

    // Build file URL relative to server. Assuming static serve of /uploads
    const fileUrl = `/uploads/study-materials/${path.basename(req.file.path)}`;

    let insertId;
    try {
      insertId = await model.insertMaterial({ topic, uploaderName, category, subject, fileUrl, fileName: req.file.originalname, fileType: 'PDF' });
    } catch (err) {
      // If DB missing subject column, try to ensure table/column and retry once
      const msg = err && err.message ? err.message : '';
      if (msg.includes("Unknown column 'subject'") || msg.includes('column') && msg.includes('subject')) {
        try {
          await model.ensureTable();
          insertId = await model.insertMaterial({ topic, uploaderName, category, subject, fileUrl, fileName: req.file.originalname, fileType: 'PDF' });
        } catch (e2) {
          console.error('studyMaterial.createAdmin retry error', e2 && e2.message ? e2.message : e2);
          return res.status(500).json({ error: 'server error' });
        }
      } else {
        throw err;
      }
    }
    res.json({ success: true, id: insertId });
  } catch (e) {
    console.error('studyMaterial.createAdmin error', e && e.message ? e.message : e);
    res.status(500).json({ error: 'server error' });
  }
}

module.exports = { listAdmin, createAdmin };
