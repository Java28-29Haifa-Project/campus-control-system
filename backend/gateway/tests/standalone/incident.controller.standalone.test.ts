// @ts-nocheck


import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ==================== Mock Data & Types ====================

const IncidentStatus = {
    New: 'new',
    Assigned: 'assigned',
    InProgress: 'in_progress',
    Resolved: 'resolved',
    Closed: 'closed'
};

const IncidentCategory = {
    Network: 'network',
    System: 'system',
    HVAC: 'hvac',
    Electrical: 'electrical'
};

const Impact = {
    Low: 'low',
    Medium: 'medium',
    High: 'high',
    Critical: 'critical'
};

const Urgency = {
    Low: 'low',
    Medium: 'medium',
    High: 'high'
};

// ==================== Mock Helper Functions ====================

const createTestUser = (role = 'ENGINEER') => ({
    userId: `${role.toLowerCase()}_001`,
    username: `${role.toLowerCase()}_user`,
    email: `${role.toLowerCase()}@test.org`,
    role: role,
    type: 'access'
});

const createTestIncident = (overrides = {}) => ({
    incidentId: overrides.incidentId || 'incident_123',
    ticketIds: overrides.ticketIds || ['ticket_1', 'ticket_2'],
    priority: overrides.priority || 2,
    status: overrides.status || IncidentStatus.New,
    category: overrides.category || IncidentCategory.Network,
    description: overrides.description || 'Test incident',
    createdBy: overrides.createdBy || 'support_001',
    assignedBy: overrides.assignedBy,
    resolvedBy: overrides.resolvedBy,
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date()
});

const mockRequest = (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    cookies: {},
    user: undefined,
    ...overrides
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = () => jest.fn();

// ==================== Mock API Gateway ====================

class MockIncidentApiGateway {
    constructor() {
        this.incidents = new Map();
    }

    reset() {
        this.incidents.clear();
    }

    seedIncident(incident) {
        this.incidents.set(incident.incidentId, incident);
    }

    seedIncidents(incidents) {
        incidents.forEach(inc => this.seedIncident(inc));
    }

    getAllIncidents() {
        return Array.from(this.incidents.values());
    }

    getIncident(incidentId) {
        return this.incidents.get(incidentId) || null;
    }

    createIncident(incidentId, data) {
        if (!data.ticketIds || data.ticketIds.length === 0) {
            throw Object.assign(new Error('At least one ticket ID is required'), { statusCode: 400 });
        }

        if (data.category === IncidentCategory.System) {
            throw Object.assign(new Error('SUPPORT cannot create system category incidents'), { statusCode: 403 });
        }

        const priority = this.calculatePriority(data.impact, data.urgency);

        const incident = {
            incidentId,
            ticketIds: data.ticketIds,
            priority,
            status: IncidentStatus.New,
            category: data.category,
            description: data.description,
            createdBy: data.createdBy,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.incidents.set(incidentId, incident);
        return incident;
    }

    updateIncidentStatus(request) {
        const incident = this.incidents.get(request.incidentId);
        if (!incident) {
            throw Object.assign(new Error('Incident not found'), { statusCode: 404 });
        }

        if (!this.isValidStatusTransition(incident.status, request.status)) {
            throw Object.assign(
                new Error(`Invalid status transition from ${incident.status} to ${request.status}`),
                { statusCode: 400 }
            );
        }

        const updated = {
            ...incident,
            status: request.status,
            updatedAt: new Date()
        };

        if (request.status === IncidentStatus.Assigned) {
            updated.assignedBy = request.updatedBy;
        }

        if (request.status === IncidentStatus.Resolved) {
            updated.resolvedBy = request.updatedBy;
        }

        this.incidents.set(request.incidentId, updated);
        return updated;
    }

    raiseIncidentPriority(request) {
        const incident = this.incidents.get(request.incidentId);
        if (!incident) {
            throw Object.assign(new Error('Incident not found'), { statusCode: 404 });
        }

        if (request.priority >= incident.priority) {
            throw Object.assign(
                new Error(`Cannot lower priority from ${incident.priority} to ${request.priority}`),
                { statusCode: 400 }
            );
        }

        if (request.priority < 1 || request.priority > 4) {
            throw Object.assign(new Error('Priority must be between 1 and 4'), { statusCode: 400 });
        }

        const updated = {
            ...incident,
            priority: request.priority,
            updatedAt: new Date()
        };

        this.incidents.set(request.incidentId, updated);
        return updated;
    }

    calculatePriority(impact, urgency) {
        if (impact === 'critical' || (impact === 'high' && urgency === 'high')) return 1;
        if ((impact === 'high' && urgency === 'medium') || (impact === 'medium' && urgency === 'high')) return 2;
        if (impact === 'medium' || urgency === 'medium') return 3;
        return 4;
    }

    isValidStatusTransition(from, to) {
        const validTransitions = {
            [IncidentStatus.New]: [IncidentStatus.Assigned],
            [IncidentStatus.Assigned]: [IncidentStatus.InProgress],
            [IncidentStatus.InProgress]: [IncidentStatus.Resolved],
            [IncidentStatus.Resolved]: [IncidentStatus.Closed],
            [IncidentStatus.Closed]: []
        };
        return validTransitions[from]?.includes(to) || false;
    }
}

const mockApiGateway = new MockIncidentApiGateway();

// ==================== Mock Controller ====================

const incidentController = {
    async getIncidents(req, res, next) {
        try {
            if (!req.user) throw { statusCode: 401, message: 'Authentication required' };

            let incidents = mockApiGateway.getAllIncidents();

            if (req.user.role === 'SUPPORT') {
                incidents = incidents.filter(inc => inc.category !== IncidentCategory.System);
            }

            if (req.query.status) {
                incidents = incidents.filter(inc => inc.status === req.query.status);
            }
            if (req.query.priority) {
                incidents = incidents.filter(inc => inc.priority === Number(req.query.priority));
            }
            if (req.query.category) {
                incidents = incidents.filter(inc => inc.category === req.query.category);
            }

            res.status(200).json(incidents);
        } catch (error) {
            next(error);
        }
    },

    async getIncident(req, res, next) {
        try {
            if (!req.user) throw { statusCode: 401, message: 'Authentication required' };

            const incidentId = req.params.id;
            const incident = mockApiGateway.getIncident(incidentId);

            if (!incident) {
                throw { statusCode: 404, message: 'Incident not found' };
            }

            if (req.user.role === 'SUPPORT' && incident.category === IncidentCategory.System) {
                throw { statusCode: 403, message: 'Access denied to system incidents' };
            }

            res.status(200).json(incident);
        } catch (error) {
            next(error);
        }
    },

    async createIncident(req, res, next) {
        try {
            if (!req.user) throw { statusCode: 401, message: 'Authentication required' };

            const { ticketIds, impact, urgency, category, description } = req.body;
            const incidentId = 'incident_' + Date.now();

            const incident = mockApiGateway.createIncident(incidentId, {
                ticketIds,
                impact,
                urgency,
                category,
                description,
                createdBy: req.user.userId
            });

            res.status(201).json(incident);
        } catch (error) {
            next(error);
        }
    },

    async updateIncidentStatus(req, res, next) {
        try {
            if (!req.user) throw { statusCode: 401, message: 'Authentication required' };

            if (req.user.role !== 'ENGINEER' && req.user.role !== 'ADMIN') {
                throw { statusCode: 403, message: 'Only engineers can update incident status' };
            }

            const incidentId = req.params.id;
            const { status, comment } = req.body;

            const incident = mockApiGateway.updateIncidentStatus({
                incidentId,
                status,
                updatedBy: req.user.userId,
                comment
            });

            res.status(200).json(incident);
        } catch (error) {
            next(error);
        }
    },

    async assignIncident(req, res, next) {
        try {
            if (!req.user) throw { statusCode: 401, message: 'Authentication required' };

            if (req.user.role !== 'ENGINEER' && req.user.role !== 'ADMIN') {
                throw { statusCode: 403, message: 'Only engineers can assign incidents' };
            }

            const incidentId = req.params.id;

            const incident = mockApiGateway.updateIncidentStatus({
                incidentId,
                status: IncidentStatus.Assigned,
                updatedBy: req.user.userId
            });

            res.status(200).json(incident);
        } catch (error) {
            next(error);
        }
    },

    async raiseIncidentPriority(req, res, next) {
        try {
            if (!req.user) throw { statusCode: 401, message: 'Authentication required' };

            if (req.user.role !== 'ENGINEER' && req.user.role !== 'ADMIN') {
                throw { statusCode: 403, message: 'Forbidden' };
            }

            const incidentId = req.params.id;
            const { priority, comment } = req.body;

            const incident = mockApiGateway.raiseIncidentPriority({
                incidentId,
                priority,
                updatedBy: req.user.userId,
                comment
            });

            res.status(200).json(incident);
        } catch (error) {
            next(error);
        }
    }
};

// ==================== TESTS ====================

describe('Incident Controller - Standalone Tests', () => {
    beforeEach(() => {
        mockApiGateway.reset();
    });

    describe('getIncidents', () => {
        it('should return all incidents for ENGINEER role', async () => {
            const incidents = [
                createTestIncident({ incidentId: 'inc1', priority: 1 }),
                createTestIncident({ incidentId: 'inc2', priority: 2 })
            ];
            mockApiGateway.seedIncidents(incidents);

            const req = mockRequest({ user: createTestUser('ENGINEER'), query: {} });
            const res = mockResponse();
            const next = mockNext();

            await incidentController.getIncidents(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalled();
            const responseData = res.json.mock.calls[0][0];
            expect(responseData).toHaveLength(2);
        });

        it('should filter out system incidents for SUPPORT role', async () => {
            const incidents = [
                createTestIncident({ incidentId: 'inc1', category: IncidentCategory.Network }),
                createTestIncident({ incidentId: 'inc2', category: IncidentCategory.System })
            ];
            mockApiGateway.seedIncidents(incidents);

            const req = mockRequest({ user: createTestUser('SUPPORT'), query: {} });
            const res = mockResponse();
            const next = mockNext();

            await incidentController.getIncidents(req, res, next);

            const responseData = res.json.mock.calls[0][0];
            expect(responseData).toHaveLength(1);
            expect(responseData[0].category).toBe(IncidentCategory.Network);
        });

        it('should return 401 when user is not authenticated', async () => {
            const req = mockRequest({ user: undefined });
            const res = mockResponse();
            const next = mockNext();

            await incidentController.getIncidents(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            const error = next.mock.calls[0][0];
            expect(error.statusCode).toBe(401);
        });
    });

    describe('createIncident', () => {
        it('should create incident with valid data', async () => {
            const req = mockRequest({
                user: createTestUser('SUPPORT'),
                body: {
                    ticketIds: ['ticket_1', 'ticket_2'],
                    impact: Impact.High,
                    urgency: Urgency.High,
                    category: IncidentCategory.Network,
                    description: 'Test incident'
                }
            });
            const res = mockResponse();
            const next = mockNext();

            await incidentController.createIncident(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
            const responseData = res.json.mock.calls[0][0];
            expect(responseData.incidentId).toBeDefined();
            expect(responseData.status).toBe(IncidentStatus.New);
            expect(responseData.priority).toBe(1); // high + high = P1
        });

        it('should return 400 when ticketIds array is empty', async () => {
            const req = mockRequest({
                user: createTestUser('SUPPORT'),
                body: {
                    ticketIds: [],
                    impact: Impact.High,
                    urgency: Urgency.High,
                    category: IncidentCategory.Network
                }
            });
            const res = mockResponse();
            const next = mockNext();

            await incidentController.createIncident(req, res, next);

            expect(next).toHaveBeenCalled();
            const error = next.mock.calls[0][0];
            expect(error.statusCode).toBe(400);
        });

        it('should return 403 when SUPPORT tries to create system category', async () => {
            const req = mockRequest({
                user: createTestUser('SUPPORT'),
                body: {
                    ticketIds: ['ticket_1'],
                    impact: Impact.High,
                    urgency: Urgency.High,
                    category: IncidentCategory.System
                }
            });
            const res = mockResponse();
            const next = mockNext();

            await incidentController.createIncident(req, res, next);

            expect(next).toHaveBeenCalled();
            const error = next.mock.calls[0][0];
            expect(error.statusCode).toBe(403);
        });
    });

    describe('updateIncidentStatus', () => {
        it('should update status with valid transition for ENGINEER', async () => {
            const incident = createTestIncident({
                incidentId: 'inc1',
                status: IncidentStatus.Assigned
            });
            mockApiGateway.seedIncident(incident);

            const req = mockRequest({
                user: createTestUser('ENGINEER'),
                params: { id: 'inc1' },
                body: { status: IncidentStatus.InProgress }
            });
            const res = mockResponse();
            const next = mockNext();

            await incidentController.updateIncidentStatus(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            const responseData = res.json.mock.calls[0][0];
            expect(responseData.status).toBe(IncidentStatus.InProgress);
        });

        it('should return 403 when SUPPORT tries to update status', async () => {
            const incident = createTestIncident({ incidentId: 'inc1' });
            mockApiGateway.seedIncident(incident);

            const req = mockRequest({
                user: createTestUser('SUPPORT'),
                params: { id: 'inc1' },
                body: { status: IncidentStatus.Assigned }
            });
            const res = mockResponse();
            const next = mockNext();

            await incidentController.updateIncidentStatus(req, res, next);

            expect(next).toHaveBeenCalled();
            const error = next.mock.calls[0][0];
            expect(error.statusCode).toBe(403);
        });
    });

    describe('assignIncident', () => {
        it('should assign incident to ENGINEER', async () => {
            const incident = createTestIncident({
                incidentId: 'inc1',
                status: IncidentStatus.New
            });
            mockApiGateway.seedIncident(incident);

            const req = mockRequest({
                user: createTestUser('ENGINEER'),
                params: { id: 'inc1' }
            });
            const res = mockResponse();
            const next = mockNext();

            await incidentController.assignIncident(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            const responseData = res.json.mock.calls[0][0];
            expect(responseData.status).toBe(IncidentStatus.Assigned);
            expect(responseData.assignedBy).toBe('engineer_001');
        });
    });

    describe('raiseIncidentPriority', () => {
        it('should raise priority from P3 to P2', async () => {
            const incident = createTestIncident({
                incidentId: 'inc1',
                priority: 3
            });
            mockApiGateway.seedIncident(incident);

            const req = mockRequest({
                user: createTestUser('ENGINEER'),
                params: { id: 'inc1' },
                body: { priority: 2 }
            });
            const res = mockResponse();
            const next = mockNext();

            await incidentController.raiseIncidentPriority(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            const responseData = res.json.mock.calls[0][0];
            expect(responseData.priority).toBe(2);
        });

        it('should return 400 when trying to lower priority', async () => {
            const incident = createTestIncident({
                incidentId: 'inc1',
                priority: 1
            });
            mockApiGateway.seedIncident(incident);

            const req = mockRequest({
                user: createTestUser('ENGINEER'),
                params: { id: 'inc1' },
                body: { priority: 2 }
            });
            const res = mockResponse();
            const next = mockNext();

            await incidentController.raiseIncidentPriority(req, res, next);

            expect(next).toHaveBeenCalled();
            const error = next.mock.calls[0][0];
            expect(error.statusCode).toBe(400);
        });
    });
});