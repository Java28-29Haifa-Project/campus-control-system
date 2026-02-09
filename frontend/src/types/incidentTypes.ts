
export const enum IncidentStatus {
    Open = 'OPEN',
    Assign = 'ASSIGNED',
    InProgress = 'IN_PROGRESS',
    Resolved = 'RESOLVED',
    Closed = 'CLOSED'
};
export const enum IncidentImpact {
    Low = 'low',
    Medium = 'medium',
    High = 'high'
}
export const enum IncidentUrgencies {
    Low = 'low',
    Medium = 'medium',
    High = 'high'
}
export const enum IncidentPriority {
    P1 = 'P1',
    P2 = 'P2',
    P3 = 'P3',
    P4 = 'P4'
}

export interface Incident {
    incidentId: string;
    ticketIds: string[];
    priority: IncidentPriority;
    status: IncidentStatus;
    category: string;
    description: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    assignedBy?: string;
    comment?: string;
}
export type CreateIncidentRequest = {
    ticketIds: string[];
    impact: string;
    urgency: string;
    category: string;
    description: string;
};
export interface IncidentResponse {
    incident: Incident;
}

export type UpdateIncidentRequest = {
    incidentId: string;
    status?: IncidentStatus;
    urgency?: string;
    category?: string;
    updatedBy: string;
};

