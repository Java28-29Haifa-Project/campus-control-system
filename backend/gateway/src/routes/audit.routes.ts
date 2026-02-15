import express from 'express';
import { auditController } from '../controllers/audit.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

export const auditRoutes = express.Router();

auditRoutes.get(
    '/logs',
    authMiddleware,
    requireRole('ADMIN'),
    auditController.getLogs.bind(auditController)
);

auditRoutes.get(
    '/logs/:correlationId',
    authMiddleware,
    requireRole('ADMIN'),
    auditController.getLogsByCorrelation.bind(auditController)
);