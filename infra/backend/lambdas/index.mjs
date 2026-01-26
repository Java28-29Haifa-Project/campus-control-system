import pg from 'pg';
const { Pool } = pg;

let pool;

function getPool() {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            max: 10
        });
    }
    return pool;
}

export const handler = async (event) => {
    console.log('Action received:', event.action);

    const pool = getPool();

    try {
        const { action, data } = event;

        switch (action) {
            case 'CREATE_REQUEST':
                return await createRequest(pool, data);

            case 'UPDATE_REQUEST':
                return await updateRequest(pool, data);

            case 'HEALTH_CHECK':
                return {
                    statusCode: 200,
                    body: {
                        service: 'requests-lambda',
                        status: 'UP',
                        timestamp: new Date().toISOString()
                    }
                };

            default:
                return {
                    statusCode: 400,
                    body: { error: `Unknown action: ${action}` }
                };
        }

    } catch (error) {
        console.error('Lambda error:', error);
        return {
            statusCode: 500,
            body: { error: error.message }
        };
    }
};

async function createRequest(pool, data) {
    const { requestNumber, category, subject, userReportedPriority, createdBy } = data;

    const query = `
        INSERT INTO requests (
            request_number, user_id, category, subject,
            user_reported_priority, ai_calculated_priority,
            status, created_by, updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING 
            request_id AS "requestId",
            request_number AS "requestNumber",
            user_id AS "userId",
            category, subject,
            user_reported_priority AS "userReportedPriority",
            status,
            created_at AS "createdAt",
            updated_at AS "updatedAt"
    `;

    const result = await pool.query(query, [
        requestNumber, createdBy, category, subject,
        userReportedPriority, userReportedPriority,
        'new', createdBy, createdBy
    ]);

    return {
        statusCode: 201,
        body: result.rows[0]
    };
}

async function updateRequest(pool, data) {
    const { requestId, updates } = data;

    const fields = [];
    const values = [];
    let index = 1;

    const fieldMap = {
        category: 'category',
        subject: 'subject',
        userReportedPriority: 'user_reported_priority',
        status: 'status',
        updatedBy: 'updated_by'
    };

    for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined && fieldMap[key]) {
            fields.push(`${fieldMap[key]} = $${index++}`);
            values.push(value);
        }
    }

    if (fields.length === 0) {
        return { statusCode: 400, body: { error: 'No fields to update' } };
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    const query = `
        UPDATE requests 
        SET ${fields.join(', ')}
        WHERE request_id = $${index}
        RETURNING 
            request_id AS "requestId",
            request_number AS "requestNumber",
            status,
            updated_at AS "updatedAt"
    `;

    values.push(requestId);
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
        return { statusCode: 404, body: { error: 'Request not found' } };
    }

    return { statusCode: 200, body: result.rows[0] };
}