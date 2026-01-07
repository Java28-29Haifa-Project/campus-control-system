import { IRequestLambdaService, GetRequestsInput, RequestLambdaResponse } from '../interfaces/IRequestLambdaService.js';

export class RequestLambdaServiceMock implements IRequestLambdaService {
    private mockData: RequestLambdaResponse[] = [
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

    async getAllRequests(input: GetRequestsInput): Promise<RequestLambdaResponse[]> {
        let filtered = [...this.mockData];

        if (input.status) {
            filtered = filtered.filter(r => r.status === input.status);
        }

        return filtered;
    }

    async healthCheck(): Promise<{ service: string; status: string; timestamp: string }> {
        return {
            service: 'request-lambda',
            status: 'ok',
            timestamp: new Date().toISOString()
        };
    }
}

export const requestLambdaServiceMock = new RequestLambdaServiceMock();