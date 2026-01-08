import { IncidentService } from '../IncidentService.js';
import { Incident, CreateIncidentRequest, UpdateIncidentRequest, IncidentStatus } from '../../types/incident.js';
import { IIncidentLambdaService } from '../lambda-sdk/interfaces/IIncidentLambdaService.js';
import { incidentLambdaServiceMock } from '../lambda-sdk/mocks/IncidentLambdaServiceMock.js';

class IncidentServiceImplAWSLambda implements IncidentService {
    private lambdaService: IIncidentLambdaService = incidentLambdaServiceMock;

    async createIncident(request: CreateIncidentRequest): Promise<Incident> {
        const lambdaResponse = await this.lambdaService.createIncident({
            action: 'CREATE_INCIDENT',
            ticketIds: request.ticketIds,
            impact: request.impact,
            urgency: request.urgency,
            category: request.category,
            description: request.description,
            createdBy: request.createdBy
        });

        return {
            incidentId: lambdaResponse.incidentId,
            incidentNumber: lambdaResponse.incidentNumber,
            priority: lambdaResponse.priority as any,
            status: lambdaResponse.status as any,
            impact: lambdaResponse.impact,
            urgency: lambdaResponse.urgency,
            category: lambdaResponse.category,
            description: lambdaResponse.description,
            createdBy: lambdaResponse.createdBy,
            createdAt: lambdaResponse.createdAt,
            updatedAt: lambdaResponse.updatedAt
        };
    }

    async getIncident(incidentId: string): Promise<Incident> {
        const lambdaResponse = await this.lambdaService.getIncident({
            action: 'GET_INCIDENT',
            incidentId
        });

        return {
            incidentId: lambdaResponse.incidentId,
            incidentNumber: lambdaResponse.incidentNumber,
            priority: lambdaResponse.priority as any,
            status: lambdaResponse.status as any,
            impact: lambdaResponse.impact,
            urgency: lambdaResponse.urgency,
            category: lambdaResponse.category,
            description: lambdaResponse.description,
            createdBy: lambdaResponse.createdBy,
            createdAt: lambdaResponse.createdAt,
            updatedAt: lambdaResponse.updatedAt
        };
    }

    async getIncidents(status?: IncidentStatus): Promise<Incident[]> {
        const lambdaResponse = await this.lambdaService.getIncidents({
            action: 'GET_INCIDENTS',
            status: status
        });

        return lambdaResponse.map(r => ({
            incidentId: r.incidentId,
            incidentNumber: r.incidentNumber,
            priority: r.priority as any,
            status: r.status as any,
            impact: r.impact,
            urgency: r.urgency,
            category: r.category,
            description: r.description,
            createdBy: r.createdBy,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt
        }));
    }

    async updateIncident(request: UpdateIncidentRequest): Promise<Partial<Incident>> {
        const lambdaResponse = await this.lambdaService.updateIncident({
            action: 'UPDATE_INCIDENT',
            incidentId: request.incidentId,
            status: request.status,
            urgency: request.urgency,
            category: request.category,
            updatedBy: request.updatedBy
        });

        return {
            incidentId: lambdaResponse.incidentId,
            incidentNumber: lambdaResponse.incidentNumber,
            status: lambdaResponse.status as any,
            updatedAt: lambdaResponse.updatedAt
        };
    }
}

export const incidentServiceAWSLambda = new IncidentServiceImplAWSLambda();