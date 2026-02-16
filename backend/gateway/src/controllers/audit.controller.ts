import {Request, Response, NextFunction} from 'express';
import {InvokeCommand, LambdaClient} from '@aws-sdk/client-lambda';
import {HttpError} from '../errors/http-error.js';
import Logger from '../utils/logger.js';

const lambda = new LambdaClient({region: process.env.AWS_REGION || 'us-east-1'});

class AuditController {
    private readerLambdaArn = process.env.AUDIT_READER_LAMBDA_ARN ||
        'arn:aws:lambda:us-east-1:263548466757:function:audit-service-ReaderFunction-oGaWuhIRmYWU';

    async getLogs(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                entityId,
                userId,
                role,
                dateFrom,
                dateTo,

                page = '1',
                limit = '10'
            } = req.query;

            const filters: any = {};

            // if (entity) filters.entity = entity;
            if (entityId) filters.entityId = entityId;
            // if (action) filters.action = action;
            if (userId) filters.userId = userId;
            if (role) filters.role = role;
            if (dateFrom) filters.dateFrom = dateFrom;
            if (dateTo) filters.dateTo = dateTo;

            const pageNum = parseInt(page as string) || 1;
            const limitNum = Math.min(parseInt(limit as string) || 10, 100);

            Logger.info('Querying audit logs', {
                filters,
                page: pageNum,
                limit: limitNum,
                requestedBy: req.user!.userId
            });

            const payload = {
                action: 'GET_LOGS',  // TODO: Decide action name
                filters,
                pagination: {
                    page: pageNum,
                    limit: limitNum
                }
            };

            const command = new InvokeCommand({
                FunctionName: this.readerLambdaArn,
                Payload: JSON.stringify(payload)
            });

            const response = await lambda.send(command);

            if (!response.Payload) {
                throw new Error('Empty response from audit service');
            }

            const result = JSON.parse(Buffer.from(response.Payload).toString());

            if (result.statusCode && result.statusCode >= 400) {
                const errorBody = typeof result.body === 'string'
                    ? JSON.parse(result.body)
                    : result.body;

                Logger.error('Audit service returned error', {
                    statusCode: result.statusCode,
                    error: errorBody.error
                });

                return next(new HttpError(result.statusCode, errorBody.error || 'Failed to query audit logs'));
            }

            const data = typeof result.body === 'string'
                ? JSON.parse(result.body)
                : (result.body || result);

            Logger.info('Audit logs retrieved', {
                count: data.logs?.length || 0,
                page: pageNum,
                requestedBy: req.user!.userId
            });

            res.status(200).json(data);
        } catch (error: any) {
            Logger.error('Failed to query audit logs', {
                error: error.message,
                stack: error.stack
            });
            next(new HttpError(500, 'Failed to query audit logs'));
        }
    }

    async getLogsByCorrelation(req: Request, res: Response, next: NextFunction) {
        try {
            const correlationId = req.params.correlationId;

            Logger.info('Querying audit logs by correlation', {
                correlationId,
                requestedBy: req.user!.userId
            });

            const payload = {
                action: 'GET_BY_CORRELATION',  // TODO: Decide name
                correlationId
            };

            const command = new InvokeCommand({
                FunctionName: this.readerLambdaArn,
                Payload: JSON.stringify(payload)
            });

            const response = await lambda.send(command);

            if (!response.Payload) {
                throw new Error('Empty response from audit service');
            }

            const result = JSON.parse(Buffer.from(response.Payload).toString());

            if (result.statusCode && result.statusCode >= 400) {
                const errorBody = typeof result.body === 'string'
                    ? JSON.parse(result.body)
                    : result.body;

                return next(new HttpError(result.statusCode, errorBody.error || 'Failed to query audit logs'));
            }

            const data = typeof result.body === 'string'
                ? JSON.parse(result.body)
                : (result.body || result);

            res.status(200).json(data);
        } catch (error: any) {
            Logger.error('Failed to query audit logs by correlation', {
                error: error.message,
                correlationId: req.params.correlationId
            });
            next(new HttpError(500, 'Failed to query audit logs'));
        }
    }
}

export const auditController = new AuditController();