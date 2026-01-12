import express from 'express';
import { monitoringController } from '../controllers/monitoring.controller.js';

export const monitoringRoutes = express.Router();

monitoringRoutes.get('/logs', monitoringController.getLogs);
monitoringRoutes.get('/alarms', monitoringController.getAlarms);
