import { Request, Response, NextFunction } from 'express';
import { incidentServiceAWSLambda } from '../services/impl/IncidentServiceImplAWSLambda.js';
import {IncidentStatus} from "../types/incident.js";

class IncidentController {

    async getIncidents(req: Request, res: Response, next: NextFunction) {
        try {
            const statusRaw = Array.isArray(req.query.status) ? req.query.status[0] : req.query.status;

            const status: IncidentStatus | undefined =
                statusRaw && Object.values(IncidentStatus).includes(statusRaw as IncidentStatus)
                    ? (statusRaw as IncidentStatus)
                    : undefined;

            const result = await incidentServiceAWSLambda.getIncidents(status);
            res.status(200).send(result);
        } catch (error) {
            next(error);
        }
    }

    async getIncident(req: Request, res: Response, next: NextFunction) {
        try {
            const incidentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

            const result = await incidentServiceAWSLambda.getIncident(incidentId);
            res.status(200).send(result);
        } catch (error) {
            next(error);
        }
    }

    async createIncident(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await incidentServiceAWSLambda.createIncident(req.body);
            res.status(201).send(result);
        } catch (error) {
            next(error);
        }
    }

    async updateIncident(req: Request, res: Response, next: NextFunction) {
        try {
            const incidentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

            const result = await incidentServiceAWSLambda.updateIncident({
                ...req.body,
                incidentId
            });
            res.status(200).send(result);
        } catch (error) {
            next(error);
        }
    }
}

export const incidentController = new IncidentController();
