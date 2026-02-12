export type Impact = 'low' | 'medium' | 'high' | 'critical';
export type Urgency = 'low' | 'medium' | 'high';
export type IncidentStatus = 'new' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
export type IncidentCategory =
    | 'plumbing' | 'electrical' | 'hvac' | 'gas'
    | 'fire_safety' | 'elevators' | 'access' | 'network'
    | 'infrastructure' | 'other' | 'system';

export interface IncidentComment {
    commentId: string;
    commentText: string;
    createdBy: string;
    createdAt: string;
}

export interface Incident {
    incidentId: string;
    incidentNumber: string;
    ticketIds: string[];
    priority: number;
    status: IncidentStatus;
    category: IncidentCategory;
    description?: string;
    createdBy: string;
    assignedBy?: string;
    resolvedBy?: string;
    updatedBy?: string;
    createdAt: string;
    updatedAt: string;
    comments: IncidentComment[];  // ← Array of comments
}

export interface CreateIncidentInput {
    ticketIds: string[];
    impact: Impact;
    urgency: Urgency;
    category: IncidentCategory;
    description?: string;
    createdBy: string;
}

export interface AssignIncidentInput {
    incidentId: string;
    assignedBy: string;
}

export interface UpdateStatusInput {
    incidentId: string;
    status: IncidentStatus;
    updatedBy: string;
}

export interface UpdatePriorityInput {
    incidentId: string;
    priority: number;
    updatedBy: string;
}

export interface AddCommentInput {
    incidentId: string;
    commentText: string;
    createdBy: string;
}

export interface GetIncidentsFilters {
    status?: IncidentStatus;
    priority?: number;
    category?: IncidentCategory;
    assignedBy?: string;
    dateFrom?: Date;
    dateTo?: Date;
}