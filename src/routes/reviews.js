const express = require('express');
const router = express.Router();
const db = require('../db');

const checkAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Get reviews
router.get('/', checkAuth, async (req, res) => {
    try {
        const user = req.session.user;
        let result;
        if (user.role === 'admin') {
            result = await db.query('SELECT * FROM "Review" ORDER BY "createdAt" DESC');
        } else {
            result = await db.query('SELECT * FROM "Review" WHERE "userId" = $1 ORDER BY "createdAt" DESC', [user.id]);
        }
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add review
router.post('/', checkAuth, async (req, res) => {
    const { title, description, rating } = req.body;
    const userId = req.session.user.id;
    try {
        const result = await db.query(
            'INSERT INTO "Review" (title, description, rating, "userId") VALUES ($1, $2, $3, $4) RETURNING *',
            [title, description, rating, userId]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update review
router.put('/:id', checkAuth, async (req, res) => {
    const { id } = req.params;
    const { title, description, rating } = req.body;
    const userId = req.session.user.id;
    const userRole = req.session.user.role;

    try {
        if (userRole !== 'admin') {
            const check = await db.query('SELECT * FROM "Review" WHERE id = $1 AND "userId" = $2', [id, userId]);
            if (check.rows.length === 0) return res.status(403).json({ error: 'Forbidden' });
        }

        const result = await db.query(
            'UPDATE "Review" SET title = $1, description = $2, rating = $3 WHERE id = $4 RETURNING *',
            [title, description, rating, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete review
router.delete('/:id', checkAuth, async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.id;
    const userRole = req.session.user.role;

    try {
        if (userRole !== 'admin') {
            const check = await db.query('SELECT * FROM "Review" WHERE id = $1 AND "userId" = $2', [id, userId]);
            if (check.rows.length === 0) return res.status(403).json({ error: 'Forbidden' });
        }

        await db.query('DELETE FROM "Review" WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
