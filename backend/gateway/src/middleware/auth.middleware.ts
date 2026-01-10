import { Request, Response, NextFunction } from 'express';
import { JwtUtils } from '../utils/jwt.utils.js';
import { HttpError } from '../errors/http-error.js';
import { AccessTokenPayload } from '../types/jwt.js';

declare global {
    namespace Express {
        interface Request {
            user?: AccessTokenPayload;
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.cookies?.accessToken;

        if (!accessToken) {
            throw new HttpError(401, 'Authentication required - no token provided');
        }

        const payload = JwtUtils.verifyAccessToken(accessToken);

        req.user = payload;

        next();
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            next(new HttpError(401, 'Token expired'));
        } else if (error.name === 'JsonWebTokenError') {
            next(new HttpError(401, 'Invalid token'));
        } else {
            next(error);
        }
    }
};