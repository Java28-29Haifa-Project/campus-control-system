import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { JwtUtils } from '../utils/jwt.utils.js';
import { HttpError } from '../errors/http-error.js';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

class AuthController {
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                throw new HttpError(400, 'Email and password are required');
            }

            const result = await pool.query(
                'SELECT user_id, username, email, password_hash, role FROM users WHERE email = $1',
                [email]
            );

            if (result.rows.length === 0) {
                throw new HttpError(401, 'Invalid credentials');
            }

            const user = result.rows[0];

            const isValidPassword = await bcrypt.compare(password, user.password_hash);

            if (!isValidPassword) {
                throw new HttpError(401, 'Invalid credentials');
            }

            const { accessToken, refreshToken } = JwtUtils.generateTokenPair({
                userId: user.user_id,
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
                userId: user.user_id,
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

            const result = await pool.query(
                'SELECT user_id, username, email, role FROM users WHERE user_id = $1',
                [payload.userId]
            );

            if (result.rows.length === 0) {
                throw new HttpError(401, 'User not found');
            }

            const user = result.rows[0];

            await JwtUtils.blacklistRefreshToken(refreshToken);

            const tokens = JwtUtils.generateTokenPair({
                userId: user.user_id,
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

    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, email, password } = req.body;
            const user = await authService.registerUser({ name, email, password });
            res.status(201).json(user);
        } catch (error: any) {
            next(error);
        }
    }
}

export const authController = new AuthController();