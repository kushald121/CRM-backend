const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// Session Store
const PgSession = require('connect-pg-simple')(session);
const db = require('./db');

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.set('trust proxy', 1);

app.use(session({
    store: new PgSession({
        pool: db.pool,
        tableName: 'session',
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'crm_secret',
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Request Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - SessionID: ${req.sessionID}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);

// Health check / Diagnostics
app.get('/api/health', async (req, res) => {
    try {
        const dbCheck = await db.query('SELECT NOW()');
        res.json({
            status: 'ok',
            database: 'connected',
            time: dbCheck.rows[0].now,
            session: req.session.user ? 'authenticated' : 'anonymous',
            user: req.session.user || null
        });
    } catch (err) {
        res.status(500).json({ status: 'error', database: 'disconnected', error: err.message });
    }
});

// Root route
app.get('/', (req, res) => {
    res.send('CRM API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
