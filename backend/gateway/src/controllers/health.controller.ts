import { Request, Response } from 'express';
import { requestLambdaServiceMock } from '../services/lambda-sdk/mocks/RequestLambdaServiceMock.js';

class HealthController {
    getRequestLambdaHealth = async (req: Request, res: Response) => {
        const health = await requestLambdaServiceMock.healthCheck();
        res.json(health);
    };
}

export const healthController = new HealthController();