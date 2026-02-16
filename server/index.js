require('dotenv').config();
const express = require('express');
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

// Mount auth routes
app.use('/auth', require('./routes/auth'));
// Mount students route
app.use('/students', require('./routes/students'));

// Error-handling middleware (logs and returns 500)
app.use((err, req, res, next) => {
	console.error('Express error handler:', err && err.stack ? err.stack : err);
	try {
		if (err && err.sql) console.error('SQL:', err.sql);
	} catch (e) {}
	res.status(500).json({ error: 'server error' });
});

// Global process-level error handlers for uncaught exceptions/rejections
process.on('uncaughtException', (err) => {
	console.error('uncaughtException:', err && err.stack ? err.stack : err);
});
process.on('unhandledRejection', (reason) => {
	console.error('unhandledRejection:', reason);
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server running on ${port}`));