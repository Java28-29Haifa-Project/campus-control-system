import { Pool } from 'pg';

export const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

db.on('connect', () => {
    console.log('Connected to PostgreSQL');
});

db.on('error', (err) => {
    console.error('PostgreSQL error', err);
});
