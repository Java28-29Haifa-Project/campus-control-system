//TODO

import express from 'express';
import { incidentController } from '../controllers/incident.controller.js';

export const incidentRoutes = express.Router();

incidentRoutes.get('/', incidentController.getIncidents);
incidentRoutes.get('/:id', incidentController.getIncident);
incidentRoutes.post('/', incidentController.createIncident);
incidentRoutes.patch('/:id', incidentController.updateIncident);
