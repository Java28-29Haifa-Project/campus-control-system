import { Request, Response, NextFunction } from 'express';
import { auditServiceAWSLambda } from '../services/impl/AuditServiceImplAWSLambda.js';

class AuditController {

    async sendAuditEvent(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await auditServiceAWSLambda.sendAuditEvent(req.body);
            res.status(201).send(result);
        } catch (error) {
            next(error);
        }
    }
}

export const auditController = new AuditController();