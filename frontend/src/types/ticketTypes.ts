
export type TicketStatus = "NEW" | "REJECTED" | "IN_SERVICE" | "DONE";
export type Category = "ELECTRICAL" | "PLUMBING" | "GENERAL";
export type UserPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENCY";

export interface Ticket {
    id: string;
    userId: string;
    subject: string;
    description: string;
    status: TicketStatus;
    category: Category;
    createdAt: string;
    updatedAt: string;
    userReportedPriority: UserPriority;
}

export interface RequestTicket {
    subject: string;
    description: string;
    category: Category;
    userReportedPriority: UserPriority;
}
export interface TicketResponse {
    ticket: Ticket;
}