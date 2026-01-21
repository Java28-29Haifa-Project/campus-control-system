import express from 'express';
import { healthController } from '../controllers/health.controller.js';

export const healthRoutes = express.Router();

healthRoutes.get('/sync', healthController.getLambdaSync);
healthRoutes.get('/async', healthController.getLambdaAsync);

healthRoutes.get('/request', healthController.getRequestLambdaHealth);
healthRoutes.get('/auth', healthController.getAuthLambdaHealth);
healthRoutes.get('/incident', healthController.getIncidentLambdaHealth);
healthRoutes.get('/monitoring', healthController.getMonitoringLambdaHealth);
healthRoutes.get('/audit', healthController.getAuditLambdaHealth);
