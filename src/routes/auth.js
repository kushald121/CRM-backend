const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');

// Login
router.post('/login', async (req, res) => {
    const { email: rawEmail, password } = req.body;
    const email = rawEmail ? rawEmail.toLowerCase().trim() : '';
    console.log(`Login attempt for: ${email}`);
    try {
        const result = await db.query('SELECT * FROM "User" WHERE email = $1', [email]);
        const user = result.rows[0];

        if (user) {
            console.log(`User found: ${user.email}, Role: ${user.role}`);
            if (password === user.password) {
                const { password: _, ...userWithoutPassword } = user;
                req.session.user = userWithoutPassword;

                // Explicitly save session before responding
                req.session.save((err) => {
                    if (err) {
                        console.error('Session save error:', err);
                        return res.status(500).json({ error: 'Session save failed' });
                    }
                    console.log(`Login successful and session saved for ${email}. SessionID: ${req.sessionID}`);
                    res.json({ success: true, user: userWithoutPassword });
                });
            } else {
                console.warn(`Password mismatch for ${email}`);
                res.status(401).json({ success: false, error: 'Invalid credentials' });
            }
        } else {
            console.warn(`User not found: ${email}`);
            res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(`Login error for ${email}:`, error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Get current user
router.get('/me', (req, res) => {
    console.log(`Session check: ${req.session.user ? 'Authenticated: ' + req.session.user.email : 'Anonymous'}. SessionID: ${req.sessionID}`);
    if (req.session.user) {
        res.json({ isAuthenticated: true, user: req.session.user });
    } else {
        res.json({ isAuthenticated: false });
    }
});

module.exports = router;
