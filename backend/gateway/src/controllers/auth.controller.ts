import { Request, Response, NextFunction } from 'express';
import { authServiceAWSLambda } from '../services/impl/AuthServiceImplAWSLambda.js';
import { findUserByEmail, findUserById } from '../data/mock-users.js';
import { JwtUtils } from '../utils/jwt.utils.js';
import { HttpError } from '../errors/http-error.js';

class AuthController {

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                throw new HttpError(400, 'Email and password are required');
            }

            const user = findUserByEmail(email);

            if (!user || user.password !== password) {
                throw new HttpError(401, 'Invalid credentials');
            }

            const { accessToken, refreshToken } = JwtUtils.generateTokenPair({
                userId: user.userId,
                username: user.username,
                email: user.email,
                role: user.role
            });

            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'none',
                maxAge: 15 * 60 * 1000
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'none',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.status(200).json({
                userId: user.userId,
                username: user.username,
                email: user.email,
                role: user.role
            });

        } catch (error) {
            next(error);
        }
    }

    async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies?.refreshToken;

            if (!refreshToken) {
                throw new HttpError(401, 'Refresh token not provided');
            }

            const isBlacklisted = await JwtUtils.isTokenBlacklisted(refreshToken);
            if (isBlacklisted) {
                throw new HttpError(401, 'Token has been revoked');
            }

            const payload = JwtUtils.verifyRefreshToken(refreshToken);

            const user = findUserById(payload.userId);
            if (!user) {
                throw new HttpError(401, 'User not found');
            }

            await JwtUtils.blacklistRefreshToken(refreshToken);

            const tokens = JwtUtils.generateTokenPair({
                userId: user.userId,
                username: user.username,
                email: user.email,
                role: user.role
            });

            res.cookie('accessToken', tokens.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'none',
                maxAge: 15 * 60 * 1000
            });

            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'none',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.status(200).json({
                message: 'Tokens refreshed successfully'
            });

        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                next(new HttpError(401, 'Refresh token expired - please login again'));
            } else if (error.name === 'JsonWebTokenError') {
                next(new HttpError(401, 'Invalid refresh token'));
            } else {
                next(error);
            }
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies?.refreshToken;

            if (refreshToken) {
                await JwtUtils.blacklistRefreshToken(refreshToken);
            }

            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');

            res.status(200).json({
                message: 'Logged out successfully'
            });

        } catch (error) {
            next(error);
        }
    }

    async getMe(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new HttpError(401, 'Not authenticated');
            }

            res.status(200).json({
                userId: req.user.userId,
                username: req.user.username,
                email: req.user.email,
                role: req.user.role
            });

        } catch (error) {
            next(error);
        }
    }

// TODO:  Must be removed after refactoring, do not use for new code
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