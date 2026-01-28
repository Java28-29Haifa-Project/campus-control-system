import { Pool, QueryResult } from 'pg';
import { RequestQueryRepository } from '../RequestQueryRepository.js';
import { TicketRequest, TicketRequestStatus } from '../../types/ticketRequest.js';
import { db } from '../../utils/db.client.js';

class RequestQueryRepositoryDB implements RequestQueryRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async getAllRequests(
        status?: TicketRequestStatus,
        user?: { userId: string; role: string }
    ): Promise<TicketRequest[]> {
        try {
            let query = `
                SELECT
                    request_id AS "requestId",
                    request_number AS "requestNumber",
                    user_id AS "userId",
                    support_id AS "supportId",
                    category,
                    subject,
                    description,
                    user_reported_priority AS "userReportedPriority",
                    status,
                    created_at AS "createdAt",
                    updated_at AS "updatedAt",
                    created_by AS "createdBy",
                    updated_by AS "updatedBy"
                FROM requests
            `;

            const params: any[] = [];
            const conditions: string[] = [];

            if (user?.role === 'USER') {
                conditions.push(`user_id = $${params.length + 1}`);
                params.push(user.userId);
            }

            if (status) {
                conditions.push(`status = $${params.length + 1}`);
                params.push(status);
            }

            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            query += ' ORDER BY created_at DESC';

            const result: QueryResult = await this.pool.query(query, params);

            return result.rows as TicketRequest[];
        } catch (error) {
            console.error('[RequestQueryRepositoryDB] Error in getAllRequests:', error);
            throw new Error('Failed to fetch requests from database');
        }
    }

    async getRequestById(requestId: string): Promise<TicketRequest | null> {
        try {
            const query = `
                SELECT
                    request_id AS "requestId",
                    request_number AS "requestNumber",
                    user_id AS "userId",
                    support_id AS "supportId",
                    category,
                    subject,
                    description,
                    user_reported_priority AS "userReportedPriority",
                    status,
                    created_at AS "createdAt",
                    updated_at AS "updatedAt",
                    created_by AS "createdBy",
                    updated_by AS "updatedBy"
                FROM requests
                WHERE request_id = $1
            `;

            const result: QueryResult = await this.pool.query(query, [requestId]);

            if (result.rows.length === 0) {
                return null;
            }

            return result.rows[0] as TicketRequest;
        } catch (error) {
            console.error('[RequestQueryRepositoryDB] Error in getRequestById:', error);
            throw new Error(`Failed to fetch request ${requestId} from database`);
        }
    }

    async getRequestsByUser(
        userId: string,
        status?: TicketRequestStatus
    ): Promise<TicketRequest[]> {
        try {
            let query = `
                SELECT
                    request_id AS "requestId",
                    request_number AS "requestNumber",
                    user_id AS "userId",
                    support_id AS "supportId",
                    category,
                    subject,
                    description,
                    user_reported_priority AS "userReportedPriority",
                    status,
                    created_at AS "createdAt",
                    updated_at AS "updatedAt",
                    created_by AS "createdBy",
                    updated_by AS "updatedBy"
                FROM requests
                WHERE user_id = $1
            `;

            const params: any[] = [userId];

            if (status) {
                query += ` AND status = $2`;
                params.push(status);
            }

            query += ' ORDER BY created_at DESC';

            const result: QueryResult = await this.pool.query(query, params);

            return result.rows as TicketRequest[];
        } catch (error) {
            console.error('[RequestQueryRepositoryDB] Error in getRequestsByUser:', error);
            throw new Error(`Failed to fetch requests for user ${userId} from database`);
        }
    }


    async getUserRequestStats(userId: string): Promise<{
        total: number;
        new: number;
        in_service: number;
        done: number;
        rejected: number;
    }> {
        try {
            const query = `
                SELECT
                    COUNT(*) FILTER (WHERE status = 'new') AS new,
                    COUNT(*) FILTER (WHERE status = 'in_service') AS in_service,
                    COUNT(*) FILTER (WHERE status = 'done') AS done,
                    COUNT(*) FILTER (WHERE status = 'rejected') AS rejected,
                    COUNT(*) AS total
                FROM requests
                WHERE user_id = $1
            `;

            const result: QueryResult = await this.pool.query(query, [userId]);
            const row = result.rows[0];

            return {
                total: parseInt(row.total, 10),
                new: parseInt(row.new, 10),
                in_service: parseInt(row.in_service, 10),
                done: parseInt(row.done, 10),
                rejected: parseInt(row.rejected, 10)
            };
        } catch (error) {
            console.error('[RequestQueryRepositoryDB] Error in getUserRequestStats:', error);
            throw new Error(`Failed to fetch request stats for user ${userId}`);
        }
    }

    async getRequestCountToday(): Promise<number> {
        try {
            const query = `
            SELECT COUNT(*) as count 
            FROM requests 
            WHERE DATE(created_at) = CURRENT_DATE
        `;

            const result: QueryResult = await this.pool.query(query);
            return parseInt(result.rows[0].count, 10);
        } catch (error) {
            console.error('[RequestQueryRepositoryDB] Error in getRequestCountToday:', error);
            throw new Error('Failed to get request count for today');
        }
    }

}

export const requestQueryRepository = new RequestQueryRepositoryDB(db);