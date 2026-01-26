import express from 'express';
import { requestController } from '../controllers/request.controller.js';
import {
    validate,
    RequestValidationSchemas,
    QueryValidationSchemas
} from '../middleware/validation.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

export const requestRoutes = express.Router();

requestRoutes.get(
    '/',
    validate(QueryValidationSchemas.requestStatus, 'query'),
    requestController.getAllRequests
);

requestRoutes.get(
    '/:id',
    requestController.getRequestById
);

// requestRoutes.get(
//     '/user/:userId/stats',
//     requestController.getUserStats
// );

requestRoutes.post(
    '/',
    requireRole('USER'), // Only users can create requests
    validate(RequestValidationSchemas.createRequest, 'body'),
    requestController.createRequest
);

requestRoutes.patch(
    '/:id',
    validate(RequestValidationSchemas.updateRequest, 'body'),
    requestController.updateRequest
);

export default requestRoutes;