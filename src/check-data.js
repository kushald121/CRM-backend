const db = require('./db');

async function checkData() {
    try {
        const users = await db.query('SELECT count(*) FROM "User"');
        const projects = await db.query('SELECT count(*) FROM "Project"');
        const reviews = await db.query('SELECT count(*) FROM "Review"');

        console.log('Database Status:');
        console.log('- Users:', users.rows[0].count);
        console.log('- Projects:', projects.rows[0].count);
        console.log('- Reviews:', reviews.rows[0].count);

        const sampleProjects = await db.query('SELECT * FROM "Project" LIMIT 2');
        console.log('\nSample Projects:', JSON.stringify(sampleProjects.rows, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('Data check failed:', err);
        process.exit(1);
    }
}

checkData();
