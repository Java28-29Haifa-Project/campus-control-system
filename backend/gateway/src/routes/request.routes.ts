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
    validate(QueryValidationSchemas.requestFilters, 'query'),
    requestController.getAllRequests
);

requestRoutes.get(
    '/:id',
    requestController.getRequestById
);

requestRoutes.post(
    '/',
    requireRole('USER'), // Only users can create requests for current release
    validate(RequestValidationSchemas.createRequest, 'body'),
    requestController.createRequest
);

requestRoutes.patch(
    '/:id',
    validate(RequestValidationSchemas.updateStatusBySupport, 'body'),
    requestController.updateRequestStatus
);

export default requestRoutes;