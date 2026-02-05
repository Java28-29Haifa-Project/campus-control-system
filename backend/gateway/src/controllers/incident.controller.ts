import { Request, Response, NextFunction } from 'express';
import { incidentLambdaServiceAWS } from '../services/lambda-sdk/services/IncidentLambdaServiceAWS.js';
import {
    IncidentStatus,
    IncidentCategory,
    Impact,
    Urgency
} from '../types/incident.js';
import { HttpError } from '../errors/http-error.js';
import { parseDateFilters } from '../middleware/validation.middleware.js';
import Logger from '../utils/logger.js';

class IncidentController {
    async getIncidents(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new HttpError(401, 'Authentication required');

            const { status, priority, category, assignedBy } = req.query;
            const { dateFrom, dateTo } = parseDateFilters(req.query);

            // Call Lambda service with filters
            const incidents = await incidentLambdaServiceAWS.getIncidents({
                filters: {
                    status: status as string,
                    priority: priority ? Number(priority) : undefined,
                    category: category as string,
                    assignedBy: assignedBy as string,
                    dateFrom,
                    dateTo
                }
            });

            // Filter out system incidents for SUPPORT role
            const filteredIncidents = req.user.role === 'SUPPORT'
                ? incidents.filter(inc => inc.category !== IncidentCategory.System)
                : incidents;

            res.status(200).json(filteredIncidents);
        } catch (error: any) {
            Logger.error('Failed to get incidents', {
                userId: req.user?.userId,
                error: error.message,
                stack: error.stack
            });
            next(new HttpError(error.statusCode || 500, error.message));
        }
    }

    async getIncident(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new HttpError(401, 'Authentication required');

            const incidentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

            // Call Lambda service
            const incident = await incidentLambdaServiceAWS.getIncidentById({
                incidentId
            });

            if (!incident) {
                throw new HttpError(404, 'Incident not found');
            }

            // Check access for SUPPORT role
            if (req.user.role === 'SUPPORT' && incident.category === IncidentCategory.System) {
                Logger.warn('SUPPORT user attempted to access system incident', {
                    userId: req.user.userId,
                    incidentId
                });
                throw new HttpError(403, 'Access denied to system incidents');
            }

            res.status(200).json(incident);
        } catch (error: any) {
            Logger.error('Failed to get incident', {
                userId: req.user?.userId,
                incidentId: req.params.id,
                error: error.message,
                stack: error.stack
            });
            next(error);
        }
    }

    async createIncident(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new HttpError(401, 'Authentication required');

            Logger.info('Incident creation started', {
                userId: req.user.userId,
                ticketCount: req.body.ticketIds?.length,
                category: req.body.category
            });

            const { ticketIds, impact, urgency, category, description } = req.body;

            // Call Lambda service (it will generate incidentId)
            const incident = await incidentLambdaServiceAWS.createIncident({
                ticketIds,
                impact: impact as Impact,
                urgency: urgency as Urgency,
                category: category as IncidentCategory,
                description,
                createdBy: req.user.userId
            });

            Logger.info('Incident created successfully', {
                userId: req.user.userId,
                incidentId: incident.incidentId,
                priority: incident.priority
            });

            res.status(201).json(incident);
        } catch (error: any) {
            Logger.error('Incident creation failed', {
                userId: req.user?.userId,
                error: error.message,
                stack: error.stack
            });
            next(new HttpError(error.statusCode || 500, error.message));
        }
    }

    async updateIncidentStatus(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new HttpError(401, 'Authentication required');
            if (req.user.role !== 'ENGINEER' && req.user.role !== 'ADMIN') {
                Logger.warn('Non-engineer attempted to update incident status', {
                    userId: req.user.userId,
                    role: req.user.role,
                    incidentId: req.params.id
                });
                throw new HttpError(403, 'Only engineers can update incident status');
            }

            const incidentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const { status, comment } = req.body;

            // Call Lambda service
            const incident = await incidentLambdaServiceAWS.updateIncidentStatus({
                incidentId,
                status: status as IncidentStatus,
                updatedBy: req.user.userId,
                comment
            });

            Logger.info('Incident status updated', {
                userId: req.user.userId,
                incidentId,
                newStatus: status
            });

            res.status(200).json(incident);
        } catch (error: any) {
            Logger.error('Failed to update incident status', {
                userId: req.user?.userId,
                incidentId: req.params.id,
                error: error.message,
                stack: error.stack
            });
            next(new HttpError(error.statusCode || 500, error.message));
        }
    }

    async assignIncident(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new HttpError(401, 'Authentication required');
            if (req.user.role !== 'ENGINEER' && req.user.role !== 'ADMIN') {
                Logger.warn('Non-engineer attempted to assign incident', {
                    userId: req.user.userId,
                    role: req.user.role,
                    incidentId: req.params.id
                });
                throw new HttpError(403, 'Only engineers can assign incidents');
            }

            const incidentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

            // Call Lambda service
            const incident = await incidentLambdaServiceAWS.assignIncident({
                incidentId,
                assignedBy: req.user.userId
            });

            Logger.info('Incident assigned to engineer', {
                userId: req.user.userId,
                incidentId
            });

            res.status(200).json(incident);
        } catch (error: any) {
            Logger.error('Failed to assign incident', {
                userId: req.user?.userId,
                incidentId: req.params.id,
                error: error.message,
                stack: error.stack
            });
            next(new HttpError(error.statusCode || 500, error.message));
        }
    }

    async raiseIncidentPriority(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new HttpError(401, 'Authentication required');
            if (req.user.role !== 'ENGINEER' && req.user.role !== 'ADMIN') {
                Logger.warn('Non-engineer attempted to raise priority', {
                    userId: req.user.userId,
                    role: req.user.role,
                    incidentId: req.params.id
                });
                throw new HttpError(403, 'Forbidden');
            }

            const incidentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const { priority, comment } = req.body;

            // Call Lambda service
            const incident = await incidentLambdaServiceAWS.updateIncidentPriority({
                incidentId,
                priority,
                updatedBy: req.user.userId,
                comment
            });

            Logger.info('Incident priority raised', {
                userId: req.user.userId,
                incidentId,
                newPriority: priority
            });

            res.status(200).json(incident);
        } catch (error: any) {
            Logger.error('Failed to raise incident priority', {
                userId: req.user?.userId,
                incidentId: req.params.id,
                error: error.message,
                stack: error.stack
            });
            next(new HttpError(error.statusCode || 500, error.message));
        }
    }
}

export const incidentController = new IncidentController();