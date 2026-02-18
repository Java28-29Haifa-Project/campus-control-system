import { Request, Response, NextFunction } from 'express';
import { authLambdaServiceMock } from '../services/lambda-sdk/mocks/AuthLambdaServiceMock.js';
import { monitoringLambdaServiceMock } from '../services/lambda-sdk/mocks/MonitoringLambdaServiceMock.js';
import { auditLambdaServiceMock } from '../services/lambda-sdk/mocks/AuditLambdaServiceMock.js';

import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { InvocationType } from '@aws-sdk/client-lambda';
import {incidentLambdaServiceAWS} from "../services/lambda-sdk/services/IncidentLambdaServiceAWS.js";


class HealthController {

    private readonly lambdaClient: LambdaClient;

    constructor() {
        this.lambdaClient = new LambdaClient({ region: 'us-east-1' });
    }

    callLambda = async (
        req: Request,
        res: Response,
        next: NextFunction,
        invocationType: InvocationType = 'RequestResponse'
    ) => {
        try {
            const command = new InvokeCommand({
                FunctionName: 'test-lambda-function0',
                InvocationType: invocationType,
                Payload: JSON.stringify({ invokedBy: 'express-gateway' })
            });

            const response = await this.lambdaClient.send(command);

            if (invocationType === 'RequestResponse') {
                const payload = response.Payload
                    ? JSON.parse(new TextDecoder().decode(response.Payload))
                    : null;
                res.json({
                    success: true,
                    lambdaResponse: payload,
                    statusCode: response.StatusCode
                });
            } else {
                res.json({
                    success: true,
                    message: 'Lambda invoked asynchronously',
                    statusCode: response.StatusCode
                });
            }
        } catch (error) {
            next(error);
        }
    };

    getLambdaSync = (req: Request, res: Response, next: NextFunction) =>
        this.callLambda(req, res, next, 'RequestResponse');

    getLambdaAsync = (req: Request, res: Response, next: NextFunction) =>
        this.callLambda(req, res, next, 'Event');


    getAuthLambdaHealth = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await authLambdaServiceMock.healthCheck();
            res.status(200).send(result);
        } catch (error) {
            next(error);
        }
    }

     getIncidentLambdaHealth = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await incidentLambdaServiceAWS.healthCheck();
            res.status(200).send(result);
        } catch (error) {
            next(error);
        }
    }

    getMonitoringLambdaHealth = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await monitoringLambdaServiceMock.healthCheck();
            res.status(200).send(result);
        } catch (error) {
            next(error);
        }
    }

    getAuditLambdaHealth = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await auditLambdaServiceMock.healthCheck();
            res.status(200).send(result);
        } catch (error) {
            next(error);
        }
    }
}

export const healthController = new HealthController();