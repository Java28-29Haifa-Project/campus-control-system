export const enum TicketStatus {
    New = 'new',
    Rejected = 'rejected',
    InService = 'in_service',
    Done = 'done'
};

export const enum Category {
    Plumbing = 'plumbing',
    Electrical = 'electrical',
    General = 'general'
};

export const enum UserPriority {
    Low = 'low',
    Medium = 'medium',
    High = 'high',
    Urgent = 'urgent'
};

export interface Ticket {
    id: string;
    userId: string;
    subject: string;
    // description?: string;
    status: TicketStatus;
    category: Category;
    createdAt: string;
    updatedAt: string;
    userReportedPriority: UserPriority;
}

export interface TicketRequest {
    subject: string;
    // description?: string;
    category: Category;
    userReportedPriority: UserPriority;
}

export interface TicketResponse {
    ticket: Ticket;
}