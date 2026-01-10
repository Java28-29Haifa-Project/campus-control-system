import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export const authRoutes = express.Router();

authRoutes.post('/login', authController.login);
authRoutes.post('/refresh', authController.refreshToken);

authRoutes.post('/logout', authMiddleware, authController.logout);
authRoutes.get('/me', authMiddleware, authController.getMe);

// TODO remove after refactoring
// authRoutes.post('/verify', authController.verifyToken);