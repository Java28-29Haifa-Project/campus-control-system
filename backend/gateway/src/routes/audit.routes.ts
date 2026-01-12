import express from 'express';
import { auditController } from '../controllers/audit.controller.js';

export const auditRoutes = express.Router();

auditRoutes.post('/', auditController.sendAuditEvent);
