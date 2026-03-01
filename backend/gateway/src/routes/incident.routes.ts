import express from 'express';
import { incidentController } from '../controllers/incident.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

export const incidentRoutes = express.Router();

/**
 * @swagger
 * /incidents:
 *   get:
 *     summary: Get all incidents
 *     description: List all incidents with optional filtering
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, assigned, in_progress, resolved, pending_close, closed]
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 4
 *         description: Filter by priority (1=highest, 4=lowest)
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         description: Filter by assigned engineer
 *     responses:
 *       200:
 *         description: List of incidents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Incident'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
incidentRoutes.get(
    '/',
    authMiddleware,
    requireRole('SUPPORT', 'ENGINEER', 'ADMIN'),
    incidentController.getIncidents.bind(incidentController)
);

/**
 * @swagger
 * /incidents/{id}:
 *   get:
 *     summary: Get incident by ID
 *     description: Get detailed incident information including comments
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Incident ID
 *     responses:
 *       200:
 *         description: Incident details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Incident'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
incidentRoutes.get(
    '/:id',
    authMiddleware,
    requireRole('SUPPORT', 'ENGINEER', 'ADMIN'),
    incidentController.getIncident.bind(incidentController)
);

/**
 * @swagger
 * /incidents:
 *   post:
 *     summary: Create new incident
 *     description: Create incident from one or more tickets (SUPPORT or higher)
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateIncidentBody'
 *     responses:
 *       201:
 *         description: Incident created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Incident'
 *       400:
 *         description: Invalid input or tickets already linked
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
incidentRoutes.post(
    '/',
    authMiddleware,
    requireRole('SUPPORT', 'ENGINEER', 'ADMIN'),
    incidentController.createIncident.bind(incidentController)
);

/**
 * @swagger
 * /incidents/{id}/assign:
 *   patch:
 *     summary: Assign incident to engineer
 *     description: Assign incident to specific engineer (SUPPORT or higher)
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [engineerId]
 *             properties:
 *               engineerId:
 *                 type: string
 *                 example: eng_001
 *     responses:
 *       200:
 *         description: Incident assigned successfully
 *       400:
 *         description: Invalid engineer or incident already assigned
 */
incidentRoutes.patch(
    '/:id/assign',
    authMiddleware,
    requireRole('ENGINEER', 'ADMIN'),
    incidentController.assignIncident.bind(incidentController)
);

/**
 * @swagger
 * /incidents/{id}/status:
 *   patch:
 *     summary: Update incident status
 *     description: |
 *       Update incident status.
 *       - ENGINEER can only move forward (new → assigned → in_progress → resolved → closed)
 *       - ADMIN can reverse transitions (resolved → in_progress, closed → resolved)
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [new, assigned, in_progress, resolved, pending_close, closed]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid status transition
 */
incidentRoutes.patch(
    '/:id/status',
    authMiddleware,
    requireRole('ENGINEER', 'ADMIN'),
    incidentController.updateIncidentStatus.bind(incidentController)
);

/**
 * @swagger
 * /incidents/{id}/request-close:
 *   post:
 *     summary: Request to close incident
 *     description: |
 *       Request incident closure (ADMIN only).
 *       - Sends email notification to user
 *       - Schedules auto-close after 24 hours if status remains 'resolved'
 *       - User has 24 hours to respond if issue persists
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Close request submitted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 incidentId:
 *                   type: string
 *                 autoCloseAt:
 *                   type: string
 *                   format: date-time
 *                 userNotified:
 *                   type: boolean
 *       400:
 *         description: Incident must be in 'resolved' status
 */
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

/**
 * @swagger
 * /incidents/{id}/comments:
 *   post:
 *     summary: Add comment to incident
 *     description: Add comment/update to incident (ENGINEER or higher)
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 2000
 *                 example: Working on the issue, will update in 1 hour
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       400:
 *         description: Comment text required
 */
incidentRoutes.post(
    '/:id/comments',
    authMiddleware,
    requireRole('ENGINEER', 'ADMIN'),
    incidentController.addComment.bind(incidentController)
);

/**
 * @swagger
 * /incidents/{id}:
 *   delete:
 *     summary: Delete incident
 *     description: Permanently delete incident and unlink tickets (ADMIN only)
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Incident deleted successfully
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
incidentRoutes.delete(
    '/:id',
    authMiddleware,
    requireRole('ADMIN'),
    incidentController.deleteIncident.bind(incidentController)
);
