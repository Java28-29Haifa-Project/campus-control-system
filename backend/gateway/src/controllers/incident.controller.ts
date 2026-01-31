import { Request, Response, NextFunction } from 'express';
import { incidentApiGatewayMock } from '../services/api-gateway/mocks/IncidentApiGatewayMock.js';
import {
    IncidentStatus,
    IncidentCreateInputDTO,
    IncidentCategory,
    Impact,
    Urgency
} from '../types/incident.js';
import { HttpError } from '../errors/http-error.js';
import { randomUUID } from 'crypto';

class IncidentController {

    async getIncidents(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new HttpError(401, 'Authentication required');

            const { status, priority, category,
                // assignedTo, dateFrom, dateTo
            } = req.query;

            // TODO: Replace mock with actual repo call
            let incidents = incidentApiGatewayMock.getAllIncidents();

            if (req.user.role === 'SUPPORT') {
                incidents = incidents.filter(inc => inc.category !== IncidentCategory.System);
            }

            if (status) {
                incidents = incidents.filter(inc => inc.status === status);
            }
            if (priority) {
                incidents = incidents.filter(inc => inc.priority === Number(priority));
            }
            if (category) {
                incidents = incidents.filter(inc => inc.category === category);
            }
            // if (assignedTo) {
            //     incidents = incidents.filter(inc => inc.assignedBy === assignedTo);
            // }
            // TODO: dateFrom/dateTo filtering ?

            res.status(200).json(incidents);
        } catch (error) {
            next(error);
        }
    }


    async getIncident(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new HttpError(401, 'Authentication required');

            const incidentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

            // TODO: Replace mock with actual repo call
            const incident = incidentApiGatewayMock.getIncident(incidentId);

            if (!incident) {
                throw new HttpError(404, 'Incident not found');
            }

            if (req.user.role === 'SUPPORT' && incident.category === IncidentCategory.System) {
                throw new HttpError(403, 'Access denied to system incidents');
            }

            res.status(200).json(incident);
        } catch (error) {
            next(error);
        }
    }

    async createIncident(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new HttpError(401, 'Authentication required');

            const { ticketIds, impact, urgency, category, description } = req.body;

            const incidentId = randomUUID();

            const incident = await incidentApiGatewayMock.createIncident(incidentId, {
                ticketIds,
                impact: impact as Impact,
                urgency: urgency as Urgency,
                category: category as IncidentCategory,
                description,
                createdBy: req.user.userId
            });

            res.status(201).json(incident);
        } catch (error: any) {
            next(new HttpError(error.statusCode || 500, error.message));
        }
    }

    async updateIncidentStatus(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new HttpError(401, 'Authentication required');

            if (req.user.role !== 'ENGINEER' && req.user.role !== 'ADMIN') {
                throw new HttpError(403, 'Only engineers can update incident status');
            }

            const incidentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const { status, comment } = req.body;

            const incident = await incidentApiGatewayMock.updateIncidentStatus({
                incidentId,
                status: status as IncidentStatus,
                updatedBy: req.user.userId,
                comment
            });

            res.status(200).json(incident);
        } catch (error: any) {
            next(new HttpError(error.statusCode || 500, error.message));
        }
    }

    async assignIncident(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new HttpError(401, 'Authentication required');

            if (req.user.role !== 'ENGINEER' && req.user.role !== 'ADMIN') {
                throw new HttpError(403, 'Only engineers can assign incidents');
            }

            const incidentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

            const incident = await incidentApiGatewayMock.updateIncidentStatus({
                incidentId,
                status: IncidentStatus.Assigned,
                updatedBy: req.user.userId
            });

            res.status(200).json(incident);
        } catch (error: any) {
            next(new HttpError(error.statusCode || 500, error.message));
        }
    }

    async raiseIncidentPriority(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new HttpError(401, 'Authentication required');

            if (req.user.role !== 'ENGINEER' && req.user.role !== 'ADMIN') {
                throw new HttpError(403, 'Forbidden');
            }

            const incidentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const { priority, comment } = req.body;

            const incident = await incidentApiGatewayMock.raiseIncidentPriority({
                incidentId,
                priority,
                updatedBy: req.user.userId,
                comment
            });

            res.status(200).json(incident);
        } catch (error: any) {
            next(new HttpError(error.statusCode || 500, error.message));
        }
    }
}

export const incidentController = new IncidentController();