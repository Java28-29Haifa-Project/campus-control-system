import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { JwtUtils } from '../utils/jwt.utils.js';
import { HttpError } from '../errors/http-error.js';
import { RegisterRequest } from '../types/auth.js';
import { authServiceImpl as authService } from '../services/impl/AuthServiceImpl.js';

import Logger from '../utils/logger.js';
import { auditClient } from '../services/auditClient.js';
import { createAuditEvent } from '../types/audit.js';
import { randomUUID } from 'crypto';

type UserRole = 'USER' | 'SUPPORT' | 'ENGINEER' | 'ADMIN';

const VALID_ROLE_TRANSITIONS: Record<UserRole, UserRole[]> = {
    USER: ['SUPPORT', 'ENGINEER'],
    SUPPORT: ['USER', 'ENGINEER'],
    ENGINEER: ['USER', 'SUPPORT', 'ADMIN'],
    ADMIN: ['ENGINEER']
};

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
            const body: RegisterRequest = req.body;
            const user = await authService.registerUser(body);
            res.status(201).json(user);
        } catch (err) {
            next(err);
        }
    }

    async changeUserRole(req: Request, res: Response, next: NextFunction) {
        const correlationId = randomUUID();

        try {
            const userId = req.params.id as string;
            const { role } = req.body;

            if (!role) {
                return next(new HttpError(400, 'Role is required'));
            }

            if (!['USER', 'SUPPORT', 'ENGINEER', 'ADMIN'].includes(role)) {
                return next(new HttpError(400, 'Invalid role'));
            }

            Logger.info('Changing user role', {
                targetUserId: userId,
                newRole: role,
                adminUserId: req.user!.userId,
                correlationId
            });

            const getUserQuery = `
                SELECT user_id, email, role 
                FROM users 
                WHERE user_id = $1
            `;
            const userResult = await pool.query(getUserQuery, [userId]);

            if (userResult.rows.length === 0) {
                return next(new HttpError(404, 'User not found'));
            }

            const currentUser = userResult.rows[0];
            const oldRole = currentUser.role;

            const allowedTransitions = VALID_ROLE_TRANSITIONS[oldRole as UserRole];
            if (!allowedTransitions.includes(role as UserRole)) {
                Logger.warn('Invalid role transition attempt', {
                    userId,
                    oldRole,
                    newRole: role,
                    adminUserId: req.user!.userId
                });
                return next(new HttpError(400, `Cannot change role from ${oldRole} to ${role}. Allowed: ${allowedTransitions.join(', ')}`));
            }

            if (userId === req.user!.userId) {
                return next(new HttpError(403, 'Cannot change your own role'));
            }

            const updateQuery = `
                UPDATE users 
                SET role = $1, updated_at = CURRENT_TIMESTAMP 
                WHERE user_id = $2
                RETURNING user_id, email, role, created_at, updated_at
            `;
            const updateResult = await pool.query(updateQuery, [role, userId]);

            Logger.info('User role changed successfully', {
                userId,
                oldRole,
                newRole: role,
                adminUserId: req.user!.userId,
                correlationId
            });

            await auditClient.sendEvent(
                createAuditEvent(
                    'System',
                    userId,
                    'user_role_changed',
                    req.user!.userId,
                    'ADMIN',
                    {
                        targetUserId: userId,
                        targetUserEmail: currentUser.email,
                        oldRole,
                        newRole: role,
                        changedBy: req.user!.userId
                    },
                    correlationId
                )
            );

            res.status(200).json({
                userId: updateResult.rows[0].user_id,
                email: updateResult.rows[0].email,
                role: updateResult.rows[0].role,
                updatedAt: updateResult.rows[0].updated_at
            });
        } catch (error: any) {
            Logger.error('Failed to change user role', {
                error: error.message,
                userId: req.params.id,
                correlationId
            });
            next(new HttpError(500, 'Failed to change user role'));
        }
    }

    async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const { role, search } = req.query;

            let query = `
                SELECT 
                    user_id, 
                    email, 
                    role, 
                    created_at, 
                    updated_at
                FROM users
                WHERE 1=1
            `;

            const params: any[] = [];
            let paramIndex = 1;

            if (role) {
                query += ` AND role = $${paramIndex++}`;
                params.push(role);
            }

            if (search) {
                query += ` AND email ILIKE $${paramIndex++}`;
                params.push(`%${search}%`);
            }

            query += ` ORDER BY created_at DESC`;

            const result = await pool.query(query, params);

            res.status(200).json(result.rows);
        } catch (error: any) {
            Logger.error('Failed to get users', { error: error.message });
            next(new HttpError(500, 'Failed to get users'));
        }
    }

    async getUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.id;

            const query = `
                SELECT 
                    user_id, 
                    email, 
                    role, 
                    created_at, 
                    updated_at
                FROM users
                WHERE user_id = $1
            `;

            const result = await pool.query(query, [userId]);

            if (result.rows.length === 0) {
                return next(new HttpError(404, 'User not found'));
            }

            res.status(200).json(result.rows[0]);
        } catch (error: any) {
            Logger.error('Failed to get user', {
                error: error.message,
                userId: req.params.id
            });
            next(new HttpError(500, 'Failed to get user'));
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        const correlationId = randomUUID();

        try {
            const userId = req.params.id as string;

            Logger.info('Deleting user', {
                targetUserId: userId,
                adminUserId: req.user!.userId,
                correlationId
            });

            if (userId === req.user!.userId) {
                return next(new HttpError(403, 'Cannot delete your own account'));
            }

            const getUserQuery = `
                SELECT user_id, email, role 
                FROM users 
                WHERE user_id = $1
            `;
            const userResult = await pool.query(getUserQuery, [userId]);

            if (userResult.rows.length === 0) {
                return next(new HttpError(404, 'User not found'));
            }

            const deletedUser = userResult.rows[0];

            const deleteQuery = `
                DELETE FROM users 
                WHERE user_id = $1
            `;
            await pool.query(deleteQuery, [userId]);

            Logger.info('User deleted successfully', {
                userId,
                email: deletedUser.email,
                adminUserId: req.user!.userId,
                correlationId
            });

            await auditClient.sendEvent(
                createAuditEvent(
                    'System',
                    userId,
                    'user_deleted',
                    req.user!.userId,
                    'ADMIN',
                    {
                        targetUserId: userId,
                        targetUserEmail: deletedUser.email,
                        targetUserRole: deletedUser.role,
                        deletedBy: req.user!.userId
                    },
                    correlationId
                )
            );

            res.status(200).json({
                message: 'User deleted successfully',
                userId: deletedUser.user_id,
                email: deletedUser.email
            });
        } catch (error: any) {
            Logger.error('Failed to delete user', {
                error: error.message,
                userId: req.params.id,
                correlationId
            });
            next(new HttpError(500, 'Failed to delete user'));
        }
    }
}

export const authController = new AuthController();