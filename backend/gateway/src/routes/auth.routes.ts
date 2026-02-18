import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate, AuthValidationSchemas } from '../middleware/validation.middleware.js';

import { requireRole } from '../middleware/role.middleware.js';

export const authRoutes = express.Router();

authRoutes.post('/register', validate(AuthValidationSchemas.register, 'body'), authController.register);
authRoutes.post('/login', authController.login);
authRoutes.post('/refresh', authController.refreshToken);
authRoutes.post('/logout', authMiddleware, authController.logout);
authRoutes.get('/me', authMiddleware, authController.getMe);

authRoutes.get(
    '/users',
    authMiddleware,
    requireRole('ADMIN'),
    authController.getAllUsers.bind(authController)
);

authRoutes.get(
    '/users/:id',
    authMiddleware,
    requireRole('ADMIN'),
    authController.getUser.bind(authController)
);

authRoutes.patch(
    '/users/:id/role',
    authMiddleware,
    requireRole('ADMIN'),
    authController.changeUserRole.bind(authController)
);

authRoutes.delete(
    '/users/:id',
    authMiddleware,
    requireRole('ADMIN'),
    authController.deleteUser.bind(authController)
);

// TODO remove after refactoring
// authRoutes.post('/verify', authController.verifyToken);