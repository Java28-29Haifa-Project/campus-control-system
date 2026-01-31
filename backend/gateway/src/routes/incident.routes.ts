import express from 'express';
import { incidentController } from '../controllers/incident.controller.js';
import { validate, IncidentValidationSchemas, QueryValidationSchemas } from '../middleware/validation.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

export const incidentRoutes = express.Router();
incidentRoutes.get(
    '/',
    validate(QueryValidationSchemas.incidentFilters, 'query'),
    incidentController.getIncidents
);

incidentRoutes.get(
    '/:id',
    incidentController.getIncident
);

incidentRoutes.post(
    '/',
    requireRole('SUPPORT', 'ENGINEER', 'ADMIN'),
    validate(IncidentValidationSchemas.createIncident, 'body'),
    incidentController.createIncident
);

incidentRoutes.patch(
    '/:id/assign',
    requireRole('ENGINEER', 'ADMIN'),
    incidentController.assignIncident
);

incidentRoutes.patch(
    '/:id/status',
    requireRole('ENGINEER', 'ADMIN'),
    validate(IncidentValidationSchemas.updateIncidentStatus, 'body'),
    incidentController.updateIncidentStatus
);

incidentRoutes.patch(
    '/:id/priority',
    requireRole('ENGINEER', 'ADMIN'),
    validate(IncidentValidationSchemas.raiseIncidentPriority, 'body'),
    incidentController.raiseIncidentPriority
);

export default incidentRoutes;