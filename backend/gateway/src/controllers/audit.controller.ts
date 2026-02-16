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
                startDate,
                endDate,
                page = '1'
            } = req.query;

            const payload: any = {};

            if (entityId) payload.entityId = entityId;
            if (userId) payload.userId = userId;
            if (role) payload.role = role;
            if (startDate) payload.startDate = startDate;
            if (endDate) payload.endDate = endDate;

            const pageNum = parseInt(page as string) || 1;
            if (pageNum > 1) payload.page = pageNum;

            Logger.info('Querying audit logs', {
                payload,
                requestedBy: req.user!.userId
            });

            const command = new InvokeCommand({
                FunctionName: this.readerLambdaArn,
                Payload: JSON.stringify(payload)
            });

            const response = await lambda.send(command);

            if (!response.Payload) {
                throw new Error('Empty response from audit service');
            }

            const result = JSON.parse(Buffer.from(response.Payload).toString());

            if (result.errorMessage || result.errorType) {
                Logger.error('Audit service returned error', {
                    error: result.errorMessage || result.errorType
                });
                return next(new HttpError(500, 'Failed to query audit logs'));
            }

            const responseData = {
                logs: result.currentPageItems || [],
                pagination: result.pagination || {
                    totalCount: 0,
                    totalPages: 0,
                    limit: 10,
                    page: pageNum
                }
            };

            Logger.info('Audit logs retrieved', {
                count: responseData.logs.length,
                totalCount: responseData.pagination.totalCount,
                page: pageNum,
                requestedBy: req.user!.userId
            });


            res.status(200).json(responseData);
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

            if (result.errorMessage || result.errorType) {
                Logger.error('Audit service returned error', {
                    error: result.errorMessage || result.errorType,
                    correlationId
                });
                return next(new HttpError(500, 'Failed to query audit logs'));
            }

            const responseData = {
                logs: result.currentPageItems || [],
                pagination: result.pagination || {
                    totalCount: 0,
                    totalPages: 0,
                    limit: 10,
                    page: 1
                }
            };

            Logger.info('Audit logs by correlation retrieved', {
                count: responseData.logs.length,
                correlationId,
                requestedBy: req.user!.userId
            });

            res.status(200).json(responseData);
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