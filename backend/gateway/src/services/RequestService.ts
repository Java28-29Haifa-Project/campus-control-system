//interface for WRITE operations only, READ operations bypass it

import { TicketRequest, TicketRequestStatus, CreateRequestInput, UpdateRequestInput } from '../types/ticketRequest.js';

export interface RequestService {
    createRequest(input: CreateRequestInput): Promise<TicketRequest>;
    updateRequest(input: UpdateRequestInput): Promise<Partial<TicketRequest>>;
}
