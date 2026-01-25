import {
    CreateRequestInputLambda,
    UpdateRequestInputLambda,
    RequestLambdaResponse
} from './IRequestLambdaService.js';

export interface IRequestWriteLambdaService {
    createRequest(input: CreateRequestInputLambda): Promise<RequestLambdaResponse>;
    updateRequest(input: UpdateRequestInputLambda): Promise<RequestLambdaResponse>;
    healthCheck(): Promise<{ service: string; status: string; timestamp: string }>;
}
