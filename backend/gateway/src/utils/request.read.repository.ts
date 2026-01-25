import { db } from './db.client.ts';
import { TicketRequest, TicketRequestStatus } from '../types/ticketRequest.ts';

export async function getAllRequestsFromDB(
    status?: TicketRequestStatus,
    user?: { userId: string; role: string }
): Promise<TicketRequest[]> {
    let query = `
    SELECT
      request_id AS "requestId",
      request_number AS "requestNumber",
      category,
      subject,
      user_reported_priority AS "userReportedPriority",
      status,
      created_at AS "createdAt",
      created_by AS "userId"
    FROM requests
  `;

    const params: any[] = [];
    const conditions: string[] = [];

    if (user?.role === 'USER') {
        conditions.push(`created_by = $${params.length + 1}`);
        params.push(user.userId);
    }

    if (status) {
        conditions.push(`status = $${params.length + 1}`);
        params.push(status);
    }

    if (conditions.length) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const { rows } = await db.query(query, params);
    return rows;
}



export async function getRequestByIdFromDB(
    requestId: string
): Promise<TicketRequest | null> {
    const { rows } = await db.query(
        `
    SELECT
      request_id   AS "requestId",
      request_number AS "requestNumber",
      category,
      subject,
      user_reported_priority AS "userReportedPriority",
      status,
      created_at AS "createdAt",
      created_by AS "userId"
    FROM requests
    WHERE request_id = $1
    `,
        [requestId]
    );

    return rows[0] ?? null;
}