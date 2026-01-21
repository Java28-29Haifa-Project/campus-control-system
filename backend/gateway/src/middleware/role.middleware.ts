import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http-error.js';
import { JwtUtils } from '../utils/jwt.utils.js';

export const requireRole = (...allowedRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new HttpError(401, 'Authentication required'));
        }

        if (!allowedRoles.includes(req.user.role)) {

            console.warn(`[SECURITY] 403 Attempt - User ${req.user.userId} (${req.user.role}) tried to access endpoint requiring roles: ${allowedRoles.join(', ')}`);
            console.warn(`[SECURITY] Request: ${req.method} ${req.originalUrl}`);
            console.warn(`[SECURITY] IP: ${req.ip}, User-Agent: ${req.get('user-agent')}`);

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