import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 2
});

export const handler = async (event) => {
    console.log('Processing stream:', JSON.stringify(event, null, 2));

    const results = { processed: 0, closed: 0, skipped: 0 };

    for (const record of event.Records) {
        if (record.eventName !== 'REMOVE') continue;

        const userIdentity = record.userIdentity;
        if (userIdentity?.type !== 'Service') continue;

        const oldImage = record.dynamodb?.OldImage;
        if (!oldImage) continue;

        const incidentId = oldImage.incidentId?.S;
        const ticketIds = oldImage.ticketIds?.L?.map(v => v.S) || [];

        if (!incidentId) continue;

        console.log(`Processing auto-close: ${incidentId}`);
        results.processed++;

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const result = await client.query(
                'SELECT status, incident_number FROM incidents WHERE incident_id = $1',
                [incidentId]
            );

            if (result.rows.length === 0) {
                console.log('Incident not found');
                results.skipped++;
                await client.query('ROLLBACK');
                continue;
            }

            const { status, incident_number } = result.rows[0];

            if (status !== 'resolved') {
                console.log(`Status is ${status}, not resolved. Skipping.`);
                results.skipped++;
                await client.query('ROLLBACK');
                continue;
            }

            await client.query(
                `UPDATE incidents 
                 SET status = 'closed', 
                     updated_at = CURRENT_TIMESTAMP,
                     updated_by = 'system-auto-close'
                 WHERE incident_id = $1`,
                [incidentId]
            );

            for (const ticketId of ticketIds) {
                await client.query(
                    `UPDATE requests 
                     SET status = 'done', 
                         updated_at = CURRENT_TIMESTAMP 
                     WHERE request_id = $1 AND status != 'done'`,
                    [ticketId]
                );
            }

            await client.query('COMMIT');
            console.log(`Closed ${incident_number}`);
            results.closed++;

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error:', error);
        } finally {
            client.release();
        }
    }

    console.log('Results:', results);
    return results;
};