import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate, AuthValidationSchemas } from '../middleware/validation.middleware.js';


export const authRoutes = express.Router();

authRoutes.post('/register', validate(AuthValidationSchemas.register, 'body'), authController.register);

authRoutes.post('/login', authController.login);
authRoutes.post('/refresh', authController.refreshToken);

authRoutes.post('/logout', authMiddleware, authController.logout);
authRoutes.get('/me', authMiddleware, authController.getMe);

// TODO remove after refactoring
// authRoutes.post('/verify', authController.verifyToken);