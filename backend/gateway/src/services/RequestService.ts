import {TicketRequest} from '../types/ticketRequest.js'
import {TicketRequestStatus} from '../types/ticketRequest.js'
export interface RequestService {
    getAllRequests: (status?: TicketRequestStatus) => Promise<TicketRequest[]>;
}