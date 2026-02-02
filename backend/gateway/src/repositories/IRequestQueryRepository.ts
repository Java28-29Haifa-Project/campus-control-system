import { TicketRequest, TicketRequestStatus } from '../types/ticketRequest.js';

export interface IRequestQueryRepository {
    getAllRequests(
        status?: TicketRequestStatus,
        user?: { userId: string; role: string },
        filters?: {
            category?: string;
            priority?: string;
            dateFrom?: Date;
            dateTo?: Date;
        }
    ): Promise<TicketRequest[]>;

    getRequestById(requestId: string): Promise<TicketRequest | null>;

    getRequestsByUser(
        userId: string,
        status?: TicketRequestStatus
    ): Promise<TicketRequest[]>;

    getUserRequestStats(userId: string): Promise<{
        total: number;
        new: number;
        in_service: number;
        done: number;
        rejected: number;
    }>;

    getRequestCountToday(): Promise<number>;
}