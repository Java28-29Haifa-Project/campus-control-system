import { Request, Response, NextFunction } from 'express';
import { incidentLambdaServiceAWS } from '../services/lambda-sdk/services/IncidentLambdaServiceAWS.js';
import {HttpError} from '../errors/http-error.js';
import Logger from '../utils/logger.js';
import { auditClient } from '../services/auditClient.js';
import { createAuditEvent, IncidentActions } from '../types/audit.js';
import { randomUUID } from 'crypto';

class IncidentController {
    async updateIncidentStatus(req: Request, res: Response, next: NextFunction) {
        const correlationId = randomUUID();

        try {
            const incidentId = req.params.id as string;
            const { status } = req.body;

            Logger.info('Updating incident status', {
                incidentId,
                newStatus: status,
                userId: req.user!.userId,
                correlationId
            });

            const currentIncident = await incidentLambdaServiceAWS.getIncidentById({
                incidentId
            });

            const result = await incidentLambdaServiceAWS.updateIncidentStatus({
                incidentId,
                status,
                updatedBy: req.user!.userId
            });

            Logger.info('Incident status updated successfully', {
                incidentId,
                oldStatus: currentIncident.status,
                newStatus: status,
                correlationId
            });

            await auditClient.sendEvent(
                createAuditEvent(
                    'Incident',
                    incidentId,
                    IncidentActions.STATUS_CHANGED,
                    req.user!.userId,
                    req.user!.role as any,
                    {
                        oldStatus: currentIncident.status,
                        newStatus: status,
                        priority: result.priority
                    },
                    correlationId
                )
            );

            res.status(200).json(result);
        } catch (error: any) {
            Logger.error('Failed to update incident status', {
                error: error.message,
                incidentId: req.params.id,
                correlationId
            });
            next(new HttpError(error.statusCode || 500, error.message));
        }
    }

    async raiseIncidentPriority(req: Request, res: Response, next: NextFunction) {
        const correlationId = randomUUID();

        try {
            const incidentId = req.params.id as string;
            const { priority } = req.body;

            Logger.info('Raising incident priority', {
                incidentId,
                newPriority: priority,
                userId: req.user!.userId,
                correlationId
            });

            const currentIncident = await incidentLambdaServiceAWS.getIncidentById({
                incidentId
            });

            const result = await incidentLambdaServiceAWS.updateIncidentPriority({
                incidentId,
                priority,
                updatedBy: req.user!.userId
            });

            Logger.info('Incident priority raised successfully', {
                incidentId,
                oldPriority: currentIncident.priority,
                newPriority: priority,
                correlationId
            });

            await auditClient.sendEvent(
                createAuditEvent(
                    'Incident',
                    incidentId,
                    IncidentActions.PRIORITY_RAISED,
                    req.user!.userId,
                    req.user!.role as any,
                    {
                        oldPriority: currentIncident.priority,
                        newPriority: priority,
                        status: result.status
                    },
                    correlationId
                )
            );

            res.status(200).json(result);
        } catch (error: any) {
            Logger.error('Failed to raise incident priority', {
                error: error.message,
                incidentId: req.params.id,
                correlationId
            });
            next(new HttpError(error.statusCode || 500, error.message));
        }
    }

    async addComment(req: Request, res: Response, next: NextFunction) {
        const correlationId = randomUUID();

        try {
            const incidentId = req.params.id as string;
            const { text } = req.body;

            if (!text || text.trim().length === 0) {
                return next(new HttpError(400, 'Comment text is required'));
            }

            Logger.info('Adding comment to incident', {
                incidentId,
                userId: req.user!.userId,
                correlationId
            });

            const result = await incidentLambdaServiceAWS.addComment({
                incidentId,
                commentText: text,
                createdBy: req.user!.userId
            });

            Logger.info('Comment added successfully', {
                incidentId,
                commentId: result.commentId,
                correlationId
            });

            await auditClient.sendEvent(
                createAuditEvent(
                    'Incident',
                    incidentId,
                    IncidentActions.COMMENT_ADDED,
                    req.user!.userId,
                    req.user!.role as any,
                    {
                        commentId: result.commentId,
                        commentLength: text.length
                    },
                    correlationId
                )
            );

            res.status(201).json(result);
        } catch (error: any) {
            Logger.error('Failed to add comment', {
                error: error.message,
                incidentId: req.params.id,
                correlationId
            });
            next(new HttpError(error.statusCode || 500, error.message));
        }
    }
}

export const incidentController = new IncidentController();