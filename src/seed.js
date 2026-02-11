const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const seed = async () => {
    const client = await pool.connect();
    try {
        console.log('Seeding database...');

        // Create tables if they don't exist (fallback for migration issues)
        await client.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "Project" (
        id SERIAL PRIMARY KEY,
        "projectId" TEXT NOT NULL,
        username TEXT NOT NULL,
        status TEXT NOT NULL,
        "ipAddress" TEXT NOT NULL,
        country TEXT NOT NULL,
        "userId" INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "Review" (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        rating INTEGER NOT NULL,
        "userId" INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Add users
        const users = [
            ['admin@crm.com', 'admin123', 'Admin User', 'admin'],
            ['user@crm.com', 'user123', 'John Doe', 'user'],
            ['jane@example.com', 'user123', 'Jane Smith', 'user']
        ];

        for (const [email, password, name, role] of users) {
            await client.query(
                'INSERT INTO "User" (email, password, name, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
                [email, password, name, role]
            );
        }

        // Get user IDs
        const usersRes = await client.query('SELECT id, email FROM "User"');
        const userMap = {};
        usersRes.rows.forEach(u => userMap[u.email] = u.id);

        // Add projects
        const projects = [
            ['9135', 'yewgbcbdsgdysugdsMI7', 'directors', '65.190.68.134', 'United States', userMap['user@crm.com']],
            ['9095', 'yddbeywgdsbDUysgdMI', 'security', '143.222.151.22', 'United States', userMap['user@crm.com']],
            ['9129', 'fyewgusdzusdMI', 'directors', '166.181.83.137', 'United States', userMap['jane@example.com']]
        ];

        for (const [pid, uname, status, ip, country, uid] of projects) {
            await client.query(
                'INSERT INTO "Project" ("projectId", username, status, "ipAddress", country, "userId") VALUES ($1, $2, $3, $4, $5, $6)',
                [pid, uname, status, ip, country, uid]
            );
        }

        // Add reviews
        const reviews = [
            ['Great experience', 'The CRM system is very user-friendly.', 5, userMap['user@crm.com']],
            ['Excellent features', 'Love the dashboard.', 5, userMap['jane@example.com']]
        ];

        for (const [title, desc, rating, uid] of reviews) {
            await client.query(
                'INSERT INTO "Review" (title, description, rating, "userId") VALUES ($1, $2, $3, $4)',
                [title, desc, rating, uid]
            );
        }

        console.log('Database seeded successfully!');
    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        client.release();
        await pool.end();
    }
};

seed();
