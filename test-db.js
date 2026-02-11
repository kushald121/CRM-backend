const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'FOUND' : 'NOT FOUND');

async function main() {
    const prisma = new PrismaClient();
    try {
        await prisma.$connect();
        console.log('Successfully connected to the database');
        await prisma.$disconnect();
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        process.exit(1);
    }
}

main();
