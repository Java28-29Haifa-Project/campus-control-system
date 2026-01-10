import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http-error.js';

export const requireRole = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new HttpError(401, 'Authentication required'));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(new HttpError(403, `Access denied`));
        }

        next();
    };
};