import { IIncidentLambdaService, CreateIncidentInput, GetIncidentInput, GetIncidentsInput, UpdateIncidentInput, IncidentLambdaResponse } from '../interfaces/IIncidentLambdaService.js';

export class IncidentLambdaServiceMock implements IIncidentLambdaService {
    private incidents: IncidentLambdaResponse[] = [
        {
            incidentId: 'inc0',
            incidentNumber: 'INC-0',
            priority: 'P1',
            status: 'OPEN',
            impact: 'high',
            urgency: 'critical',
            category: 'Network',
            description: 'description0',
            createdBy: 'support0',
            createdAt: '2025-01-01T13:00:00Z',
            updatedAt: '2025-01-01T13:00:00Z',
            sourceTickets: ['REQ-0', 'REQ-1']
        },
        {
            incidentId: 'inc1',
            incidentNumber: 'INC-1',
            priority: 'P2',
            status: 'IN_PROGRESS',
            impact: 'medium',
            urgency: 'high',
            category: 'Hardware',
            description: 'description1',
            createdBy: 'support0',
            createdAt: '2025-01-02T10:00:00Z',
            updatedAt: '2025-01-02T11:30:00Z'
        }
    ];

    async createIncident(input: CreateIncidentInput): Promise<IncidentLambdaResponse> {
        const newIncident: IncidentLambdaResponse = {
            incidentId: `inc${this.incidents.length}`,
            incidentNumber: `INC-${this.incidents.length}`,
            priority: 'P1',
            status: 'OPEN',
            impact: input.impact,
            urgency: input.urgency,
            category: input.category,
            description: input.description,
            createdBy: input.createdBy,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sourceTickets: input.ticketIds
        };

        this.incidents.push(newIncident);
        return newIncident;
    }

    async getIncident(input: GetIncidentInput): Promise<IncidentLambdaResponse> {
        const incident = this.incidents.find(i => i.incidentId === input.incidentId);
        return incident || this.incidents[0];
    }

    async getIncidents(input: GetIncidentsInput): Promise<IncidentLambdaResponse[]> {
        let filtered = [...this.incidents];

        if (input.status) {
            filtered = filtered.filter(i => i.status === input.status);
        }

        return filtered;
    }

    async updateIncident(input: UpdateIncidentInput): Promise<Partial<IncidentLambdaResponse>> {
        const incident = this.incidents.find(i => i.incidentId === input.incidentId);

        if (incident) {
            if (input.status) incident.status = input.status;
            if (input.urgency) incident.urgency = input.urgency;
            if (input.category) incident.category = input.category;
            incident.updatedAt = new Date().toISOString();
        }

        return {
            incidentId: input.incidentId,
            incidentNumber: incident?.incidentNumber || 'INC-0',
            status: input.status,
            urgency: input.urgency,
            category: input.category,
            priority: incident?.priority || 'P1',
            updatedBy: input.updatedBy,
            updatedAt: new Date().toISOString()
        };
    }

    async healthCheck(): Promise<{ service: string; status: string; timestamp: string }> {
        return {
            service: 'incident-lambda',
            status: 'ok',
            timestamp: new Date().toISOString()
        };
    }
}

export const incidentLambdaServiceMock = new IncidentLambdaServiceMock();