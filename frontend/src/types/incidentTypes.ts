
export const enum IncidentStatus {
    New = 'new',
    Assign = 'assigned',
    InProgress = 'in_progress',
    Resolved = 'resolved',
    Closed = 'closed'
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
    P1 = 4,
    P2 = 3,
    P3 = 2,
    P4 = 1
}

export type CommentIncident = {
        commentId: string;
        incidentId: string;
        commentText: string;
        createdBy: string;
        createdAt: string;
        updatedAt: string;
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
    comment?: CommentIncident[];
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

