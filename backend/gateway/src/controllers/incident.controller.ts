import { Request, Response, NextFunction } from 'express';
import { incidentServiceAWSLambda } from '../services/impl/IncidentServiceImplAWSLambda.js';

class IncidentController {

    async getIncidents(req: Request, res: Response, next: NextFunction) {
        try {
            const { status } = req.query;
            const result = await incidentServiceAWSLambda.getIncidents(status as any);
            res.status(200).send(result);
        } catch (error) {
            next(error);
        }
    }

    async getIncident(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await incidentServiceAWSLambda.getIncident(req.params.id);
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
            const result = await incidentServiceAWSLambda.updateIncident({
                ...req.body,
                incidentId: req.params.id
            });
            res.status(200).send(result);
        } catch (error) {
            next(error);
        }
    }
}

export const incidentController = new IncidentController();


