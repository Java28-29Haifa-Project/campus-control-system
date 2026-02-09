// @ts-nocheck


import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { incidentController } from '../../../src/controllers/incident.controller.js';
import {
    mockRequest,
    mockResponse,
    mockNext,
    createSupportUser,
    createEngineerUser,
    createAdminUser,
    createTestUser,
    createTestIncident,
    createMultipleTestIncidents,
    expectHttpError,
    expectSuccessResponse,
    VALID_INCIDENT_CREATE_DATA,
    INVALID_INCIDENT_DATA,
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

describe('IncidentController', () => {
    beforeEach(() => {
        mockApiGateway.reset();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // ==================== GET /incidents - Get All Incidents ====================

    describe('getIncidents', () => {
        it('should return all incidents for ENGINEER role', async () => {
            // Arrange
            const incidents = createMultipleTestIncidents(3);
            mockApiGateway.seedIncidents(incidents);

            const req = mockRequest({
                user: createEngineerUser(),
                query: {},
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.getIncidents(req as any, res as any, next);

            // Assert
            expectSuccessResponse(res, 200);
            const responseData = (res.json as jest.Mock).mock.calls[0][0];
            expect(responseData).toHaveLength(3);
            expect(next).not.toHaveBeenCalled();
        });

        it('should filter out system category incidents for SUPPORT role', async () => {
            // Arrange
            const networkIncident = createTestIncident({ category: IncidentCategory.Network });
            const systemIncident = createTestIncident({ category: IncidentCategory.System });
            mockApiGateway.seedIncidents([networkIncident, systemIncident]);

            const req = mockRequest({
                user: createSupportUser(),
                query: {},
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.getIncidents(req as any, res as any, next);

            // Assert
            expectSuccessResponse(res, 200);
            const responseData = (res.json as jest.Mock).mock.calls[0][0];
            expect(responseData).toHaveLength(1);
            expect(responseData[0].category).toBe(IncidentCategory.Network);
        });

        it('should filter by status when provided', async () => {
            // Arrange
            const newIncident = createTestIncident({ status: IncidentStatus.New });
            const assignedIncident = createTestIncident({ status: IncidentStatus.Assigned });
            mockApiGateway.seedIncidents([newIncident, assignedIncident]);

            const req = mockRequest({
                user: createEngineerUser(),
                query: { status: IncidentStatus.New },
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.getIncidents(req as any, res as any, next);

            // Assert
            expectSuccessResponse(res, 200);
            const responseData = (res.json as jest.Mock).mock.calls[0][0];
            expect(responseData).toHaveLength(1);
            expect(responseData[0].status).toBe(IncidentStatus.New);
        });

        it('should filter by priority when provided', async () => {
            // Arrange
            const p1Incident = createTestIncident({ priority: 1 });
            const p2Incident = createTestIncident({ priority: 2 });
            mockApiGateway.seedIncidents([p1Incident, p2Incident]);

            const req = mockRequest({
                user: createEngineerUser(),
                query: { priority: '1' },
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.getIncidents(req as any, res as any, next);

            // Assert
            expectSuccessResponse(res, 200);
            const responseData = (res.json as jest.Mock).mock.calls[0][0];
            expect(responseData).toHaveLength(1);
            expect(responseData[0].priority).toBe(1);
        });

        it('should filter by category when provided', async () => {
            // Arrange
            const networkIncident = createTestIncident({ category: IncidentCategory.Network });
            const hvacIncident = createTestIncident({ category: IncidentCategory.HVAC });
            mockApiGateway.seedIncidents([networkIncident, hvacIncident]);

            const req = mockRequest({
                user: createEngineerUser(),
                query: { category: IncidentCategory.Network },
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.getIncidents(req as any, res as any, next);

            // Assert
            expectSuccessResponse(res, 200);
            const responseData = (res.json as jest.Mock).mock.calls[0][0];
            expect(responseData).toHaveLength(1);
            expect(responseData[0].category).toBe(IncidentCategory.Network);
        });

        it('should filter by assignedBy when provided', async () => {
            // Arrange
            const engineer1Incident = createTestIncident({ assignedBy: 'engineer_001' });
            const engineer2Incident = createTestIncident({ assignedBy: 'engineer_002' });
            mockApiGateway.seedIncidents([engineer1Incident, engineer2Incident]);

            const req = mockRequest({
                user: createEngineerUser(),
                query: { assignedBy: 'engineer_001' },
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.getIncidents(req as any, res as any, next);

            // Assert
            expectSuccessResponse(res, 200);
            const responseData = (res.json as jest.Mock).mock.calls[0][0];
            expect(responseData).toHaveLength(1);
            expect(responseData[0].assignedBy).toBe('engineer_001');
        });

        it('should filter by date range when provided', async () => {
            // Arrange
            const oldIncident = createTestIncident({ createdAt: new Date('2026-01-01') });
            const recentIncident = createTestIncident({ createdAt: new Date('2026-02-08') });
            mockApiGateway.seedIncidents([oldIncident, recentIncident]);

            const req = mockRequest({
                user: createEngineerUser(),
                query: {
                    dateFrom: '2026-02-01',
                    dateTo: '2026-02-28',
                },
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.getIncidents(req as any, res as any, next);

            // Assert
            expectSuccessResponse(res, 200);
            const responseData = (res.json as jest.Mock).mock.calls[0][0];
            expect(responseData).toHaveLength(1);
            expect(responseData[0].incidentId).toBe(recentIncident.incidentId);
        });

        it('should return 401 when user is not authenticated', async () => {
            // Arrange
            const req = mockRequest({ user: undefined });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.getIncidents(req as any, res as any, next);

            // Assert
            expectHttpError(next, 401, 'Authentication required');
        });

        it('should handle API gateway errors', async () => {
            // Arrange
            const error = new Error('API Gateway failed');
            mockApiGateway.setShouldThrowError(error);

            const req = mockRequest({ user: createEngineerUser() });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.getIncidents(req as any, res as any, next);

            // Assert
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    // ==================== GET /incidents/:id - Get Single Incident ====================

    describe('getIncident', () => {
        it('should return incident for valid ID and ENGINEER role', async () => {
            // Arrange
            const incident = createTestIncident();
            mockApiGateway.seedIncident(incident);

            const req = mockRequest({
                user: createEngineerUser(),
                params: { id: incident.incidentId },
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.getIncident(req as any, res as any, next);

            // Assert
            expectSuccessResponse(res, 200, { incidentId: incident.incidentId });
        });

        it('should return 404 when incident not found', async () => {
            // Arrange
            const req = mockRequest({
                user: createEngineerUser(),
                params: { id: 'non-existent-id' },
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.getIncident(req as any, res as any, next);

            // Assert
            expectHttpError(next, 404, 'Incident not found');
        });

        it('should return 403 when SUPPORT tries to access system category incident', async () => {
            // Arrange
            const systemIncident = createTestIncident({ category: IncidentCategory.System });
            mockApiGateway.seedIncident(systemIncident);

            const req = mockRequest({
                user: createSupportUser(),
                params: { id: systemIncident.incidentId },
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.getIncident(req as any, res as any, next);

            // Assert
            expectHttpError(next, 403, 'Access denied to system incidents');
        });

        it('should allow ADMIN to access system category incident', async () => {
            // Arrange
            const systemIncident = createTestIncident({ category: IncidentCategory.System });
            mockApiGateway.seedIncident(systemIncident);

            const req = mockRequest({
                user: createAdminUser(),
                params: { id: systemIncident.incidentId },
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.getIncident(req as any, res as any, next);

            // Assert
            expectSuccessResponse(res, 200, { incidentId: systemIncident.incidentId });
        });

        it('should return 401 when user is not authenticated', async () => {
            // Arrange
            const req = mockRequest({
                user: undefined,
                params: { id: 'some-id' },
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.getIncident(req as any, res as any, next);

            // Assert
            expectHttpError(next, 401, 'Authentication required');
        });
    });

    // ==================== POST /incidents - Create Incident ====================

    describe('createIncident', () => {
        it('should create incident with valid data and SUPPORT role', async () => {
            // Arrange
            const supportUser = createSupportUser();
            const req = mockRequest({
                user: supportUser,
                body: VALID_INCIDENT_CREATE_DATA,
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.createIncident(req as any, res as any, next);

            // Assert
            expectSuccessResponse(res, 201);
            const responseData = (res.json as jest.Mock).mock.calls[0][0];
            expect(responseData.incidentId).toBeDefined();
            expect(responseData.status).toBe(IncidentStatus.New);
            expect(responseData.createdBy).toBe(supportUser.userId);
            expect(responseData.priority).toBe(1); // high + high = P1
        });

        it('should return 400 when ticketIds array is empty', async () => {
            // Arrange
            const req = mockRequest({
                user: createSupportUser(),
                body: INVALID_INCIDENT_DATA.noTickets,
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.createIncident(req as any, res as any, next);

            // Assert
            expectHttpError(next, 400, 'ticket');
        });

        it('should return 403 when SUPPORT tries to create system category incident', async () => {
            // Arrange
            const req = mockRequest({
                user: createSupportUser(),
                body: INVALID_INCIDENT_DATA.systemCategory,
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.createIncident(req as any, res as any, next);

            // Assert
            expectHttpError(next, 403);
        });

        it('should return 401 when user is not authenticated', async () => {
            // Arrange
            const req = mockRequest({
                user: undefined,
                body: VALID_INCIDENT_CREATE_DATA,
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.createIncident(req as any, res as any, next);

            // Assert
            expectHttpError(next, 401, 'Authentication required');
        });

        it('should calculate priority correctly for different impact/urgency combinations', async () => {
            // Arrange
            const testCases = [
                { impact: Impact.Critical, urgency: Urgency.High, expectedPriority: 1 },
                { impact: Impact.High, urgency: Urgency.High, expectedPriority: 1 },
                { impact: Impact.High, urgency: Urgency.Medium, expectedPriority: 2 },
                { impact: Impact.Medium, urgency: Urgency.High, expectedPriority: 2 },
                { impact: Impact.Low, urgency: Urgency.Low, expectedPriority: 4 },
            ];

            for (const testCase of testCases) {
                mockApiGateway.reset();

                const req = mockRequest({
                    user: createSupportUser(),
                    body: {
                        ...VALID_INCIDENT_CREATE_DATA,
                        impact: testCase.impact,
                        urgency: testCase.urgency,
                    },
                });
                const res = mockResponse();
                const next = mockNext();

                // Act
                await incidentController.createIncident(req as any, res as any, next);

                // Assert
                const responseData = (res.json as jest.Mock).mock.calls[0][0];
                expect(responseData.priority).toBe(testCase.expectedPriority);
            }
        });
    });

    // ==================== PATCH /incidents/:id/status - Update Status ====================

    describe('updateIncidentStatus', () => {
        it('should update status with valid transition for ENGINEER', async () => {
            // Arrange
            const incident = createTestIncident({ status: IncidentStatus.Assigned });
            mockApiGateway.seedIncident(incident);

            const engineerUser = createEngineerUser();
            const req = mockRequest({
                user: engineerUser,
                params: { id: incident.incidentId },
                body: {
                    status: IncidentStatus.InProgress,
                    comment: 'Starting work',
                },
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.updateIncidentStatus(req as any, res as any, next);

            // Assert
            expectSuccessResponse(res, 200);
            const responseData = (res.json as jest.Mock).mock.calls[0][0];
            expect(responseData.status).toBe(IncidentStatus.InProgress);
        });

        it('should return 400 for invalid status transition', async () => {
            // Arrange
            const incident = createTestIncident({ status: IncidentStatus.InProgress });
            mockApiGateway.seedIncident(incident);

            const req = mockRequest({
                user: createEngineerUser(),
                params: { id: incident.incidentId },
                body: {
                    status: IncidentStatus.Assigned, // Invalid: cannot go back
                },
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.updateIncidentStatus(req as any, res as any, next);

            // Assert
            expectHttpError(next, 400, 'Invalid status transition');
        });

        it('should return 403 when SUPPORT tries to update status', async () => {
            // Arrange
            const incident = createTestIncident();
            mockApiGateway.seedIncident(incident);

            const req = mockRequest({
                user: createSupportUser(),
                params: { id: incident.incidentId },
                body: { status: IncidentStatus.Assigned },
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.updateIncidentStatus(req as any, res as any, next);

            // Assert
            expectHttpError(next, 403, 'Only engineers can update incident status');
        });

        it('should return 404 when incident not found', async () => {
            // Arrange
            const req = mockRequest({
                user: createEngineerUser(),
                params: { id: 'non-existent' },
                body: { status: IncidentStatus.Assigned },
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.updateIncidentStatus(req as any, res as any, next);

            // Assert
            expectHttpError(next, 404, 'Incident not found');
        });

        it('should allow ADMIN to update status', async () => {
            // Arrange
            const incident = createTestIncident({ status: IncidentStatus.Assigned });
            mockApiGateway.seedIncident(incident);

            const req = mockRequest({
                user: createAdminUser(),
                params: { id: incident.incidentId },
                body: { status: IncidentStatus.InProgress },
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.updateIncidentStatus(req as any, res as any, next);

            // Assert
            expectSuccessResponse(res, 200);
        });
    });

    // ==================== PATCH /incidents/:id/assign - Assign Incident ====================

    describe('assignIncident', () => {
        it('should assign incident to ENGINEER', async () => {
            // Arrange
            const incident = createTestIncident({ status: IncidentStatus.New });
            mockApiGateway.seedIncident(incident);

            const engineerUser = createEngineerUser();
            const req = mockRequest({
                user: engineerUser,
                params: { id: incident.incidentId },
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.assignIncident(req as any, res as any, next);

            // Assert
            expectSuccessResponse(res, 200);
            const responseData = (res.json as jest.Mock).mock.calls[0][0];
            expect(responseData.status).toBe(IncidentStatus.Assigned);
            expect(responseData.assignedBy).toBe(engineerUser.userId);
        });

        it('should return 403 when SUPPORT tries to assign incident', async () => {
            // Arrange
            const incident = createTestIncident();
            mockApiGateway.seedIncident(incident);

            const req = mockRequest({
                user: createSupportUser(),
                params: { id: incident.incidentId },
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.assignIncident(req as any, res as any, next);

            // Assert
            expectHttpError(next, 403, 'Only engineers can assign incidents');
        });

        it('should allow ADMIN to assign incident', async () => {
            // Arrange
            const incident = createTestIncident({ status: IncidentStatus.New });
            mockApiGateway.seedIncident(incident);

            const adminUser = createAdminUser();
            const req = mockRequest({
                user: adminUser,
                params: { id: incident.incidentId },
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.assignIncident(req as any, res as any, next);

            // Assert
            expectSuccessResponse(res, 200);
            const responseData = (res.json as jest.Mock).mock.calls[0][0];
            expect(responseData.assignedBy).toBe(adminUser.userId);
        });

        it('should return 401 when user is not authenticated', async () => {
            // Arrange
            const req = mockRequest({
                user: undefined,
                params: { id: 'some-id' },
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.assignIncident(req as any, res as any, next);

            // Assert
            expectHttpError(next, 401, 'Authentication required');
        });
    });

    // ==================== PATCH /incidents/:id/priority - Raise Priority ====================

    describe('raiseIncidentPriority', () => {
        it('should raise priority from P3 to P2 for ENGINEER', async () => {
            // Arrange
            const incident = createTestIncident({ priority: 3 });
            mockApiGateway.seedIncident(incident);

            const req = mockRequest({
                user: createEngineerUser(),
                params: { id: incident.incidentId },
                body: {
                    priority: 2,
                    comment: 'Escalating priority',
                },
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.raiseIncidentPriority(req as any, res as any, next);

            // Assert
            expectSuccessResponse(res, 200);
            const responseData = (res.json as jest.Mock).mock.calls[0][0];
            expect(responseData.priority).toBe(2);
        });

        it('should return 400 when trying to lower priority', async () => {
            // Arrange
            const incident = createTestIncident({ priority: 1 });
            mockApiGateway.seedIncident(incident);

            const req = mockRequest({
                user: createEngineerUser(),
                params: { id: incident.incidentId },
                body: { priority: 2 }, // Trying to lower from P1 to P2
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.raiseIncidentPriority(req as any, res as any, next);

            // Assert
            expectHttpError(next, 400, 'Cannot lower priority');
        });

        it('should return 400 for invalid priority value', async () => {
            // Arrange
            const incident = createTestIncident({ priority: 2 });
            mockApiGateway.seedIncident(incident);

            const req = mockRequest({
                user: createEngineerUser(),
                params: { id: incident.incidentId },
                body: { priority: 5 }, // Invalid: must be 1-4
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.raiseIncidentPriority(req as any, res as any, next);

            // Assert
            expectHttpError(next, 400);
        });

        it('should return 403 when SUPPORT tries to raise priority', async () => {
            // Arrange
            const incident = createTestIncident({ priority: 3 });
            mockApiGateway.seedIncident(incident);

            const req = mockRequest({
                user: createSupportUser(),
                params: { id: incident.incidentId },
                body: { priority: 2 },
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.raiseIncidentPriority(req as any, res as any, next);

            // Assert
            expectHttpError(next, 403, 'Forbidden');
        });

        it('should allow ADMIN to raise priority', async () => {
            // Arrange
            const incident = createTestIncident({ priority: 4 });
            mockApiGateway.seedIncident(incident);

            const req = mockRequest({
                user: createAdminUser(),
                params: { id: incident.incidentId },
                body: { priority: 1 },
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.raiseIncidentPriority(req as any, res as any, next);

            // Assert
            expectSuccessResponse(res, 200);
            const responseData = (res.json as jest.Mock).mock.calls[0][0];
            expect(responseData.priority).toBe(1);
        });

        it('should return 404 when incident not found', async () => {
            // Arrange
            const req = mockRequest({
                user: createEngineerUser(),
                params: { id: 'non-existent' },
                body: { priority: 2 },
            });
            const res = mockResponse();
            const next = mockNext();

            // Act
            await incidentController.raiseIncidentPriority(req as any, res as any, next);

            // Assert
            expectHttpError(next, 404, 'Incident not found');
        });
    });
});