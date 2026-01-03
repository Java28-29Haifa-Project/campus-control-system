import {TicketRequest} from '../types/ticketRequest.js'
export interface RequestService {
    getAllRequests: () => Promise<TicketRequest[]>;
}