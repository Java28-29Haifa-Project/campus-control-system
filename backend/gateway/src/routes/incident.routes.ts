// src/routes/incident.routes.ts - ADD THIS ROUTE

import express from 'express';
import { incidentController } from '../controllers/incident.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

export const incidentRoutes = express.Router();

// Get all incidents (SUPPORT+)
incidentRoutes.get(
    '/',
    authMiddleware,
    requireRole('SUPPORT', 'ENGINEER', 'ADMIN'),
    incidentController.getIncidents.bind(incidentController)
);

// Get single incident (SUPPORT+)
incidentRoutes.get(
    '/:id',
    authMiddleware,
    requireRole('SUPPORT', 'ENGINEER', 'ADMIN'),
    incidentController.getIncident.bind(incidentController)
);

// Create incident (SUPPORT+)
incidentRoutes.post(
    '/',
    authMiddleware,
    requireRole('SUPPORT', 'ENGINEER', 'ADMIN'),
    incidentController.createIncident.bind(incidentController)
);

// Assign incident (ENGINEER+)
incidentRoutes.patch(
    '/:id/assign',
    authMiddleware,
    requireRole('ENGINEER', 'ADMIN'),
    incidentController.assignIncident.bind(incidentController)
);

// Update status (ENGINEER+)
incidentRoutes.patch(
    '/:id/status',
    authMiddleware,
    requireRole('ENGINEER', 'ADMIN'),
    incidentController.updateIncidentStatus.bind(incidentController)
);

// Raise priority (ENGINEER+)
incidentRoutes.patch(
    '/:id/priority',
    authMiddleware,
    requireRole('ENGINEER', 'ADMIN'),
    incidentController.raiseIncidentPriority.bind(incidentController)
);

// Add comment (ENGINEER+) ← NEW ROUTE
incidentRoutes.post(
    '/:id/comments',
    authMiddleware,
    requireRole('ENGINEER', 'ADMIN'),
    incidentController.addComment.bind(incidentController)
);
