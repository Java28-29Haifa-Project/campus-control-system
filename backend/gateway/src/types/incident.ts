export enum IncidentStatus {
    New = 'new',
    Assigned = 'assigned',
    InProgress = 'in_progress',
    Resolved = 'resolved',
    Closed = 'closed'
}

export enum Impact {
    Low = 'low',
    Medium = 'medium',
    High = 'high',
    Critical = 'critical'
}

export enum IncidentPriority {
    P1 = 'P1',
    P2 = 'P2',
    P3 = 'P3',
    P4 = 'P4'
}

export type Incident = {
    incidentId: string;
    incidentNumber: string;
    priority: IncidentPriority;
    status: IncidentStatus;
    impact: string;
    urgency: string;
    category: string;
    description?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
};

export type CreateIncidentRequest = {
    ticketIds: string[];
    impact: string;
    urgency: string;
    category: string;
    description: string;
    createdBy: string;
};

export type UpdateIncidentRequest = {
    incidentId: string;
    status?: IncidentStatus;
    urgency?: string;
    category?: string;
    updatedBy: string;
};