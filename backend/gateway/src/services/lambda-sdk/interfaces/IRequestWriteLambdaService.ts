import {
    CreateRequestInputLambda,
    UpdateRequestInputLambda,
    RequestLambdaResponse
} from './IRequestLambdaService.js';
import {UpdateRequestStatusInputLambda} from "../../../types/ticketRequest.js";

export interface IRequestWriteLambdaService {
    createRequest(input: CreateRequestInputLambda): Promise<RequestLambdaResponse>;
    updateRequest(input: UpdateRequestInputLambda): Promise<RequestLambdaResponse>;
    updateRequestStatus(
        input: UpdateRequestStatusInputLambda
    ): Promise<RequestLambdaResponse>;
    healthCheck(): Promise<{ service: string; status: string; timestamp: string }>;
}
