//TODO

import express from 'express';
import { requestController } from '../controllers/request.controller.js';

export const requestRoutes = express.Router();

requestRoutes.get('/', requestController.getAllRequests);
requestRoutes.get('/:id', requestController.getRequestById);
requestRoutes.post('/', requestController.createRequest);
requestRoutes.patch('/:id', requestController.updateRequest);
