import express from 'express';
import { healthController } from '../controllers/health.controller.js';

export const healthRoutes = express.Router();

healthRoutes.get('/request', healthController.getRequestLambdaHealth);