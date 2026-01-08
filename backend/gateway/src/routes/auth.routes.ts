//TODO

import express from 'express';
import { authController } from '../controllers/auth.controller.js';

export const authRoutes = express.Router();

authRoutes.post('/login', authController.login);
authRoutes.post('/verify', authController.verifyToken);
