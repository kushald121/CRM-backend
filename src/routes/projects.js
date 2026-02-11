const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware to check auth
const checkAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Get all projects or user projects
router.get('/', checkAuth, async (req, res) => {
    try {
        const user = req.session.user;
        let result;
        if (user.role === 'admin') {
            result = await db.query('SELECT * FROM "Project" ORDER BY "createdAt" DESC');
        } else {
            result = await db.query('SELECT * FROM "Project" WHERE "userId" = $1 ORDER BY "createdAt" DESC', [user.id]);
        }
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create project
router.post('/', checkAuth, async (req, res) => {
    const { projectId, username, status, ipAddress, country } = req.body;
    const userId = req.session.user.id;
    try {
        const result = await db.query(
            'INSERT INTO "Project" ("projectId", "username", "status", "ipAddress", "country", "userId") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [projectId, username, status, ipAddress, country, userId]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update project
router.put('/:id', checkAuth, async (req, res) => {
    const { id } = req.params;
    const { projectId, username, status, ipAddress, country } = req.body;
    const userId = req.session.user.id;
    const userRole = req.session.user.role;

    try {
        // Check ownership if not admin
        if (userRole !== 'admin') {
            const check = await db.query('SELECT * FROM "Project" WHERE id = $1 AND "userId" = $2', [id, userId]);
            if (check.rows.length === 0) return res.status(403).json({ error: 'Forbidden' });
        }

        const result = await db.query(
            'UPDATE "Project" SET "projectId" = $1, username = $2, status = $3, "ipAddress" = $4, country = $5 WHERE id = $6 RETURNING *',
            [projectId, username, status, ipAddress, country, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete project
router.delete('/:id', checkAuth, async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.id;
    const userRole = req.session.user.role;

    try {
        if (userRole !== 'admin') {
            const check = await db.query('SELECT * FROM "Project" WHERE id = $1 AND "userId" = $2', [id, userId]);
            if (check.rows.length === 0) return res.status(403).json({ error: 'Forbidden' });
        }

        await db.query('DELETE FROM "Project" WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
