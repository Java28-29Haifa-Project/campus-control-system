//TODO

import { TicketRequest, TicketRequestStatus, CreateRequestInput, UpdateRequestInput } from '../types/ticketRequest.js';

export interface RequestService {
    getAllRequests: (status?: TicketRequestStatus) => Promise<TicketRequest[]>;
    getRequestById: (requestId: string) => Promise<TicketRequest>;
    createRequest: (input: CreateRequestInput) => Promise<TicketRequest>;
    updateRequest: (input: UpdateRequestInput) => Promise<Partial<TicketRequest>>;
}
