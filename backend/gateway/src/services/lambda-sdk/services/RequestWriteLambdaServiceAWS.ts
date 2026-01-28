import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { IRequestWriteLambdaService } from '../interfaces/IRequestWriteLambdaService.js';
import { CreateRequestInputLambda, UpdateRequestInputLambda, RequestLambdaResponse } from '../interfaces/IRequestLambdaService.js';
import { requestQueryRepository } from '../../../repositories/impl/RequestQueryRepositoryDB.js';

const lambda = new LambdaClient({ region: process.env.AWS_REGION });

class RequestWriteLambdaServiceAWS implements IRequestWriteLambdaService {
    private functionName = process.env.REQUESTS_LAMBDA_NAME!;

    async createRequest(input: CreateRequestInputLambda): Promise<RequestLambdaResponse> {
        this.validateCreateInput(input);

        const count = await requestQueryRepository.getRequestCountToday();
        const requestNumber = this.generateRequestNumber(count);

        const command = {
            action: 'CREATE_REQUEST',
            data: {
                requestNumber,
                category: input.category,
                subject: input.subject,
                description: input.description,
                userReportedPriority: input.userReportedPriority,
                createdBy: input.createdBy
            }
        };

        return this.invoke(command);
    }

    async updateRequest(input: UpdateRequestInputLambda): Promise<RequestLambdaResponse> {
        const existingRequest = await requestQueryRepository.getRequestById(input.requestId);

        if (!existingRequest) {
            throw new Error('Request not found');
        }

        const command = {
            action: 'UPDATE_REQUEST',
            data: {
                requestId: input.requestId,
                updates: {
                    category: input.category,
                    subject: input.subject,
                    description: input.description,
                    userReportedPriority: input.userReportedPriority,
                    status: input.status,
                    updatedBy: input.updatedBy
                }
            }
        };

        return this.invoke(command);
    }

    async healthCheck(): Promise<{ service: string; status: string; timestamp: string }> {
        try {
            const command = {
                action: 'HEALTH_CHECK',
                data: {}
            };

            await this.invoke(command);

            return {
                service: 'requests-lambda',
                status: 'UP',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                service: 'requests-lambda',
                status: 'DOWN',
                timestamp: new Date().toISOString()
            };
        }
    }


    private validateCreateInput(input: CreateRequestInputLambda) {
        const validCategories = ['plumbing', 'electrical', 'general'];
        const validPriorities = ['low', 'medium', 'high', 'urgent'];

        if (!input.category || !validCategories.includes(input.category)) {
            throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
        }

        if (!input.subject || input.subject.length < 10 || input.subject.length > 500) {
            throw new Error('Subject must be between 10 and 500 characters');
        }

        if (!input.userReportedPriority || !validPriorities.includes(input.userReportedPriority)) {
            throw new Error(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
        }

        if (!input.createdBy) {
            throw new Error('createdBy is required');
        }
    }

    private generateRequestNumber(existingCount: number): string {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const sequence = String(existingCount + 1).padStart(4, '0');
        return `REQ-${year}${month}${day}-${sequence}`;
    }

    private async invoke(payload: any): Promise<any> {
        const command = new InvokeCommand({
            FunctionName: this.functionName,
            Payload: Buffer.from(JSON.stringify(payload))
        });

        const response = await lambda.send(command);

        if (!response.Payload) {
            throw new Error('Lambda returned empty payload');
        }

        const result = JSON.parse(Buffer.from(response.Payload).toString());

        if (result.statusCode && result.statusCode >= 400) {
            const errorBody = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
            throw new Error(errorBody?.error || 'Lambda execution failed');
        }

        return typeof result.body === 'string' ? JSON.parse(result.body) : (result.body || result);
    }
}

export const requestWriteLambdaServiceAWS = new RequestWriteLambdaServiceAWS();