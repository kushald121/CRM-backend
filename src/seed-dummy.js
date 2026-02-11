const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const seedDummyData = async () => {
    const client = await pool.connect();
    try {
        console.log('Seeding 15 projects and 15 reviews...');

        // Get user ID for user@crm.com
        const userRes = await client.query('SELECT id FROM "User" WHERE email = $1', ['user@crm.com']);
        if (userRes.rows.length === 0) {
            console.error('User user@crm.com not found. Please run seed.js first.');
            return;
        }
        const userId = userRes.rows[0].id;

        // Seed 15 Projects
        const statuses = ['directors', 'security', 'marketing', 'research', 'development'];
        const countries = ['United States', 'United Kingdom', 'Canada', 'Germany', 'France'];

        for (let i = 1; i <= 15; i++) {
            const projectId = (9000 + i).toString();
            const username = `test_user_${i}`;
            const status = statuses[i % statuses.length];
            const ip = `192.168.1.${100 + i}`;
            const country = countries[i % countries.length];

            await client.query(
                'INSERT INTO "Project" ("projectId", username, status, "ipAddress", country, "userId") VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
                [projectId, username, status, ip, country, userId]
            );
        }

        // Seed 15 Reviews
        for (let i = 1; i <= 15; i++) {
            const title = `Insightful Feedback #${i}`;
            const desc = `This is a detailed review for testing pagination. Item number ${i} in the list.`;
            const rating = (i % 5) + 1;

            await client.query(
                'INSERT INTO "Review" (title, description, rating, "userId") VALUES ($1, $2, $3, $4)',
                [title, desc, rating, userId]
            );
        }

        console.log('Successfully seeded 15 projects and 15 reviews!');
    } catch (err) {
        console.error('Error seeding data:', err);
    } finally {
        client.release();
        await pool.end();
    }
};

seedDummyData();
