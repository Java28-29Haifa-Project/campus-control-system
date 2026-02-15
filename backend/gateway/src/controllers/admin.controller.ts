import {Request, Response, NextFunction} from 'express';
import {HttpError} from '../errors/http-error.js';
import Logger from '../utils/logger.js';
import {auditClient} from '../services/auditClient.js';
import {createAuditEvent} from '../types/audit.js';
import {randomUUID} from 'crypto';

import {Pool} from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

type UserRole = 'USER' | 'SUPPORT' | 'ENGINEER' | 'ADMIN';

const VALID_ROLE_TRANSITIONS: Record<UserRole, UserRole[]> = {
    USER: ['SUPPORT', 'ENGINEER'],
    SUPPORT: ['USER', 'ENGINEER'],
    ENGINEER: ['USER', 'SUPPORT', 'ADMIN'],
    ADMIN: ['ENGINEER']
};

class AdminController {
    async changeUserRole(req: Request, res: Response, next: NextFunction) {
        const correlationId = randomUUID();

        try {
            const userId = req.params.id as string;
            const {role} = req.body;

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
                SET role       = $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $2 RETURNING user_id, email, role, created_at, updated_at
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
            const {role, search} = req.query;

            let query = `
                SELECT user_id,
                       email,
                       role,
                       created_at,
                       updated_at
                FROM users
                WHERE 1 = 1
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
            Logger.error('Failed to get users', {error: error.message});
            next(new HttpError(500, 'Failed to get users'));
        }
    }

    async getUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.id;

            const query = `
                SELECT user_id,
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
}

export const adminController = new AdminController();