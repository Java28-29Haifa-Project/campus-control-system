import { Request, Response, NextFunction } from 'express';
import { JwtUtils } from '../utils/jwt.utils.js';
import { HttpError } from '../errors/http-error.js';
import { AccessTokenPayload } from '../types/jwt.js';
import Logger from '../utils/logger.js';

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
            Logger.warn('Authentication failed - no token', {
                ip: req.ip,
                path: req.path
            });
            throw new HttpError(401, 'Authentication required - no token provided');
        }

        const payload = JwtUtils.verifyAccessToken(accessToken);
        req.user = payload;

        next();
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            Logger.warn('Authentication failed - token expired', {
                ip: req.ip,
                path: req.path
            });
            next(new HttpError(401, 'Token expired'));
        } else if (error.name === 'JsonWebTokenError') {
            Logger.warn('Authentication failed - invalid token', {
                ip: req.ip,
                path: req.path
            });
            next(new HttpError(401, 'Invalid token'));
        } else {
            next(error);
        }
    }
};

export const refreshTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            Logger.warn('Refresh token missing', {
                ip: req.ip,
                path: req.path
            });
            throw new HttpError(401, 'Refresh token required');
        }

        const isBlacklisted = await JwtUtils.isTokenBlacklisted(refreshToken);
        if (isBlacklisted) {
            Logger.warn('Blacklisted token used', {
                ip: req.ip,
                path: req.path
            });
            throw new HttpError(401, 'Token has been revoked');
        }

        const payload = JwtUtils.verifyRefreshToken(refreshToken);
        req.user = {
            userId: payload.userId,
            username: '',
            email: '',
            role: 'USER',
            type: 'access'
        };

        next();
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            Logger.warn('Refresh token expired', {
                ip: req.ip,
                path: req.path
            });
            next(new HttpError(401, 'Refresh token expired'));
        } else if (error.name === 'JsonWebTokenError') {
            Logger.warn('Invalid refresh token', {
                ip: req.ip,
                path: req.path
            });
            next(new HttpError(401, 'Invalid refresh token'));
        } else {
            next(error);
        }
    }
};