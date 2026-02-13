const pool = require('../config/database');

const normalizeDate = (s) => {
    if (!s) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const m = String(s).match(/^(\d{2})[-\/]?(\d{2})[-\/]?(\d{4})$/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
    return s;
};

exports.login = async (req, res) => {
    try {
        const { id, email, dt } = req.body;
        if (!id || !email || !dt) return res.status(400).json({ error: 'id, email and dt required' });

        const dateVal = normalizeDate(String(dt).trim());

        const [rows] = await pool.execute('SELECT id, email, dt FROM users WHERE id = ? AND email = ? AND dt = ?', [id, email, dateVal]);
        if (rows && rows.length > 0) {
            // store minimal user info in session
            req.session.user = { id: rows[0].id, email: rows[0].email };
            return res.json({ success: true, user: req.session.user });
        }

        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'server error' });
    }
};

exports.me = (req, res) => {
    if (req.session && req.session.user) return res.json({ authenticated: true, user: req.session.user });
    return res.status(401).json({ authenticated: false });
};

exports.logout = (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
                return res.status(500).json({ success: false, error: 'Could not logout' });
            }
            res.clearCookie(process.env.SESSION_NAME || 'lms.sid');
            return res.json({ success: true });
        });
    } else {
        return res.json({ success: true });
    }
};
