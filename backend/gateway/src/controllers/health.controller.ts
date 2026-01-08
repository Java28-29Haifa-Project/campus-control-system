//TODO

import { Request, Response, NextFunction } from 'express';
import { authLambdaServiceMock } from '../services/lambda-sdk/mocks/AuthLambdaServiceMock.js';
import { incidentLambdaServiceMock } from '../services/lambda-sdk/mocks/IncidentLambdaServiceMock.js';
import { monitoringLambdaServiceMock } from '../services/lambda-sdk/mocks/MonitoringLambdaServiceMock.js';
import { auditLambdaServiceMock } from '../services/lambda-sdk/mocks/AuditLambdaServiceMock.js';
import { incidentLambdaServiceMock as requestLambdaServiceMock } from '../services/lambda-sdk/mocks/IncidentLambdaServiceMock.js';

class HealthController {

    async getGatewayHealth(req: Request, res: Response, next: NextFunction) {
        try {
            res.status(200).send({
                service: 'gateway',
                status: 'ok',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            next(error);
        }
    }

    async getRequestLambdaHealth(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await requestLambdaServiceMock.healthCheck();
            res.status(200).send(result);
        } catch (error) {
            next(error);
        }
    }

    async getAuthLambdaHealth(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authLambdaServiceMock.healthCheck();
            res.status(200).send(result);
        } catch (error) {
            next(error);
        }
    }

    async getIncidentLambdaHealth(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await incidentLambdaServiceMock.healthCheck();
            res.status(200).send(result);
        } catch (error) {
            next(error);
        }
    }

    async getMonitoringLambdaHealth(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await monitoringLambdaServiceMock.healthCheck();
            res.status(200).send(result);
        } catch (error) {
            next(error);
        }
    }

    async getAuditLambdaHealth(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await auditLambdaServiceMock.healthCheck();
            res.status(200).send(result);
        } catch (error) {
            next(error);
        }
    }
}

export const healthController = new HealthController();
