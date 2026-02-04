import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http-error.js';
import { JwtUtils } from '../utils/jwt.utils.js';
import Logger from "../utils/logger.js";

export const requireRole = (...allowedRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            Logger.error('Authorization check failed - no user', {
                path: req.path,
                requiredRoles: allowedRoles
            });
            return next(new HttpError(401, 'Authentication required'));
        }

        if (!allowedRoles.includes(req.user.role)) {

            Logger.warn('Authorization denied', {
                userId: req.user.userId,
                userRole: req.user.role,
                requiredRoles: allowedRoles,
                path: req.path
            });

            const refreshToken = req.cookies?.refreshToken;
            if (refreshToken) {
                try {
                    await JwtUtils.blacklistRefreshToken(refreshToken);
                    console.warn(`[SECURITY] Refresh token blacklisted for user ${req.user.userId}`);
                } catch (error) {
                    console.error(`[SECURITY] Failed to blacklist token:`, error);
                }
            }

            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');

            //TODO : audit violation

            // auditService.logSecurityViolation({ // TODO : audit MS contract methods ?
            //     userId: req.user.userId,
            //     role: req.user.role,
            //     attemptedEndpoint: req.originalUrl,
            //     requiredRoles: allowedRoles,
            //     ip: req.ip,
            //     timestamp: new Date().toISOString()
            // });

            return next(new HttpError(403, 'Access denied. Your session has been terminated due to unauthorized access attempt.'));
        }

        next();
    };
};