const express = require('express');
const router = express.Router();
const db = require('../db');

const checkAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Forbidden' });
    }
};

// Get all users (admin only)
router.get('/', checkAdmin, async (req, res) => {
    try {
        const result = await db.query('SELECT id, name, email, role, "createdAt" FROM "User" ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
