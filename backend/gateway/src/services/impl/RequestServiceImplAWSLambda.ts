import { RequestService } from '../RequestService.js';
import {
    TicketRequest,
    CreateRequestInput,
    UpdateRequestInput
} from '../../types/ticketRequest.js';
import { requestWriteLambdaServiceAWS } from '../lambda-sdk/services/RequestWriteLambdaServiceAWS.js';
import {IRequestWriteLambdaService} from "../lambda-sdk/interfaces/IRequestWriteLambdaService.js";

class RequestServiceImplAWSLambda implements RequestService {
    private lambdaService: IRequestWriteLambdaService =
        requestWriteLambdaServiceAWS;

    async createRequest(input: CreateRequestInput): Promise<TicketRequest> {
        const lambdaResponse = await this.lambdaService.createRequest({
            action: 'CREATE_REQUEST',
            category: input.category,
            subject: input.subject,
            userReportedPriority: input.userReportedPriority,
            createdBy: input.createdBy
        });

        return {
            requestId: lambdaResponse.requestId,
            requestNumber: lambdaResponse.requestNumber,
            category: lambdaResponse.category as any,
            subject: lambdaResponse.subject,
            userReportedPriority: lambdaResponse.userReportedPriority as any,
            status: lambdaResponse.status as any,
            createdAt: lambdaResponse.createdAt
        };
    }

    async updateRequest(input: UpdateRequestInput): Promise<Partial<TicketRequest>> {
        const lambdaResponse = await this.lambdaService.updateRequest({
            action: 'UPDATE_REQUEST',
            requestId: input.requestId,
            category: input.category,
            subject: input.subject,
            userReportedPriority: input.userReportedPriority,
            status: input.status,
            updatedBy: input.updatedBy
        });

        return {
            requestId: lambdaResponse.requestId,
            requestNumber: lambdaResponse.requestNumber,
            category: lambdaResponse.category as any,
            subject: lambdaResponse.subject,
            userReportedPriority: lambdaResponse.userReportedPriority as any,
            status: lambdaResponse.status as any,
            createdAt: lambdaResponse.createdAt
        };
    }
}

export const requestServiceAWSLambda = new RequestServiceImplAWSLambda();
