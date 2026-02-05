import {
    IncidentCreateInputDTO,
    IncidentOutputDTO,
    IncidentStatusUpdateDTO,
    IncidentPriorityUpdateDTO
} from '../../../types/incident.js';

export interface CreateIncidentInputLambda {
    action: 'CREATE_INCIDENT';
    ticketIds: string[];
    impact: 'low' | 'medium' | 'high' | 'critical';
    urgency: 'low' | 'medium' | 'high';
    category: string;
    description?: string;
    createdBy: string;
}

export interface AssignIncidentInputLambda {
    action: 'ASSIGN_INCIDENT';
    incidentId: string;
    assignedBy: string;  // Engineer ID
}

export interface UpdateIncidentStatusInputLambda {
    action: 'UPDATE_STATUS';
    incidentId: string;
    status: string;
    comment?: string;
    updatedBy: string;
}

export interface UpdateIncidentPriorityInputLambda {
    action: 'UPDATE_PRIORITY';
    incidentId: string;
    priority: number;
    comment?: string;
    updatedBy: string;
}

export interface GetIncidentsInputLambda {
    action: 'GET_INCIDENTS';
    filters?: {
        status?: string;
        priority?: number;
        category?: string;
        assignedBy?: string;
    };
}

export interface GetIncidentByIdInputLambda {
    action: 'GET_INCIDENT_BY_ID';
    incidentId: string;
}

export interface IIncidentLambdaService {
    createIncident(input: CreateIncidentInputLambda): Promise<IncidentOutputDTO>;
    assignIncident(input: AssignIncidentInputLambda): Promise<IncidentOutputDTO>;
    updateIncidentStatus(input: UpdateIncidentStatusInputLambda): Promise<IncidentOutputDTO>;
    updateIncidentPriority(input: UpdateIncidentPriorityInputLambda): Promise<IncidentOutputDTO>;
    getIncidents(input: GetIncidentsInputLambda): Promise<IncidentOutputDTO[]>;
    getIncidentById(input: GetIncidentByIdInputLambda): Promise<IncidentOutputDTO>;
    healthCheck(): Promise<{ service: string; status: string; timestamp: string }>;
}