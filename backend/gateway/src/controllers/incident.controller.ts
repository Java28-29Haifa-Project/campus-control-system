import {Request, Response, NextFunction} from 'express';
import {incidentLambdaServiceAWS} from '../services/lambda-sdk/services/IncidentLambdaServiceAWS.js';
import {HttpError} from '../errors/http-error.js';
import Logger from '../utils/logger.js';
import {auditClient} from '../services/auditClient.js';
import {createAuditEvent, IncidentActions} from '../types/audit.js';
import {randomUUID} from 'crypto';

import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const lambda = new LambdaClient({ region: process.env.AWS_REGION || 'us-east-1' });

import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 2
});

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

            Logger.info('Fetching incidents', {userId: req.user!.userId, filters});

            const incidents = await incidentLambdaServiceAWS.getIncidents({filters});

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

            Logger.info('Fetching incident', {incidentId, userId: req.user!.userId});

            const incident = await incidentLambdaServiceAWS.getIncidentById({incidentId});

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
            const {status} = req.body;

            if (!status) {
                return next(new HttpError(400, 'Status is required'));
            }

            // Logger.info('Updating incident status', {
            //     incidentId,
            //     newStatus: status,
            //     userId: req.user!.userId,
            //     correlationId
            // });

            Logger.info('Updating status', {
                incidentId,
                status,
                userRole: req.user!.role,
                correlationId
            });

            const currentIncident = await incidentLambdaServiceAWS.getIncidentById({
                incidentId
            });

            const result = await incidentLambdaServiceAWS.updateStatus({
                incidentId,
                status,
                updatedBy: req.user!.userId,
                userRole: req.user!.role
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
            const {priority} = req.body;

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
            const {text} = req.body;

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

    async deleteIncident(req: Request, res: Response, next: NextFunction) {
        const correlationId = randomUUID();

        try {
            const incidentId = req.params.id as string;

            Logger.info('Deleting incident', {
                incidentId,
                adminUserId: req.user!.userId,
                correlationId
            });

            const incident = await incidentLambdaServiceAWS.getIncidentById({
                incidentId
            });

            const result = await incidentLambdaServiceAWS.deleteIncident({
                incidentId
            });

            Logger.info('Incident deleted successfully', {
                incidentId,
                incidentNumber: incident.incidentNumber,
                adminUserId: req.user!.userId,
                correlationId
            });

            await auditClient.sendEvent(
                createAuditEvent(
                    'Incident',
                    incidentId,
                    'incident_deleted',
                    req.user!.userId,
                    req.user!.role as any,
                    {
                        incidentNumber: incident.incidentNumber,
                        priority: incident.priority,
                        status: incident.status,
                        category: incident.category,
                        ticketIds: incident.ticketIds,
                        deletedBy: req.user!.userId
                    },
                    correlationId
                )
            );

            res.status(200).json(result);
        } catch (error: any) {
            Logger.error('Failed to delete incident', {
                error: error.message,
                incidentId: req.params.id,
                correlationId
            });
            next(new HttpError(error.statusCode || 500, error.message));
        }
    }


    async requestClose(req: Request, res: Response, next: NextFunction) {
        const correlationId = randomUUID();

        try {
            const incidentId = req.params.id as string;

            Logger.info('Requesting close', { incidentId, correlationId });

            const incident = await incidentLambdaServiceAWS.getIncidentById({ incidentId });

            if (incident.status !== 'resolved') {
                return next(new HttpError(400, `Incident must be resolved. Current: ${incident.status}`));
            }

            const ticketId = incident.ticketIds[0];
            const ticketResult = await pool.query(
                'SELECT created_by FROM requests WHERE request_id = $1',
                [ticketId]
            );

            if (ticketResult.rows.length === 0) {
                return next(new HttpError(404, 'Ticket not found'));
            }

            const userId = ticketResult.rows[0].created_by;

            const userResult = await pool.query(
                'SELECT email FROM users WHERE user_id = $1',
                [userId]
            );

            if (userResult.rows.length === 0) {
                return next(new HttpError(404, 'User not found'));
            }

            const userEmail = userResult.rows[0].email;

            lambda.send(new InvokeCommand({
                FunctionName: 'notification-service-lambda',
                InvocationType: 'Event',
                Payload: Buffer.from(JSON.stringify({
                    incidentId,
                    incidentNumber: incident.incidentNumber,
                    userEmail,
                    userName: userId
                }))
            })).catch(err => Logger.error('Notification failed', { error: err.message }));

            const ttl = Math.floor(Date.now() / 1000) + (24 * 60 * 60);

            await dynamodb.send(new PutItemCommand({
                TableName: 'pending-incident-closes',
                Item: {
                    incidentId: { S: incidentId },
                    ticketIds: { L: incident.ticketIds.map((id:string) => ({ S: id })) },
                    requestedBy: { S: req.user!.userId },
                    requestedAt: { S: new Date().toISOString() },
                    ttl: { N: ttl.toString() }
                }
            }));

            Logger.info('Close requested', {
                incidentId,
                autoCloseAt: new Date(ttl * 1000).toISOString(),
                correlationId
            });

            await auditClient.sendEvent(
                createAuditEvent(
                    'Incident',
                    incidentId,
                    'close_requested',
                    req.user!.userId,
                    'ADMIN',
                    {
                        incidentNumber: incident.incidentNumber,
                        autoCloseAt: new Date(ttl * 1000).toISOString(),
                        userEmail
                    },
                    correlationId
                )
            );

            res.status(200).json({
                message: 'Close request submitted',
                incidentId,
                autoCloseAt: new Date(ttl * 1000).toISOString(),
                userNotified: true
            });
        } catch (error: any) {
            Logger.error('Failed to request close', { error: error.message, correlationId });
            next(new HttpError(500, 'Failed to request close'));
        }
    }
}

export const incidentController = new IncidentController();