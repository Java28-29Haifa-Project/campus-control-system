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

export enum Urgency {
    Low = 'low',
    Medium = 'medium',
    High = 'high'
}

export type IncidentPriority = 1 | 2 | 3 | 4;

export enum IncidentCategory {
    Plumbing = 'plumbing',
    Electrical = 'electrical',
    HVAC = 'hvac',
    Gas = 'gas',
    FireSafety = 'fire_safety',
    Elevators = 'elevators',
    Access = 'access',
    Network = 'network',
    Infrastructure = 'infrastructure',
    Other = 'other',
    System = 'system'
}

// input dto
//TODO think about created / updated By field

export interface IncidentCreateInputDTO {
    ticketIds: string[];
    impact: Impact;
    urgency: Urgency;
    category: IncidentCategory;
    description?: string;
    // createdBy: string;
}

export interface IncidentStatusUpdateDTO {
    status: IncidentStatus;
    comment?: string;
    // updatedBy: string;
}

export interface IncidentPriorityUpdateDTO {
    priority: IncidentPriority;  // Engineer can only raise (1<-2<-3<-4)
    comment?: string;
    // updatedBy: string;
}

//output dto
export interface IncidentOutputDTO {
    incidentId: string;
    ticketIds: string[];
    priority: IncidentPriority;
    status: IncidentStatus;
    category: IncidentCategory;
    description?: string;
    assignedBy?: string;
    resolvedBy?: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

//TODO delete
//for backward compatibility
export type Incident = IncidentOutputDTO;

// export type Incident = {
//     incidentId: string;
//     incidentNumber: string;
//     priority: IncidentPriority;
//     status: IncidentStatus;
//     impact: string;//-
//     urgency: string;//-
//     category: string;
//     description?: string;
//     createdBy: string;
//     createdAt: string;
//     updatedAt: string;
// };

//TODO for backward compatibility, refactor and delete
export type CreateIncidentRequest = {
    ticketIds: string[];
    impact: string;
    urgency: string;
    category: string;
    description: string;
    createdBy: string;
};

//TODO for backward compatibility, refactor and delete
export type UpdateIncidentRequest = {
    incidentId: string;
    status?: IncidentStatus;
    urgency?: string;
    category?: string;
    updatedBy: string;
};

export interface CreateIncidentApiGatewayRequest {
    ticketIds: string[];
    impact: Impact;
    urgency: Urgency;
    category: IncidentCategory;
    description?: string;
    createdBy: string;
}

export interface UpdateIncidentStatusApiGatewayRequest {
    incidentId: string;
    status: IncidentStatus;
    updatedBy: string;
    comment?: string;
}

export interface UpdateIncidentPriorityApiGatewayRequest {
    incidentId: string;
    priority: IncidentPriority;
    updatedBy: string;
    comment?: string;
}