//TODO check protocol

import { Request, Response, NextFunction } from 'express';
import { authServiceAWSLambda } from '../services/impl/AuthServiceImplAWSLambda.js';

class AuthController {

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authServiceAWSLambda.login(req.body);
            res.status(200).send(result);
        } catch (error) {
            next(error);
        }
    }

    async verifyToken(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authServiceAWSLambda.verifyToken(req.body);
            res.status(200).send(result);
        } catch (error) {
            next(error);
        }
    }
}

export const authController = new AuthController();


