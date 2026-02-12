import { Request, Response, NextFunction } from 'express';
import { incidentLambdaServiceAWS } from '../services/lambda-sdk/services/IncidentLambdaServiceAWS.js';
import {HttpError} from '../errors/http-error.js';
import Logger from '../utils/logger.js';
import { auditClient } from '../services/auditClient.js';
import { createAuditEvent, IncidentActions } from '../types/audit.js';
import { randomUUID } from 'crypto';

class IncidentController {
    async getIncidents(req: Request, res: Response, next: NextFunction) {
        try {
            const filters = {
                status: req.query.status as string,
                priority: req.query.priority ? parseInt(req.query.priority as string) : undefined,
                category: req.query.category as string,
                assignedBy: req.query.assignedBy as string,
                dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
                dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined
            };

            Logger.info('Fetching incidents', { userId: req.user!.userId, filters });

            const incidents = await incidentLambdaServiceAWS.getIncidents({ filters });

            const filteredIncidents = req.user!.role === 'SUPPORT'
                ? incidents.filter(incident => incident.category !== 'system')
                : incidents;

            res.status(200).json(filteredIncidents);
        } catch (error: any) {
            Logger.error('Failed to fetch incidents', {
                error: error.message,
                userId: req.user!.userId
            });
            next(new HttpError(error.statusCode || 500, error.message));
        }
    }

    async getIncident(req: Request, res: Response, next: NextFunction) {
        try {
            const incidentId = req.params.id as string;

            Logger.info('Fetching incident', { incidentId, userId: req.user!.userId });

            const incident = await incidentLambdaServiceAWS.getIncidentById({ incidentId });

            if (incident.category === 'system' && req.user!.role === 'SUPPORT') {
                Logger.warn('SUPPORT user attempted to access system incident', {
                    incidentId,
                    userId: req.user!.userId
                });
                return next(new HttpError(403, 'Access denied to system category incidents'));
            }

            res.status(200).json(incident);
        } catch (error: any) {
            Logger.error('Failed to fetch incident', {
                error: error.message,
                incidentId: req.params.id
            });
            next(new HttpError(error.statusCode || 500, error.message));
        }
    }

    async createIncident(req: Request, res: Response, next: NextFunction) {
        const correlationId = randomUUID();

        try {
            Logger.info('Creating incident', {
                userId: req.user!.userId,
                correlationId
            });

            const result = await incidentLambdaServiceAWS.createIncident({
                ticketIds: req.body.ticketIds,
                impact: req.body.impact,
                urgency: req.body.urgency,
                category: req.body.category,
                description: req.body.description,
                createdBy: req.user!.userId
            });

            Logger.info('Incident created successfully', {
                incidentId: result.incidentId,
                priority: result.priority,
                correlationId
            });

            await auditClient.sendEvent(
                createAuditEvent(
                    'Incident',
                    result.incidentId,
                    IncidentActions.CREATED,
                    req.user!.userId,
                    req.user!.role as any,
                    {
                        priority: result.priority,
                        status: result.status,
                        category: result.category,
                        impact: req.body.impact,
                        urgency: req.body.urgency,
                        ticketIds: req.body.ticketIds,
                        ticketCount: req.body.ticketIds.length
                    },
                    correlationId
                )
            );

            res.status(201).json(result);
        } catch (error: any) {
            Logger.error('Failed to create incident', {
                error: error.message,
                userId: req.user!.userId,
                correlationId
            });
            next(new HttpError(error.statusCode || 500, error.message));
        }
    }

    async assignIncident(req: Request, res: Response, next: NextFunction) {
        const correlationId = randomUUID();

        try {
            const incidentId = req.params.id as string;

            Logger.info('Assigning incident', {
                incidentId,
                userId: req.user!.userId,
                correlationId
            });

            const result = await incidentLambdaServiceAWS.assignIncident({
                incidentId,
                assignedBy: req.user!.userId
            });

            Logger.info('Incident assigned successfully', {
                incidentId,
                assignedBy: req.user!.userId,
                newStatus: result.status,
                correlationId
            });

            await auditClient.sendEvent(
                createAuditEvent(
                    'Incident',
                    incidentId,
                    IncidentActions.ASSIGNED,
                    req.user!.userId,
                    req.user!.role as any,
                    {
                        assignedBy: req.user!.userId,
                        oldStatus: 'new',
                        newStatus: result.status,
                        priority: result.priority
                    },
                    correlationId
                )
            );

            res.status(200).json(result);
        } catch (error: any) {
            Logger.error('Failed to assign incident', {
                error: error.message,
                incidentId: req.params.id,
                userId: req.user!.userId,
                correlationId
            });
            next(new HttpError(error.statusCode || 500, error.message));
        }
    }

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

            const result = await incidentLambdaServiceAWS.updateStatus({
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

            const result = await incidentLambdaServiceAWS.updatePriority({
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