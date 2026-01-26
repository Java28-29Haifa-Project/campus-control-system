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

export const refreshTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            throw new HttpError(401, 'Refresh token required');
        }

        const isBlacklisted = await JwtUtils.isTokenBlacklisted(refreshToken);

        if (isBlacklisted) {
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
            next(new HttpError(401, 'Refresh token expired'));
        } else if (error.name === 'JsonWebTokenError') {
            next(new HttpError(401, 'Invalid refresh token'));
        } else {
            next(error);
        }
    }
};