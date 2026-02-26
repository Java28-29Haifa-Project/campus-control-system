import express from 'express';
import { incidentController } from '../controllers/incident.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

export const incidentRoutes = express.Router();

incidentRoutes.get(
    '/',
    authMiddleware,
    requireRole('SUPPORT', 'ENGINEER', 'ADMIN'),
    incidentController.getIncidents.bind(incidentController)
);

incidentRoutes.get(
    '/:id',
    authMiddleware,
    requireRole('SUPPORT', 'ENGINEER', 'ADMIN'),
    incidentController.getIncident.bind(incidentController)
);

incidentRoutes.post(
    '/',
    authMiddleware,
    requireRole('SUPPORT', 'ENGINEER', 'ADMIN'),
    incidentController.createIncident.bind(incidentController)
);

incidentRoutes.patch(
    '/:id/assign',
    authMiddleware,
    requireRole('ENGINEER', 'ADMIN'),
    incidentController.assignIncident.bind(incidentController)
);

incidentRoutes.patch(
    '/:id/status',
    authMiddleware,
    requireRole('ENGINEER', 'ADMIN'),
    incidentController.updateIncidentStatus.bind(incidentController)
);

incidentRoutes.post(
    '/:id/request-close',
    authMiddleware,
    requireRole('ADMIN'),
    incidentController.requestClose.bind(incidentController)
);

incidentRoutes.patch(
    '/:id/priority',
    authMiddleware,
    requireRole('ENGINEER', 'ADMIN'),
    incidentController.raiseIncidentPriority.bind(incidentController)
);

incidentRoutes.post(
    '/:id/comments',
    authMiddleware,
    requireRole('ENGINEER', 'ADMIN'),
    incidentController.addComment.bind(incidentController)
);

incidentRoutes.delete(
    '/:id',
    authMiddleware,
    requireRole('ADMIN'),
    incidentController.deleteIncident.bind(incidentController)
);
