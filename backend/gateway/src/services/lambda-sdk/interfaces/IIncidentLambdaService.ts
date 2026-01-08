export interface CreateIncidentInput {
    action: 'CREATE_INCIDENT';
    ticketIds: string[];
    impact: string;
    urgency: string;
    category: string;
    description: string;
    createdBy: string;
}

export interface GetIncidentInput {
    action: 'GET_INCIDENT';
    incidentId: string;
}

export interface GetIncidentsInput {
    action: 'GET_INCIDENTS';
    status?: string;
}

export interface UpdateIncidentInput {
    action: 'UPDATE_INCIDENT';
    incidentId: string;
    status?: string;
    urgency?: string;
    category?: string;
    updatedBy: string;
}

export interface IncidentLambdaResponse {
    incidentId: string;
    incidentNumber: string;
    priority: string;
    status: string;
    impact: string;
    urgency: string;
    category: string;
    description?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    sourceTickets?: string[];
    updatedBy?: string;
}

export interface IIncidentLambdaService {
    createIncident(input: CreateIncidentInput): Promise<IncidentLambdaResponse>;
    getIncident(input: GetIncidentInput): Promise<IncidentLambdaResponse>;
    getIncidents(input: GetIncidentsInput): Promise<IncidentLambdaResponse[]>;
    updateIncident(input: UpdateIncidentInput): Promise<Partial<IncidentLambdaResponse>>;
    healthCheck(): Promise<{ service: string; status: string; timestamp: string }>;
}