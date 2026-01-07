export interface GetRequestsInput {
    action: 'GET_REQUESTS';
    status?: string;
}

export interface RequestLambdaResponse {
    requestId: string;
    requestNumber: string;
    userId: string;
    userName: string;
    userEmail: string;
    supportId: string | null;
    supportName: string | null;
    category: string;
    subject: string;
    userReportedPriority: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface IRequestLambdaService {
    getAllRequests(input: GetRequestsInput): Promise<RequestLambdaResponse[]>;
    healthCheck(): Promise<{ service: string; status: string; timestamp: string }>;
}