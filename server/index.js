require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const multer = require('multer');

const app = express();

// Use cors package with optional origin from env
app.use(
	cors({
		origin: ['http://localhost:5173', 'http://localhost:5174'], // Allow both ports for development
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
	})
);

app.use(express.json());

// session middleware
app.use(
	session({
		name: process.env.SESSION_NAME || 'lms.sid',
		secret: process.env.SESSION_SECRET || 'change-this-secret',
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
			maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
		},
	})
);

app.get('/health', (req, res) => res.json({ ok: true }));


// Mount auth route (session-based)
app.use('/auth', require('./routes/auth'));

// Mount students route
app.use('/students', require('./routes/students'));

// Public announcements
app.use('/announcements', require('./routes/announcements'));

// Public study materials listing
app.use('/study-materials', require('./routes/studyMaterials'));

// Public schedules (LVC and LVRC)
app.use('/schedules', require('./routes/schedules'));

// Feedbacks
app.use('/feedbacks', require('./routes/feedbacks'));

// Serve uploaded files (announcements attachments)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handler for multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
  } else if (err) {
    console.error('File upload error:', err);
    return res.status(400).json({ success: false, error: `File error: ${err.message}` });
  }
  next();
});

// Mount admin routes under ADMIN_ROUTE (default /org_admin)
const adminRoute = process.env.ADMIN_ROUTE || '/admin';
app.use(adminRoute, require('./routes/admin'));

// Mount super admin routes
app.use('/super-admin', require('./routes/superAdmin'));

// Mount MCQ routes (protected by super-admin middleware)
app.use('/super-admin/mcq', require('./routes/mcq'));

// Mount MCQ routes for students (to take quizzes and view stats)
app.use('/mcq', require('./routes/mcq'));



// Global process-level error handlers for uncaught exceptions/rejections
process.on('uncaughtException', (err) => {
	console.error('uncaughtException:', err && err.stack ? err.stack : err);
});
process.on('unhandledRejection', (reason) => {
	console.error('unhandledRejection:', reason);
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server running on ${port}`));