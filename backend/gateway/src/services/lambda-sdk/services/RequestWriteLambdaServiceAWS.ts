import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { IRequestWriteLambdaService } from '../interfaces/IRequestWriteLambdaService.js';

const lambda = new LambdaClient({ region: process.env.AWS_REGION });

class RequestWriteLambdaServiceAWS implements IRequestWriteLambdaService {
    private functionName = process.env.REQUESTS_LAMBDA_NAME!;

    async createRequest(input: any) {
        return this.invoke(input);
    }

    async updateRequest(input: any) {
        return this.invoke(input);
    }

    async healthCheck() {
        return {
            service: 'requests-lambda',
            status: 'UP',
            timestamp: new Date().toISOString()
        };
    }

    private async invoke(payload: any) {
        const command = new InvokeCommand({
            FunctionName: this.functionName,
            Payload: Buffer.from(JSON.stringify(payload))
        });

        const response = await lambda.send(command);

        if (!response.Payload) {
            throw new Error('Lambda returned empty payload');
        }

        return JSON.parse(Buffer.from(response.Payload).toString());
    }
}

export const requestWriteLambdaServiceAWS =
    new RequestWriteLambdaServiceAWS();
