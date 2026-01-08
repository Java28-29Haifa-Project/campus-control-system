//TODO check protocol

import { Request, Response, NextFunction } from 'express';
import { monitoringServiceAWSLambda } from '../services/impl/MonitoringServiceImplAWSLambda.js';

class MonitoringController {

    async getLogs(req: Request, res: Response, next: NextFunction) {
        try {
            const { level, startDate } = req.query;
            const result = await monitoringServiceAWSLambda.getLogs(
                level as any,
                startDate as string
            );
            res.status(200).send(result);
        } catch (error) {
            next(error);
        }
    }

    async getAlarms(req: Request, res: Response, next: NextFunction) {
        try {
            const { status, severity } = req.query;
            const result = await monitoringServiceAWSLambda.getAlarms(
                status as any,
                severity as any
            );
            res.status(200).send(result);
        } catch (error) {
            next(error);
        }
    }
}

export const monitoringController = new MonitoringController();
