require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');

const app = express();

// Use cors package with optional origin from env
app.use(
	cors({
		origin: 'http://localhost:5173', // Allow all origins for development; change in production
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

// Serve uploaded files (announcements attachments)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount admin routes under ADMIN_ROUTE (default /org_admin)
const adminRoute = process.env.ADMIN_ROUTE || '/admin';
app.use(adminRoute, require('./routes/admin'));


// Global process-level error handlers for uncaught exceptions/rejections
process.on('uncaughtException', (err) => {
	console.error('uncaughtException:', err && err.stack ? err.stack : err);
});
process.on('unhandledRejection', (reason) => {
	console.error('unhandledRejection:', reason);
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server running on ${port}`));