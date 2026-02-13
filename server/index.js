require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');

const app = express();

// Use cors package with optional origin from env
app.use(
	cors({
		origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
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

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server running on ${port}`));