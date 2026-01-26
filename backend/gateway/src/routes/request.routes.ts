/**
 * Request Routes - Enhanced with Validation
 *
 * Defines routes for request/ticket operations with proper validation.
 */

import express from 'express';
import { requestController } from '../controllers/request.controller.js';
import {
    validate,
    RequestValidationSchemas,
    QueryValidationSchemas
} from '../middleware/validation.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

export const requestRoutes = express.Router();

/**
 * GET /requests
 * Get all requests (filtered by role)
 * - USER: only their own requests
 * - ADMIN/SUPPORT/ENGINEER: all requests
 */
requestRoutes.get(
    '/',
    validate(QueryValidationSchemas.requestStatus, 'query'),
    requestController.getAllRequests
);

/**
 * GET /requests/:id
 * Get a specific request by ID
 */
requestRoutes.get(
    '/:id',
    requestController.getRequestById
);

/**
 * GET /requests/user/:userId/stats
 * Get request statistics for a user
 */
// requestRoutes.get(
//     '/user/:userId/stats',
//     requestController.getUserStats
// );

/**
 * POST /requests
 * Create a new request
 * Only USER role can create requests
 */
requestRoutes.post(
    '/',
    requireRole('USER'), // Only users can create requests
    validate(RequestValidationSchemas.createRequest, 'body'),
    requestController.createRequest
);

/**
 * PATCH /requests/:id
 * Update an existing request
 * - USER: can update their own requests (limited fields)
 * - SUPPORT/ENGINEER/ADMIN: can update any request (all fields including status)
 */
requestRoutes.patch(
    '/:id',
    validate(RequestValidationSchemas.updateRequest, 'body'),
    requestController.updateRequest
);

export default requestRoutes;