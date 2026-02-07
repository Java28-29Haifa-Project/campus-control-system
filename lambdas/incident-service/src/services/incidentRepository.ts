import { Pool } from 'pg';
import { Incident, IncidentStatus, GetIncidentsFilters } from '../types/incident.js';

const ERROR_CODES = {
    DB_CONNECTION: 'DB_CONNECTION_ERROR',
    DB_QUERY: 'DB_QUERY_ERROR',
    NOT_FOUND: 'NOT_FOUND'
};

export class IncidentRepository {
    constructor(private pool: Pool) {}

    async createIncident(incident: Omit<Incident, 'createdAt' | 'updatedAt'>): Promise<Incident> {
        const query = `
            INSERT INTO incidents (
                incident_id, priority, status, category,
                description, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING
                incident_id AS "incidentId",
                priority,
                status,
                category,
                description,
                created_by AS "createdBy",
                assigned_by AS "assignedBy",
                resolved_by AS "resolvedBy",
                created_at AS "createdAt",
                updated_at AS "updatedAt"
        `;

        try {
            const result = await this.pool.query(query, [
                incident.incidentId,
                incident.priority,
                incident.status,
                incident.category,
                incident.description || null,
                incident.createdBy
            ]);

            const createdIncident = result.rows[0];

            // Link tickets to incident
            if (incident.ticketIds && incident.ticketIds.length > 0) {
                await this.linkTickets(incident.incidentId, incident.ticketIds);
            }

            // Get tickets to include in response
            createdIncident.ticketIds = incident.ticketIds;

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
                i.priority,
                i.status,
                i.category,
                i.description,
                i.created_by AS "createdBy",
                i.assigned_by AS "assignedBy",
                i.resolved_by AS "resolvedBy",
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
                i.priority,
                i.status,
                i.category,
                i.description,
                i.created_by AS "createdBy",
                i.assigned_by AS "assignedBy",
                i.resolved_by AS "resolvedBy",
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
        const query = `
            UPDATE incidents
            SET
                status = $1,
                updated_at = CURRENT_TIMESTAMP,
                ${status === 'resolved' ? 'resolved_by = $2,' : ''}
                1=1
            WHERE incident_id = $${status === 'resolved' ? '3' : '2'}
            RETURNING
                incident_id AS "incidentId",
                priority,
                status,
                category,
                description,
                created_by AS "createdBy",
                assigned_by AS "assignedBy",
                resolved_by AS "resolvedBy",
                created_at AS "createdAt",
                updated_at AS "updatedAt"
        `;

        const params = status === 'resolved'
            ? [status, updatedBy, incidentId]
            : [status, incidentId];

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

    async assignIncident(incidentId: string, assignedBy: string): Promise<Incident> {
        const query = `
            UPDATE incidents
            SET
                status = 'assigned',
                assigned_by = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE incident_id = $2
            RETURNING
                incident_id AS "incidentId",
                priority,
                status,
                category,
                description,
                created_by AS "createdBy",
                assigned_by AS "assignedBy",
                resolved_by AS "resolvedBy",
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

    async updatePriority(incidentId: string, priority: number): Promise<Incident> {
        const query = `
            UPDATE incidents
            SET
                priority = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE incident_id = $2
            RETURNING
                incident_id AS "incidentId",
                priority,
                status,
                category,
                description,
                created_by AS "createdBy",
                assigned_by AS "assignedBy",
                resolved_by AS "resolvedBy",
                created_at AS "createdAt",
                updated_at AS "updatedAt"
        `;

        try {
            const result = await this.pool.query(query, [priority, incidentId]);

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
}
