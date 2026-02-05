import {
    IncidentCreateInputDTO,
    IncidentOutputDTO,
    IncidentStatusUpdateDTO,
    IncidentPriorityUpdateDTO,
    CreateIncidentApiGatewayRequest,
    UpdateIncidentStatusApiGatewayRequest,
    UpdateIncidentPriorityApiGatewayRequest
} from '../../../types/incident.js';

export interface IIncidentLambdaService {
    createIncident(
        incidentId: string,
        request: CreateIncidentApiGatewayRequest
    ): Promise<IncidentOutputDTO>;

    updateIncidentStatus(
        request: UpdateIncidentStatusApiGatewayRequest
    ): Promise<IncidentOutputDTO>;

    raiseIncidentPriority(
        request: UpdateIncidentPriorityApiGatewayRequest
    ): Promise<IncidentOutputDTO>;

    healthCheck(): Promise<{
        service: string;
        status: 'UP' | 'DOWN';
        timestamp: string;
    }>;
}