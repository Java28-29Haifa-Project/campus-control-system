//TODO

import { RequestService } from '../RequestService.js';
import { TicketRequest, TicketRequestStatus, CreateRequestInput, UpdateRequestInput } from '../../types/ticketRequest.js';
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

    async getRequestById(requestId: string): Promise<TicketRequest> {
        const lambdaResponse = await this.lambdaService.getRequestById({
            action: 'GET_REQUEST',
            requestId
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
