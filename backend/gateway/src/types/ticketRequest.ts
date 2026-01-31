export enum TicketRequestCategory {
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

export enum TicketRequestPriority {
    Low = 'low',
    Medium = 'medium',
    High = 'high',
    Urgent = 'urgent'
}

export enum TicketRequestStatus {
    New = 'new',
    Rejected = 'rejected',
    InService = 'in_service',
    Done = 'done'
}

export type TicketRequest = {
    userId: string;
    requestId: string;
    requestNumber: string;
    category: TicketRequestCategory;
    subject: string;
    userReportedPriority: TicketRequestPriority;
    status: TicketRequestStatus;
    createdAt: string;
    description?: string;
};

export interface CreateRequestInput {
    category: TicketRequestCategory;
    subject: string;
    description?: string;
    userReportedPriority: TicketRequestPriority;
    createdBy: string;
}

export type UpdateRequestInput = {
    requestId: string;
    category?: TicketRequestCategory;
    subject?: string;
    description?: string;
    userReportedPriority?: TicketRequestPriority;
    status?: TicketRequestStatus;
    updatedBy: string;
};

export type UpdateRequestStatusInputLambda = {
    requestId: string;
    status: 'rejected' | 'in_service' | 'done';
    updatedBy: string;
};