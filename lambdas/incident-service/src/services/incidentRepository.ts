import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import {AddCommentInput, IncidentComment} from '../types/comment';

import { Incident, IncidentStatus, GetIncidentsFilters } from '../types/incident.js';

const ERROR_CODES = {
    DB_CONNECTION: 'DB_CONNECTION_ERROR',
    DB_QUERY: 'DB_QUERY_ERROR',
    NOT_FOUND: 'NOT_FOUND'
};

export class IncidentRepository {
    constructor(private pool: Pool) {}

    async createIncident(incident: Omit<Incident, 'incidentNumber' | 'comments' | 'createdAt' | 'updatedAt'>): Promise<Incident>
    {
        const incidentId = randomUUID();
        const incidentNumber = `INC-${Date.now()}`;
        const priority = incident.priority;
        const status = incident.status || 'new';
        const category = incident.category;
        const description = incident.description || null;
        const createdBy = incident.createdBy;

        const query = `
            INSERT INTO incidents (
                incident_id, incident_number, priority, status, category,
                description, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING
                incident_id AS "incidentId",
                incident_number AS "incidentNumber", 
                priority,
                status,
                category,
                description,
                created_by AS "createdBy",
                assigned_by AS "assignedBy",
                resolved_by AS "resolvedBy",
                 updated_by AS "updatedBy",
                created_at AS "createdAt",
                updated_at AS "updatedAt"
        `;

        try {
            const result = await this.pool.query(query, [
                incidentId,
                incidentNumber,
                priority,
                status,
                category,
                description,
                createdBy
            ]);

            const createdIncident = result.rows[0];

            if (incident.ticketIds && incident.ticketIds.length > 0) {
                await this.linkTickets(incidentId, incident.ticketIds);
            }

            createdIncident.ticketIds = incident.ticketIds || [];

            return createdIncident;
        } catch (error: any) {
            console.error('Database error creating incident:', error);
            throw this.mapDatabaseError(error);
        }
    }

    async getIncidentById(incidentId: string): Promise<Incident | null> {
        const query = `
            SELECT
                i.incident_id AS "incidentId",
                i.incident_number AS "incidentNumber",
                i.priority,
                i.status,
                i.category,
                i.description,
                i.created_by AS "createdBy",
                i.assigned_by AS "assignedBy",
                i.resolved_by AS "resolvedBy",
                i.updated_by AS "updatedBy",
                i.created_at AS "createdAt",
                i.updated_at AS "updatedAt",
                COALESCE(
                        json_agg(ir.request_id) FILTER (WHERE ir.request_id IS NOT NULL),
                        '[]'
                ) AS "ticketIds"
            FROM incidents i
                     LEFT JOIN incident_requests ir ON i.incident_id = ir.incident_id
            WHERE i.incident_id = $1
            GROUP BY i.incident_id
        `;

        try {
            const result = await this.pool.query(query, [incidentId]);
            return result.rows[0] || null;
        } catch (error: any) {
            console.error('Database error getting incident:', error);
            throw this.mapDatabaseError(error);
        }
    }

    async getIncidents(filters: GetIncidentsFilters = {}): Promise<Incident[]> {
        let query = `
            SELECT
                i.incident_id AS "incidentId",
                i.incident_number AS "incidentNumber",
                i.priority,
                i.status,
                i.category,
                i.description,
                i.created_by AS "createdBy",
                i.assigned_by AS "assignedBy",
                i.resolved_by AS "resolvedBy",
                i.updated_by AS "updatedBy",
                i.created_at AS "createdAt",
                i.updated_at AS "updatedAt",
                COALESCE(
                        json_agg(ir.request_id) FILTER (WHERE ir.request_id IS NOT NULL),
                        '[]'
                ) AS "ticketIds"
            FROM incidents i
                     LEFT JOIN incident_requests ir ON i.incident_id = ir.incident_id
            WHERE 1=1
        `;

        const params: any[] = [];
        let paramIndex = 1;

        if (filters.status) {
            query += ` AND i.status = $${paramIndex++}`;
            params.push(filters.status);
        }

        if (filters.priority) {
            query += ` AND i.priority = $${paramIndex++}`;
            params.push(filters.priority);
        }

        if (filters.category) {
            query += ` AND i.category = $${paramIndex++}`;
            params.push(filters.category);
        }

        if (filters.assignedBy) {
            query += ` AND i.assigned_by = $${paramIndex++}`;
            params.push(filters.assignedBy);
        }

        if (filters.dateFrom) {
            query += ` AND i.created_at >= $${paramIndex++}`;
            params.push(filters.dateFrom);
        }

        if (filters.dateTo) {
            query += ` AND i.created_at <= $${paramIndex++}`;
            params.push(filters.dateTo);
        }

        query += ` GROUP BY i.incident_id ORDER BY i.created_at DESC`;

        try {
            const result = await this.pool.query(query, params);
            return result.rows;
        } catch (error: any) {
            console.error('Database error getting incidents:', error);
            throw this.mapDatabaseError(error);
        }
    }

    async updateIncidentStatus(
        incidentId: string,
        status: IncidentStatus,
        updatedBy: string
    ): Promise<Incident> {
        const isResolved = status === 'resolved';

        const query = `
            UPDATE incidents
            SET
                status = $1,
                updated_by = $2,
                updated_at = CURRENT_TIMESTAMP
                ${isResolved ? ', resolved_by = $2' : ''}
            WHERE incident_id = $3
            RETURNING
                incident_id AS "incidentId",
                incident_number AS "incidentNumber",
                priority,
                status,
                category,
                description,
                created_by AS "createdBy",
                assigned_by AS "assignedBy",
                resolved_by AS "resolvedBy",
                updated_by AS "updatedBy",
                created_at AS "createdAt",
                updated_at AS "updatedAt"
        `;

        const params = [status, updatedBy, incidentId];

        try {
            const result = await this.pool.query(query, params);

            if (result.rows.length === 0) {
                throw new Error('Incident not found');
            }

            const incident = result.rows[0];
            const tickets = await this.getTicketIds(incidentId);
            incident.ticketIds = tickets;

            return incident;
        } catch (error: any) {
            console.error('Database error updating status:', error);
            if (error.message === 'Incident not found') {
                throw error;
            }
            throw this.mapDatabaseError(error);
        }
    }

    async updateIncidentStatusWithAutoAssign(
        incidentId: string,
        status: IncidentStatus,
        updatedBy: string
    ): Promise<Incident> {
        const current = await this.getIncidentById(incidentId);

        if (!current) {
            throw new Error('Incident not found');
        }

        const shouldAutoAssign = status === 'in_progress' && !current.assignedBy;

        const query = `
        UPDATE incidents
        SET
            status = $1,
            updated_by = $2,
            ${shouldAutoAssign ? 'assigned_by = $2,' : ''}
            ${status === 'resolved' ? 'resolved_by = $2,' : ''}
            updated_at = CURRENT_TIMESTAMP
        WHERE incident_id = $3
        RETURNING
            incident_id AS "incidentId",
            incident_number AS "incidentNumber",
            priority,
            status,
            category,
            description,
            created_by AS "createdBy",
            assigned_by AS "assignedBy",
            resolved_by AS "resolvedBy",
            updated_by AS "updatedBy",
            created_at AS "createdAt",
            updated_at AS "updatedAt"
    `;

        const result = await this.pool.query(query, [status, updatedBy, incidentId]);

        if (result.rows.length === 0) {
            throw new Error('Incident not found');
        }

        const incident = result.rows[0];
        const tickets = await this.getTicketIds(incidentId);
        incident.ticketIds = tickets;

        return incident;
    }

    async assignIncident(incidentId: string, assignedBy: string): Promise<Incident> {
        const query = `
            UPDATE incidents
            SET
                status = 'assigned',
                assigned_by = $1,
                updated_by = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE incident_id = $2
                RETURNING
                incident_id AS "incidentId",
                incident_number AS "incidentNumber",
                priority,
                status,
                category,
                description,
                created_by AS "createdBy",
                assigned_by AS "assignedBy",
                resolved_by AS "resolvedBy",
                updated_by AS "updatedBy",
                created_at AS "createdAt",
                updated_at AS "updatedAt"
        `;

        try {
            const result = await this.pool.query(query, [assignedBy, incidentId]);

            if (result.rows.length === 0) {
                throw new Error('Incident not found');
            }

            const incident = result.rows[0];
            const tickets = await this.getTicketIds(incidentId);
            incident.ticketIds = tickets;

            return incident;
        } catch (error: any) {
            console.error('Database error assigning incident:', error);
            if (error.message === 'Incident not found') {
                throw error;
            }
            throw this.mapDatabaseError(error);
        }
    }

    async updatePriority(incidentId: string, priority: number, updatedBy: string): Promise<Incident> {
        const query = `
            UPDATE incidents
            SET
                priority = $1,
                updated_by = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE incident_id = $3
                RETURNING
                incident_id AS "incidentId",
                incident_number AS "incidentNumber",
                priority,
                status,
                category,
                description,
                created_by AS "createdBy",
                assigned_by AS "assignedBy",
                resolved_by AS "resolvedBy",
                updated_by AS "updatedBy",
                created_at AS "createdAt",
                updated_at AS "updatedAt"
        `;

        try {
            const result = await this.pool.query(query, [priority, updatedBy, incidentId]);

            if (result.rows.length === 0) {
                throw new Error('Incident not found');
            }

            const incident = result.rows[0];
            const tickets = await this.getTicketIds(incidentId);
            incident.ticketIds = tickets;

            return incident;
        } catch (error: any) {
            console.error('Database error updating priority:', error);
            if (error.message === 'Incident not found') {
                throw error;
            }
            throw this.mapDatabaseError(error);
        }
    }

    private async linkTickets(incidentId: string, ticketIds: string[]): Promise<void> {
        const values = ticketIds.map((_, i) => `($1, $${i + 2})`).join(', ');
        const query = `
            INSERT INTO incident_requests (incident_id, request_id)
            VALUES ${values}
                ON CONFLICT (incident_id, request_id) DO NOTHING
        `;

        await this.pool.query(query, [incidentId, ...ticketIds]);
    }

    private async getTicketIds(incidentId: string): Promise<string[]> {
        const query = `
            SELECT request_id
            FROM incident_requests
            WHERE incident_id = $1
        `;

        const result = await this.pool.query(query, [incidentId]);
        return result.rows.map(row => row.request_id);
    }

    private mapDatabaseError(error: any): Error {
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            const dbError: any = new Error('Database unavailable');
            dbError.code = ERROR_CODES.DB_CONNECTION;
            dbError.statusCode = 503;
            return dbError;
        }

        const dbError: any = new Error('Database operation failed');
        dbError.code = ERROR_CODES.DB_QUERY;
        dbError.statusCode = 500;
        return dbError;
    }

    async addComment(data: AddCommentInput): Promise<IncidentComment> {

        const commentId = randomUUID();

        const query = `
        INSERT INTO incident_comments (
            comment_id, incident_id, comment_text, created_by
        ) VALUES ($1, $2, $3, $4)
        RETURNING
            comment_id AS "commentId",
            incident_id AS "incidentId",
            comment_text AS "commentText",
            created_by AS "createdBy",
            created_at AS "createdAt",
            updated_at AS "updatedAt"
    `;

        const result = await this.pool.query(query, [
            commentId,
            data.incidentId,
            data.commentText,
            data.createdBy
        ]);

        return result.rows[0];
    }

    async getComments(incidentId: string): Promise<IncidentComment[]> {
        const query = `
        SELECT
            comment_id AS "commentId",
            incident_id AS "incidentId",
            comment_text AS "commentText",
            created_by AS "createdBy",
            created_at AS "createdAt",
            updated_at AS "updatedAt"
        FROM incident_comments
        WHERE incident_id = $1
        ORDER BY created_at ASC
    `;

        const result = await this.pool.query(query, [incidentId]);
        return result.rows;
    }
}