import { IIncidentApiGateway } from '../interfaces/IIncidentApiGateway.js';
import {
    IncidentOutputDTO,
    CreateIncidentApiGatewayRequest,
    UpdateIncidentStatusApiGatewayRequest,
    UpdateIncidentPriorityApiGatewayRequest,
    Impact,
    Urgency,
    IncidentStatus,
    IncidentPriority
} from '../../../types/incident.js';

class IncidentApiGatewayMock implements IIncidentApiGateway {
    private incidents: Map<string, IncidentOutputDTO> = new Map();
    private incidentCounter = 0;

    async createIncident(
        incidentId: string,
        request: CreateIncidentApiGatewayRequest
    ): Promise<IncidentOutputDTO> {

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
            updatedAt: new Date()
        };

        this.incidents.set(incidentId, incident);

        console.log(`[Mock] Created incident ${incidentId} with priority ${priority} (from ${request.impact}/${request.urgency})`);

        return incident;
    }

    async updateIncidentStatus(
        request: UpdateIncidentStatusApiGatewayRequest
    ): Promise<IncidentOutputDTO> {

        const incident = this.incidents.get(request.incidentId);

        if (!incident) {
            throw new Error('Incident not found');
        }

        this.validateStatusTransition(incident.status, request.status);

        if (request.status === IncidentStatus.Assigned && !incident.assignedBy) {
            incident.assignedBy = request.updatedBy;
        }
        if (request.status === IncidentStatus.Resolved) {
            incident.resolvedBy = request.updatedBy;
        }

        incident.status = request.status;
        incident.updatedAt = new Date();

        console.log(`[Mock] Updated incident ${request.incidentId} status to ${request.status} by ${request.updatedBy}`);

        return incident;
    }

    async raiseIncidentPriority(
        request: UpdateIncidentPriorityApiGatewayRequest
    ): Promise<IncidentOutputDTO> {

        const incident = this.incidents.get(request.incidentId);

        if (!incident) {
            throw new Error('Incident not found');
        }

        if (request.priority > incident.priority) {
            throw new Error(`Cannot lower priority from ${incident.priority} to ${request.priority}`);
        }

        incident.priority = request.priority;
        incident.updatedAt = new Date();

        console.log(`[Mock] Raised incident ${request.incidentId} priority to ${request.priority} by ${request.updatedBy}`);

        return incident;
    }

    async healthCheck(): Promise<{ service: string; status: 'UP' | 'DOWN'; timestamp: string }> {
        return {
            service: 'incident-api-gateway-mock',
            status: 'UP',
            timestamp: new Date().toISOString()
        };
    }

    private calculatePriority(impact: Impact, urgency: Urgency): IncidentPriority {
        const priorityMatrix: Record<Impact, Record<Urgency, IncidentPriority>> = {
            [Impact.Critical]: {
                [Urgency.Low]: 1,
                [Urgency.Medium]: 1,
                [Urgency.High]: 1
            },
            [Impact.High]: {
                [Urgency.Low]: 2,
                [Urgency.Medium]: 1,
                [Urgency.High]: 1
            },
            [Impact.Medium]: {
                [Urgency.Low]: 3,
                [Urgency.Medium]: 2,
                [Urgency.High]: 2
            },
            [Impact.Low]: {
                [Urgency.Low]: 4,
                [Urgency.Medium]: 3,
                [Urgency.High]: 3
            }
        };

        return priorityMatrix[impact][urgency];
    }

     private validateStatusTransition(currentStatus: IncidentStatus, newStatus: IncidentStatus): void {
        const statusOrder = [
            IncidentStatus.New,
            IncidentStatus.Assigned,
            IncidentStatus.InProgress,
            IncidentStatus.Resolved,
            IncidentStatus.Closed
        ];

        const currentIndex = statusOrder.indexOf(currentStatus);
        const newIndex = statusOrder.indexOf(newStatus);

        if (newIndex < currentIndex) {
            throw new Error(
                `Invalid status transition: cannot go from ${currentStatus} to ${newStatus}. ` +
                `Status can only move forward: ${statusOrder.join(' → ')}`
            );
        }
    }

    getIncident(incidentId: string): IncidentOutputDTO | undefined {
        return this.incidents.get(incidentId);
    }


    getAllIncidents(): IncidentOutputDTO[] {
        return Array.from(this.incidents.values());
    }
}

export const incidentApiGatewayMock = new IncidentApiGatewayMock();