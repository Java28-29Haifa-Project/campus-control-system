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

export interface GetRequestByIdInput {
    action: 'GET_REQUEST';
    requestId: string;
}

export interface CreateRequestInputLambda {
    action: 'CREATE_REQUEST';
    category: string;
    subject: string;
    userReportedPriority: string;
    createdBy: string;
}

export interface UpdateRequestInputLambda {
    action: 'UPDATE_REQUEST';
    requestId: string;
    category?: string;
    subject?: string;
    userReportedPriority?: string;
    status?: string;
    updatedBy: string;
}

export interface IRequestLambdaService {
    getAllRequests(input: GetRequestsInput): Promise<RequestLambdaResponse[]>;
    getRequestById(input: GetRequestByIdInput): Promise<RequestLambdaResponse>;
    createRequest(input: CreateRequestInputLambda): Promise<RequestLambdaResponse>;
    updateRequest(input: UpdateRequestInputLambda): Promise<RequestLambdaResponse>;
    healthCheck(): Promise<{ service: string; status: string; timestamp: string }>;
}
