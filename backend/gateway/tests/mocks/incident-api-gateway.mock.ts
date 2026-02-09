import { randomUUID } from 'crypto';
import {
    IncidentOutputDTO,
    IncidentStatus,
    IncidentCategory,
    CreateIncidentApiGatewayRequest,
    UpdateIncidentStatusApiGatewayRequest,
    UpdateIncidentPriorityApiGatewayRequest,
    IncidentPriority,
} from '../../src/types/incident.js';

export class IncidentApiGatewayMockForTesting {
    private incidents: Map<string, IncidentOutputDTO> = new Map();
    private shouldThrowError = false;
    private errorToThrow: Error | null = null;

    // ==================== Test Control Methods ====================

    reset() {
        this.incidents.clear();
        this.shouldThrowError = false;
        this.errorToThrow = null;
    }

    setShouldThrowError(error: Error) {
        this.shouldThrowError = true;
        this.errorToThrow = error;
    }

    clearError() {
        this.shouldThrowError = false;
        this.errorToThrow = null;
    }

    seedIncident(incident: IncidentOutputDTO) {
        this.incidents.set(incident.incidentId, incident);
    }

    seedIncidents(incidents: IncidentOutputDTO[]) {
        incidents.forEach(inc => this.seedIncident(inc));
    }

    getIncidentCount(): number {
        return this.incidents.size;
    }

    // ==================== API Gateway Methods ====================

    async getAllIncidents(): Promise<IncidentOutputDTO[]> {
        if (this.shouldThrowError && this.errorToThrow) {
            throw this.errorToThrow;
        }
        return Array.from(this.incidents.values());
    }

    async getIncident(incidentId: string): Promise<IncidentOutputDTO | null> {
        if (this.shouldThrowError && this.errorToThrow) {
            throw this.errorToThrow;
        }
        return this.incidents.get(incidentId) || null;
    }

    async createIncident(
        incidentId: string,
        request: CreateIncidentApiGatewayRequest
    ): Promise<IncidentOutputDTO> {
        if (this.shouldThrowError && this.errorToThrow) {
            throw this.errorToThrow;
        }

        // Validation
        if (!request.ticketIds || request.ticketIds.length === 0) {
            const error: any = new Error('At least one ticket ID is required');
            error.statusCode = 400;
            throw error;
        }

        if (request.category === IncidentCategory.System) {
            const error: any = new Error('SUPPORT cannot create system category incidents');
            error.statusCode = 403;
            throw error;
        }

        // Calculate priority
        const priority = this.calculatePriority(request.impact, request.urgency);

        const incident: IncidentOutputDTO = {
            incidentId,
            ticketIds: request.ticketIds,
            priority,
            status: IncidentStatus.New,
            category: request.category,
            description: request.description,
            createdBy: request.createdBy,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.incidents.set(incidentId, incident);
        return incident;
    }

    async updateIncidentStatus(
        request: UpdateIncidentStatusApiGatewayRequest
    ): Promise<IncidentOutputDTO> {
        if (this.shouldThrowError && this.errorToThrow) {
            throw this.errorToThrow;
        }

        const incident = this.incidents.get(request.incidentId);
        if (!incident) {
            const error: any = new Error('Incident not found');
            error.statusCode = 404;
            throw error;
        }

        // Validate status transition
        if (!this.isValidStatusTransition(incident.status, request.status)) {
            const error: any = new Error(`Invalid status transition from ${incident.status} to ${request.status}`);
            error.statusCode = 400;
            throw error;
        }

        const updatedIncident: IncidentOutputDTO = {
            ...incident,
            status: request.status,
            updatedAt: new Date(),
        };

        if (request.status === IncidentStatus.Assigned) {
            updatedIncident.assignedBy = request.updatedBy;
        }

        if (request.status === IncidentStatus.Resolved) {
            updatedIncident.resolvedBy = request.updatedBy;
        }

        this.incidents.set(request.incidentId, updatedIncident);
        return updatedIncident;
    }

    async raiseIncidentPriority(
        request: UpdateIncidentPriorityApiGatewayRequest
    ): Promise<IncidentOutputDTO> {
        if (this.shouldThrowError && this.errorToThrow) {
            throw this.errorToThrow;
        }

        const incident = this.incidents.get(request.incidentId);
        if (!incident) {
            const error: any = new Error('Incident not found');
            error.statusCode = 404;
            throw error;
        }

        // Validate priority change (can only raise, not lower)
        if (request.priority >= incident.priority) {
            const error: any = new Error(`Cannot lower priority from ${incident.priority} to ${request.priority}`);
            error.statusCode = 400;
            throw error;
        }

        // Validate priority range
        if (request.priority < 1 || request.priority > 4) {
            const error: any = new Error('Priority must be between 1 and 4');
            error.statusCode = 400;
            throw error;
        }

        const updatedIncident: IncidentOutputDTO = {
            ...incident,
            priority: request.priority,
            updatedAt: new Date(),
        };

        this.incidents.set(request.incidentId, updatedIncident);
        return updatedIncident;
    }

    // ==================== Helper Methods ====================

    private calculatePriority(impact: string, urgency: string): IncidentPriority {
        // Priority matrix:
        // Critical impact + High urgency = P1
        // High impact + High urgency = P1
        // High impact + Medium urgency = P2
        // Medium impact + High urgency = P2
        // Everything else = P3 or P4

        if (impact === 'critical' || (impact === 'high' && urgency === 'high')) {
            return 1;
        }
        if ((impact === 'high' && urgency === 'medium') || (impact === 'medium' && urgency === 'high')) {
            return 2;
        }
        if (impact === 'medium' || urgency === 'medium') {
            return 3;
        }
        return 4;
    }

    private isValidStatusTransition(from: IncidentStatus, to: IncidentStatus): boolean {
        const validTransitions: Record<IncidentStatus, IncidentStatus[]> = {
            [IncidentStatus.New]: [IncidentStatus.Assigned],
            [IncidentStatus.Assigned]: [IncidentStatus.InProgress],
            [IncidentStatus.InProgress]: [IncidentStatus.Resolved],
            [IncidentStatus.Resolved]: [IncidentStatus.Closed],
            [IncidentStatus.Closed]: [],
        };

        return validTransitions[from]?.includes(to) || false;
    }
}

export const createMockIncidentApiGateway = (): IncidentApiGatewayMockForTesting => {
    return new IncidentApiGatewayMockForTesting();
};