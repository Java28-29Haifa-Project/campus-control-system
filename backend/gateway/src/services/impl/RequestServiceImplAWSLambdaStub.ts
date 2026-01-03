import {RequestService} from '../RequestService.js';
import {TicketRequestPriority, TicketRequest, TicketRequestCategory, TicketRequestStatus} from '../../types/ticketRequest.js';

class RequestServiceImplAWSLambdaStub implements RequestService {
    private requests: TicketRequest[] = [
        {
            'requestId': 'req0',
            'requestNumber': 'REQ-0',
            'category': TicketRequestCategory.Electrical,
            'subject': 'subject0',
            'userReportedPriority': TicketRequestPriority.Urgent,
            'status': TicketRequestStatus.New,
            'createdAt': '2025-01-01T10:25:00Z'
        },
        {
            'requestId': 'req1',
            'requestNumber': 'REQ-1',
            'category': TicketRequestCategory.Plumbing,
            'subject': 'subject1',
            'userReportedPriority': TicketRequestPriority.Low,
            'status': TicketRequestStatus.Rejected,
            'createdAt': '2025-01-01T10:00:00Z'
        }
    ]

    async getAllRequests(status?: TicketRequestStatus): Promise<TicketRequest[]> {
        if (!status) {
            return Promise.resolve([...this.requests]);
        }
        return Promise.resolve([...this.requests.filter(r => r.status === status)]);
    }
}

export const requestServiceAWSLambdaStub = new RequestServiceImplAWSLambdaStub();
