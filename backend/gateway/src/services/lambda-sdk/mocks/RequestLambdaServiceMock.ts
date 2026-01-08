import { IRequestLambdaService, RequestLambdaResponse, GetRequestsInput, GetRequestByIdInput, CreateRequestInputLambda, UpdateRequestInputLambda } from '../interfaces/IRequestLambdaService.js';

export const requestLambdaServiceMock: IRequestLambdaService = {
    getAllRequests: async (input: GetRequestsInput): Promise<RequestLambdaResponse[]> => {
        return[
            {
                requestId: 'req0',
                requestNumber: 'REQ-0',
                userId: 'user0',
                userName: 'name0',
                userEmail: 'email0@test.org',
                supportId: null,
                supportName: null,
                category: 'electrical',
                subject: 'subject0',
                userReportedPriority: 'urgent',
                status: 'new',
                createdAt: '2025-01-01T10:25:00Z',
                updatedAt: '2025-01-01T10:25:00Z'
            },
            {
                requestId: 'req1',
                requestNumber: 'REQ-1',
                userId: 'user1',
                userName: 'name1',
                userEmail: 'email1@test.org',
                supportId: null,
                supportName: null,
                category: 'plumbing',
                subject: 'subject1',
                userReportedPriority: 'low',
                status: 'rejected',
                createdAt: '2025-01-01T10:00:00Z',
                updatedAt: '2025-01-01T10:00:00Z'
            }
        ];
    },

    getRequestById: async (input: GetRequestByIdInput): Promise<RequestLambdaResponse> => {
        return {
            requestId: input.requestId,
            requestNumber: 'REQ-0',
            userId: 'user0',
            userName: 'name0',
            userEmail: 'email0@test.org',
            supportId: null,
            supportName: null,
            category: 'electrical',
            subject: 'Test request',
            userReportedPriority: 'high',
            status: 'new',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    },

    createRequest: async (input: CreateRequestInputLambda): Promise<RequestLambdaResponse> => {
        return {
            requestId: 'req-new',
            requestNumber: 'REQ-NEW',
            userId: 'user0',
            userName: 'name0',
            userEmail: 'email0@test.org',
            supportId: null,
            supportName: null,
            category: input.category,
            subject: input.subject,
            userReportedPriority: input.userReportedPriority,
            status: 'new',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    },

    updateRequest: async (input: UpdateRequestInputLambda): Promise<RequestLambdaResponse> => {
        return {
            requestId: input.requestId,
            requestNumber: 'REQ-UPDATED',
            userId: 'user0',
            userName: 'name0',
            userEmail: 'email0@test.org',
            supportId: null,
            supportName: null,
            category: input.category || 'default',
            subject: input.subject || 'default',
            userReportedPriority: input.userReportedPriority || 'medium',
            status: input.status || 'in_progress',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    },

    healthCheck: async () => ({
        service: 'request-lambda',
        status: 'ok',
        timestamp: new Date().toISOString(),
    }),
};
