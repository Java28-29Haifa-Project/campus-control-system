export type Impact = 'low' | 'medium' | 'high' | 'critical';
export type Urgency = 'low' | 'medium' | 'high';
export type IncidentStatus = 'new' | 'assigned' | 'in_progress' | 'resolved' | 'closed';

export type IncidentCategory =
    | 'plumbing'
    | 'electrical'
    | 'hvac'
    | 'gas'
    | 'fire_safety'
    | 'elevators'
    | 'access'
    | 'network'
    | 'infrastructure'
    | 'other'
    | 'system';

export interface Incident {
    incidentId: string;
    ticketIds: string[];
    priority: number;
    status: IncidentStatus;
    category: IncidentCategory;
    description?: string;
    createdBy: string;
    assignedBy?: string;
    resolvedBy?: string;
    createdAt: string;
    updatedAt: string;
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
    comment?: string;
    updatedBy: string;
}

export interface UpdatePriorityInput {
    incidentId: string;
    priority: number;
    comment?: string;
    updatedBy: string;
}

export interface GetIncidentsFilters {
    status?: IncidentStatus;
    priority?: number;
    category?: IncidentCategory;
    assignedBy?: string;
    dateFrom?: Date;
    dateTo?: Date;
}
