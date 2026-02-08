// @ts-nocheck


import { describe, it, expect, jest, beforeAll, beforeEach, afterAll } from '@jest/globals';
import request from 'supertest';
import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import { incidentRoutes } from '../../../src/routes/incident.routes.js';
import { authMiddleware } from '../../../src/middleware/auth.middleware.js';
import { requireRole } from '../../../src/middleware/role.middleware.js';
import { errorHandler } from '../../../src/errors/error-handler.js';
import {
    validate,
    IncidentValidationSchemas,
    QueryValidationSchemas,
} from '../../../src/middleware/validation.middleware.js';
import {
    createAccessToken,
    createSupportUser,
    createEngineerUser,
    createAdminUser,
    createTestUser,
    createTestIncident,
    VALID_INCIDENT_CREATE_DATA,
    TEST_TICKET_IDS,
} from '../../helpers/test-helpers.js';
import {
    IncidentStatus,
    IncidentCategory,
    Impact,
    Urgency,
} from '../../../src/types/incident.js';
import { createMockIncidentApiGateway } from '../../mocks/incident-api-gateway.mock.js';

// Mock the incident API gateway
const mockApiGateway = createMockIncidentApiGateway();
jest.mock('../../../src/services/api-gateway/mocks/IncidentApiGatewayMock.js', () => ({
    incidentApiGatewayMock: mockApiGateway,
}));

describe('Incident Routes Integration Tests', () => {
    let app: Express;
    let supportToken: string;
    let engineerToken: string;
    let adminToken: string;

    beforeAll(() => {
        // Create test app with all middleware
        app = express();
        app.use(express.json());
        app.use(cookieParser());

        // Mount incident routes with required middleware
        app.use(
            '/incidents',
            authMiddleware,
            requireRole('SUPPORT', 'ENGINEER', 'ADMIN'),
            incidentRoutes
        );

        // Error handler
        app.use(errorHandler);

        // Generate test tokens
        supportToken = createAccessToken(createSupportUser());
        engineerToken = createAccessToken(createEngineerUser());
        adminToken = createAccessToken(createAdminUser());
    });

    beforeEach(() => {
        mockApiGateway.reset();
    });

    // ==================== GET /incidents ====================

    describe('GET /incidents', () => {
        it('should return 200 with all incidents for authenticated ENGINEER', async () => {
            // Arrange
            const incidents = [
                createTestIncident({ priority: 1 }),
                createTestIncident({ priority: 2 }),
            ];
            mockApiGateway.seedIncidents(incidents);

            // Act
            const response = await request(app)
                .get('/incidents')
                .set('Cookie', [`accessToken=${engineerToken}`]);

            // Assert
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(2);
        });

        it('should filter out system incidents for SUPPORT role', async () => {
            // Arrange
            const networkIncident = createTestIncident({ category: IncidentCategory.Network });
            const systemIncident = createTestIncident({ category: IncidentCategory.System });
            mockApiGateway.seedIncidents([networkIncident, systemIncident]);

            // Act
            const response = await request(app)
                .get('/incidents')
                .set('Cookie', [`accessToken=${supportToken}`]);

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
            expect(response.body[0].category).toBe(IncidentCategory.Network);
        });

        it('should filter by status query parameter', async () => {
            // Arrange
            const newIncident = createTestIncident({ status: IncidentStatus.New });
            const assignedIncident = createTestIncident({ status: IncidentStatus.Assigned });
            mockApiGateway.seedIncidents([newIncident, assignedIncident]);

            // Act
            const response = await request(app)
                .get('/incidents?status=new')
                .set('Cookie', [`accessToken=${engineerToken}`]);

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
            expect(response.body[0].status).toBe(IncidentStatus.New);
        });

        it('should filter by priority query parameter', async () => {
            // Arrange
            const p1Incident = createTestIncident({ priority: 1 });
            const p2Incident = createTestIncident({ priority: 2 });
            mockApiGateway.seedIncidents([p1Incident, p2Incident]);

            // Act
            const response = await request(app)
                .get('/incidents?priority=1')
                .set('Cookie', [`accessToken=${engineerToken}`]);

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
            expect(response.body[0].priority).toBe(1);
        });

        it('should return 401 when no auth token provided', async () => {
            // Act
            const response = await request(app).get('/incidents');

            // Assert
            expect(response.status).toBe(401);
            expect(response.body.error).toContain('Authentication required');
        });

        it('should return 403 when USER role tries to access', async () => {
            // Arrange
            const userToken = createAccessToken(createTestUser({ role: 'USER' }));

            // Act
            const response = await request(app)
                .get('/incidents')
                .set('Cookie', [`accessToken=${userToken}`]);

            // Assert
            expect(response.status).toBe(403);
        });
    });

    // ==================== GET /incidents/:id ====================

    describe('GET /incidents/:id', () => {
        it('should return 200 with incident details for valid ID', async () => {
            // Arrange
            const incident = createTestIncident();
            mockApiGateway.seedIncident(incident);

            // Act
            const response = await request(app)
                .get(`/incidents/${incident.incidentId}`)
                .set('Cookie', [`accessToken=${engineerToken}`]);

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.incidentId).toBe(incident.incidentId);
            expect(response.body.ticketIds).toEqual(incident.ticketIds);
        });

        it('should return 404 when incident not found', async () => {
            // Act
            const response = await request(app)
                .get('/incidents/non-existent-id')
                .set('Cookie', [`accessToken=${engineerToken}`]);

            // Assert
            expect(response.status).toBe(404);
            expect(response.body.error).toContain('not found');
        });

        it('should return 403 when SUPPORT tries to access system incident', async () => {
            // Arrange
            const systemIncident = createTestIncident({ category: IncidentCategory.System });
            mockApiGateway.seedIncident(systemIncident);

            // Act
            const response = await request(app)
                .get(`/incidents/${systemIncident.incidentId}`)
                .set('Cookie', [`accessToken=${supportToken}`]);

            // Assert
            expect(response.status).toBe(403);
            expect(response.body.error).toContain('system');
        });

        it('should allow ADMIN to access system incident', async () => {
            // Arrange
            const systemIncident = createTestIncident({ category: IncidentCategory.System });
            mockApiGateway.seedIncident(systemIncident);

            // Act
            const response = await request(app)
                .get(`/incidents/${systemIncident.incidentId}`)
                .set('Cookie', [`accessToken=${adminToken}`]);

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.category).toBe(IncidentCategory.System);
        });
    });

    // ==================== POST /incidents ====================

    describe('POST /incidents', () => {
        it('should create incident with valid data', async () => {
            // Act
            const response = await request(app)
                .post('/incidents')
                .set('Cookie', [`accessToken=${supportToken}`])
                .send(VALID_INCIDENT_CREATE_DATA);

            // Assert
            expect(response.status).toBe(201);
            expect(response.body.incidentId).toBeDefined();
            expect(response.body.status).toBe(IncidentStatus.New);
            expect(response.body.priority).toBe(1); // high + high = P1
            expect(response.body.ticketIds).toEqual(VALID_INCIDENT_CREATE_DATA.ticketIds);
        });

        it('should return 400 when ticketIds is empty', async () => {
            // Act
            const response = await request(app)
                .post('/incidents')
                .set('Cookie', [`accessToken=${supportToken}`])
                .send({
                    ...VALID_INCIDENT_CREATE_DATA,
                    ticketIds: [],
                });

            // Assert
            expect(response.status).toBe(400);
        });

        it('should return 400 with validation error for invalid impact', async () => {
            // Act
            const response = await request(app)
                .post('/incidents')
                .set('Cookie', [`accessToken=${supportToken}`])
                .send({
                    ...VALID_INCIDENT_CREATE_DATA,
                    impact: 'invalid-impact',
                });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.error).toContain('Validation');
        });

        it('should return 403 when SUPPORT tries to create system category', async () => {
            // Act
            const response = await request(app)
                .post('/incidents')
                .set('Cookie', [`accessToken=${supportToken}`])
                .send({
                    ...VALID_INCIDENT_CREATE_DATA,
                    category: IncidentCategory.System,
                });

            // Assert
            expect(response.status).toBe(403);
        });

        it('should calculate priority correctly for different combinations', async () => {
            // Test P1 (critical + high)
            let response = await request(app)
                .post('/incidents')
                .set('Cookie', [`accessToken=${supportToken}`])
                .send({
                    ...VALID_INCIDENT_CREATE_DATA,
                    impact: Impact.Critical,
                    urgency: Urgency.High,
                });
            expect(response.body.priority).toBe(1);

            // Test P4 (low + low)
            response = await request(app)
                .post('/incidents')
                .set('Cookie', [`accessToken=${supportToken}`])
                .send({
                    ...VALID_INCIDENT_CREATE_DATA,
                    impact: Impact.Low,
                    urgency: Urgency.Low,
                });
            expect(response.body.priority).toBe(4);
        });

        it('should include createdBy from authenticated user', async () => {
            // Act
            const response = await request(app)
                .post('/incidents')
                .set('Cookie', [`accessToken=${supportToken}`])
                .send(VALID_INCIDENT_CREATE_DATA);

            // Assert
            expect(response.status).toBe(201);
            expect(response.body.createdBy).toBe('support_001');
        });

        it('should return 401 when not authenticated', async () => {
            // Act
            const response = await request(app)
                .post('/incidents')
                .send(VALID_INCIDENT_CREATE_DATA);

            // Assert
            expect(response.status).toBe(401);
        });
    });

    // ==================== PATCH /incidents/:id/status ====================

    describe('PATCH /incidents/:id/status', () => {
        it('should update status with valid transition for ENGINEER', async () => {
            // Arrange
            const incident = createTestIncident({ status: IncidentStatus.Assigned });
            mockApiGateway.seedIncident(incident);

            // Act
            const response = await request(app)
                .patch(`/incidents/${incident.incidentId}/status`)
                .set('Cookie', [`accessToken=${engineerToken}`])
                .send({
                    status: IncidentStatus.InProgress,
                    comment: 'Starting work',
                });

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.status).toBe(IncidentStatus.InProgress);
        });

        it('should return 400 for invalid status transition', async () => {
            // Arrange
            const incident = createTestIncident({ status: IncidentStatus.InProgress });
            mockApiGateway.seedIncident(incident);

            // Act
            const response = await request(app)
                .patch(`/incidents/${incident.incidentId}/status`)
                .set('Cookie', [`accessToken=${engineerToken}`])
                .send({
                    status: IncidentStatus.Assigned, // Cannot go backwards
                });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.error).toContain('Invalid status transition');
        });

        it('should return 403 when SUPPORT tries to update status', async () => {
            // Arrange
            const incident = createTestIncident();
            mockApiGateway.seedIncident(incident);

            // Act
            const response = await request(app)
                .patch(`/incidents/${incident.incidentId}/status`)
                .set('Cookie', [`accessToken=${supportToken}`])
                .send({ status: IncidentStatus.Assigned });

            // Assert
            expect(response.status).toBe(403);
        });

        it('should allow ADMIN to update status', async () => {
            // Arrange
            const incident = createTestIncident({ status: IncidentStatus.Assigned });
            mockApiGateway.seedIncident(incident);

            // Act
            const response = await request(app)
                .patch(`/incidents/${incident.incidentId}/status`)
                .set('Cookie', [`accessToken=${adminToken}`])
                .send({ status: IncidentStatus.InProgress });

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.status).toBe(IncidentStatus.InProgress);
        });

        it('should return 404 when incident not found', async () => {
            // Act
            const response = await request(app)
                .patch('/incidents/non-existent/status')
                .set('Cookie', [`accessToken=${engineerToken}`])
                .send({ status: IncidentStatus.Assigned });

            // Assert
            expect(response.status).toBe(404);
        });

        it('should validate required status field', async () => {
            // Arrange
            const incident = createTestIncident();
            mockApiGateway.seedIncident(incident);

            // Act
            const response = await request(app)
                .patch(`/incidents/${incident.incidentId}/status`)
                .set('Cookie', [`accessToken=${engineerToken}`])
                .send({ comment: 'Missing status field' });

            // Assert
            expect(response.status).toBe(400);
        });
    });

    // ==================== PATCH /incidents/:id/assign ====================

    describe('PATCH /incidents/:id/assign', () => {
        it('should assign incident to ENGINEER', async () => {
            // Arrange
            const incident = createTestIncident({ status: IncidentStatus.New });
            mockApiGateway.seedIncident(incident);

            // Act
            const response = await request(app)
                .patch(`/incidents/${incident.incidentId}/assign`)
                .set('Cookie', [`accessToken=${engineerToken}`]);

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.status).toBe(IncidentStatus.Assigned);
            expect(response.body.assignedBy).toBe('engineer_001');
        });

        it('should return 403 when SUPPORT tries to assign', async () => {
            // Arrange
            const incident = createTestIncident();
            mockApiGateway.seedIncident(incident);

            // Act
            const response = await request(app)
                .patch(`/incidents/${incident.incidentId}/assign`)
                .set('Cookie', [`accessToken=${supportToken}`]);

            // Assert
            expect(response.status).toBe(403);
            expect(response.body.error).toContain('engineer');
        });

        it('should allow ADMIN to assign incident', async () => {
            // Arrange
            const incident = createTestIncident({ status: IncidentStatus.New });
            mockApiGateway.seedIncident(incident);

            // Act
            const response = await request(app)
                .patch(`/incidents/${incident.incidentId}/assign`)
                .set('Cookie', [`accessToken=${adminToken}`]);

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.assignedBy).toBe('admin_001');
        });

        it('should return 404 when incident not found', async () => {
            // Act
            const response = await request(app)
                .patch('/incidents/non-existent/assign')
                .set('Cookie', [`accessToken=${engineerToken}`]);

            // Assert
            expect(response.status).toBe(404);
        });
    });

    // ==================== PATCH /incidents/:id/priority ====================

    describe('PATCH /incidents/:id/priority', () => {
        it('should raise priority from P3 to P2', async () => {
            // Arrange
            const incident = createTestIncident({ priority: 3 });
            mockApiGateway.seedIncident(incident);

            // Act
            const response = await request(app)
                .patch(`/incidents/${incident.incidentId}/priority`)
                .set('Cookie', [`accessToken=${engineerToken}`])
                .send({
                    priority: 2,
                    comment: 'Escalating priority',
                });

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.priority).toBe(2);
        });

        it('should raise priority from P4 to P1 (skip levels)', async () => {
            // Arrange
            const incident = createTestIncident({ priority: 4 });
            mockApiGateway.seedIncident(incident);

            // Act
            const response = await request(app)
                .patch(`/incidents/${incident.incidentId}/priority`)
                .set('Cookie', [`accessToken=${engineerToken}`])
                .send({ priority: 1 });

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.priority).toBe(1);
        });

        it('should return 400 when trying to lower priority', async () => {
            // Arrange
            const incident = createTestIncident({ priority: 1 });
            mockApiGateway.seedIncident(incident);

            // Act
            const response = await request(app)
                .patch(`/incidents/${incident.incidentId}/priority`)
                .set('Cookie', [`accessToken=${engineerToken}`])
                .send({ priority: 2 });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.error).toContain('Cannot lower priority');
        });

        it('should return 400 for invalid priority value', async () => {
            // Arrange
            const incident = createTestIncident({ priority: 2 });
            mockApiGateway.seedIncident(incident);

            // Act
            const response = await request(app)
                .patch(`/incidents/${incident.incidentId}/priority`)
                .set('Cookie', [`accessToken=${engineerToken}`])
                .send({ priority: 5 }); // Invalid: must be 1-4

            // Assert
            expect(response.status).toBe(400);
        });

        it('should return 403 when SUPPORT tries to raise priority', async () => {
            // Arrange
            const incident = createTestIncident({ priority: 3 });
            mockApiGateway.seedIncident(incident);

            // Act
            const response = await request(app)
                .patch(`/incidents/${incident.incidentId}/priority`)
                .set('Cookie', [`accessToken=${supportToken}`])
                .send({ priority: 2 });

            // Assert
            expect(response.status).toBe(403);
        });

        it('should allow ADMIN to raise priority', async () => {
            // Arrange
            const incident = createTestIncident({ priority: 4 });
            mockApiGateway.seedIncident(incident);

            // Act
            const response = await request(app)
                .patch(`/incidents/${incident.incidentId}/priority`)
                .set('Cookie', [`accessToken=${adminToken}`])
                .send({ priority: 1 });

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.priority).toBe(1);
        });

        it('should validate required priority field', async () => {
            // Arrange
            const incident = createTestIncident();
            mockApiGateway.seedIncident(incident);

            // Act
            const response = await request(app)
                .patch(`/incidents/${incident.incidentId}/priority`)
                .set('Cookie', [`accessToken=${engineerToken}`])
                .send({ comment: 'Missing priority field' });

            // Assert
            expect(response.status).toBe(400);
        });

        it('should return 404 when incident not found', async () => {
            // Act
            const response = await request(app)
                .patch('/incidents/non-existent/priority')
                .set('Cookie', [`accessToken=${engineerToken}`])
                .send({ priority: 1 });

            // Assert
            expect(response.status).toBe(404);
        });
    });

    // ==================== Full Workflow Test ====================

    describe('Full Incident Workflow', () => {
        it('should complete full incident lifecycle', async () => {
            // 1. SUPPORT creates incident
            let response = await request(app)
                .post('/incidents')
                .set('Cookie', [`accessToken=${supportToken}`])
                .send(VALID_INCIDENT_CREATE_DATA);

            expect(response.status).toBe(201);
            const incidentId = response.body.incidentId;
            expect(response.body.status).toBe(IncidentStatus.New);

            // 2. ENGINEER assigns to self
            response = await request(app)
                .patch(`/incidents/${incidentId}/assign`)
                .set('Cookie', [`accessToken=${engineerToken}`]);

            expect(response.status).toBe(200);
            expect(response.body.status).toBe(IncidentStatus.Assigned);
            expect(response.body.assignedBy).toBe('engineer_001');

            // 3. ENGINEER starts work
            response = await request(app)
                .patch(`/incidents/${incidentId}/status`)
                .set('Cookie', [`accessToken=${engineerToken}`])
                .send({ status: IncidentStatus.InProgress });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe(IncidentStatus.InProgress);

            // 4. ENGINEER escalates priority
            response = await request(app)
                .patch(`/incidents/${incidentId}/priority`)
                .set('Cookie', [`accessToken=${engineerToken}`])
                .send({ priority: 1 });

            expect(response.status).toBe(200);
            expect(response.body.priority).toBe(1);

            // 5. ENGINEER resolves incident
            response = await request(app)
                .patch(`/incidents/${incidentId}/status`)
                .set('Cookie', [`accessToken=${engineerToken}`])
                .send({ status: IncidentStatus.Resolved });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe(IncidentStatus.Resolved);
            expect(response.body.resolvedBy).toBe('engineer_001');

            // 6. Verify final state
            response = await request(app)
                .get(`/incidents/${incidentId}`)
                .set('Cookie', [`accessToken=${engineerToken}`]);

            expect(response.status).toBe(200);
            expect(response.body.status).toBe(IncidentStatus.Resolved);
            expect(response.body.priority).toBe(1);
            expect(response.body.assignedBy).toBe('engineer_001');
            expect(response.body.resolvedBy).toBe('engineer_001');
        });
    });
});