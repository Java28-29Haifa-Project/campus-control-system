import pg from 'pg';
const { Pool } = pg;

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {

    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000
        });

        pool.on('error', (err) => {
            console.error('Unexpected database pool error:', err);
        });
    }
    return pool;
}

export async function closePool(): Promise<void> {
    if (pool) {
        await pool.end();
        pool = null;
    }
}
