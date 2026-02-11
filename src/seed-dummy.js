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
        console.log('Seeding 15 dummy projects and 15 reviews...');

        // Get user IDs
        const usersRes = await client.query('SELECT id, email FROM "User"');
        const userMap = {};
        usersRes.rows.forEach(u => userMap[u.email] = u.id);

        const johnId = userMap['user@crm.com'];
        const janeId = userMap['jane@example.com'];

        if (!johnId || !janeId) {
            console.error('Core users not found. Run seed.js first.');
            return;
        }

        // Dummy Projects (15 total)
        const projectData = [
            ['P-1001', 'alpha_bot', 'active', '192.168.1.1', 'USA', johnId],
            ['P-1002', 'beta_bot', 'security', '192.168.1.2', 'UK', johnId],
            ['P-1003', 'gamma_sys', 'directors', '10.0.0.5', 'Canada', janeId],
            ['P-1004', 'delta_net', 'terminated', '172.16.0.10', 'Germany', johnId],
            ['P-1005', 'epsilon_cloud', 'active', '8.8.8.8', 'India', janeId],
            ['P-1006', 'zeta_core', 'security', '1.1.1.1', 'France', johnId],
            ['P-1007', 'eta_flow', 'active', '4.4.4.4', 'Australia', janeId],
            ['P-1008', 'theta_node', 'directors', '127.0.0.1', 'Japan', johnId],
            ['P-1009', 'iota_api', 'active', '192.168.5.5', 'Brazil', janeId],
            ['P-1010', 'kappa_web', 'terminated', '200.1.1.1', 'Mexico', johnId],
            ['P-1011', 'lambda_app', 'active', '150.150.150.150', 'Spain', janeId],
            ['P-1012', 'mu_db', 'security', '100.100.100.100', 'Italy', johnId],
            ['P-1013', 'nu_proxy', 'active', '50.50.50.50', 'China', janeId],
            ['P-1014', 'xi_stack', 'directors', '25.25.25.25', 'Russia', johnId],
            ['P-1015', 'omicron_v', 'security', '12.12.12.12', 'Sweden', janeId]
        ];

        for (const [pid, uname, status, ip, country, uid] of projectData) {
            await client.query(
                'INSERT INTO "Project" ("projectId", username, status, "ipAddress", country, "userId") VALUES ($1, $2, $3, $4, $5, $6)',
                [pid, uname, status, ip, country, uid]
            );
        }

        // Dummy Reviews (15 total)
        const reviewData = [
            ['Awesome UI', 'The dark mode looks incredible.', 5, johnId],
            ['Could be better', 'Mobile view has some glitches.', 3, janeId],
            ['Solid Backend', 'Never experienced any downtime.', 5, johnId],
            ['Pricey', 'A bit expensive for small teams.', 4, janeId],
            ['Life Saver', 'Automated our entire workflow.', 5, johnId],
            ['Needs more charts', 'Wish there were better visualizations.', 4, janeId],
            ['Fast Support', 'Got a reply within 2 minutes.', 5, johnId],
            ['Confusing setup', 'Initial configuration took too long.', 2, janeId],
            ['Best in class', 'Outperforms all competitors.', 5, johnId],
            ['Average', 'Does the job but nothing special.', 3, janeId],
            ['Highly Recommended', 'Perfect for our scaling needs.', 5, johnId],
            ['Buggy updates', 'Last patch broke the export feature.', 2, janeId],
            ['Clean code', 'APIs are very well documented.', 5, johnId],
            ['Great documentation', 'Easy to integrate with our system.', 4, janeId],
            ['Innovative', 'Love the unique features.', 5, johnId]
        ];

        for (const [title, desc, rating, uid] of reviewData) {
            await client.query(
                'INSERT INTO "Review" (title, description, rating, "userId") VALUES ($1, $2, $3, $4)',
                [title, desc, rating, uid]
            );
        }

        console.log('Seeding complete!');
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
};

seedDummyData();
