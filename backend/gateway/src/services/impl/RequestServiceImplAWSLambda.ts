import { RequestService } from '../RequestService.js';
import { TicketRequest, TicketRequestStatus } from '../../types/ticketRequest.js';
import { IRequestLambdaService } from '../lambda-sdk/interfaces/IRequestLambdaService.js';
import { requestLambdaServiceMock } from '../lambda-sdk/mocks/RequestLambdaServiceMock.js';

class RequestServiceImplAWSLambda implements RequestService {
    private lambdaService: IRequestLambdaService = requestLambdaServiceMock;

    async getAllRequests(status?: TicketRequestStatus): Promise<TicketRequest[]> {
        const lambdaResponse = await this.lambdaService.getAllRequests({
            action: 'GET_REQUESTS',
            status: status
        });

        return lambdaResponse.map(r => ({
            requestId: r.requestId,
            requestNumber: r.requestNumber,
            category: r.category as any,
            subject: r.subject,
            userReportedPriority: r.userReportedPriority as any,
            status: r.status as any,
            createdAt: r.createdAt
        }));
    }
}

export const requestServiceAWSLambda = new RequestServiceImplAWSLambda();