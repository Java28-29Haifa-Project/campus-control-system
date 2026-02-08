import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import {
    IncidentStatus,
    IncidentCategory,
    Impact,
    Urgency,
    IncidentPriority,
    IncidentOutputDTO,
} from '../../src/types/incident.js';
import { AccessTokenPayload } from '../../src/types/jwt.js';

// ==================== Test User Factories ====================

export const createTestUser = (overrides?: Partial<AccessTokenPayload>): AccessTokenPayload => ({
    userId: overrides?.userId || randomUUID(),
    username: overrides?.username || 'testuser',
    email: overrides?.email || 'test@example.com',
    role: overrides?.role || 'USER',
    type: 'access',
    ...overrides,
});

export const createSupportUser = (): AccessTokenPayload => createTestUser({
    userId: 'support_001',
    username: 'support_user',
    email: 'support@test.org',
    role: 'SUPPORT',
});

export const createEngineerUser = (): AccessTokenPayload => createTestUser({
    userId: 'engineer_001',
    username: 'engineer_user',
    email: 'engineer@test.org',
    role: 'ENGINEER',
});

export const createAdminUser = (): AccessTokenPayload => createTestUser({
    userId: 'admin_001',
    username: 'admin_user',
    email: 'admin@test.org',
    role: 'ADMIN',
});

// ==================== JWT Token Factories ====================

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

export const createAccessToken = (user: AccessTokenPayload): string => {
    return jwt.sign(user, JWT_SECRET, { expiresIn: '15m' });
};

export const createExpiredToken = (user: AccessTokenPayload): string => {
    return jwt.sign(user, JWT_SECRET, { expiresIn: '0s' });
};

export const createInvalidToken = (): string => {
    return 'invalid.jwt.token';
};

// ==================== Incident Test Data Factories ====================

export const createTestIncident = (overrides?: Partial<IncidentOutputDTO>): IncidentOutputDTO => ({
    incidentId: overrides?.incidentId || randomUUID(),
    ticketIds: overrides?.ticketIds || [randomUUID(), randomUUID()],
    priority: overrides?.priority || 2,
    status: overrides?.status || IncidentStatus.New,
    category: overrides?.category || IncidentCategory.Network,
    description: overrides?.description || 'Test incident description',
    createdBy: overrides?.createdBy || 'support_001',
    assignedBy: overrides?.assignedBy,
    resolvedBy: overrides?.resolvedBy,
    createdAt: overrides?.createdAt || new Date(),
    updatedAt: overrides?.updatedAt || new Date(),
});

export const createMultipleTestIncidents = (count: number): IncidentOutputDTO[] => {
    return Array.from({ length: count }, (_, i) => createTestIncident({
        incidentId: `incident_${i + 1}`,
        priority: ((i % 4) + 1) as IncidentPriority,
    }));
};

// ==================== Request/Response Mocking ====================

export const mockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    cookies: {},
    user: undefined,
    ...overrides,
});

export const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
};

export const mockNext = (): jest.Mock => jest.fn();

// ==================== Authenticated Request Helpers ====================

export const createAuthenticatedRequest = (
    user: AccessTokenPayload,
    overrides: Partial<Request> = {}
): Partial<Request> => {
    const token = createAccessToken(user);
    return mockRequest({
        user,
        cookies: {
            accessToken: token,
        },
        headers: {
            authorization: `Bearer ${token}`,
        },
        ...overrides,
    });
};

// ==================== Validation Helpers ====================

export const expectHttpError = (
    next: jest.Mock,
    statusCode: number,
    messageContains?: string
) => {
    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toBeDefined();
    expect(error.statusCode).toBe(statusCode);
    if (messageContains) {
        expect(error.message).toContain(messageContains);
    }
};

export const expectSuccessResponse = (
    res: Partial<Response>,
    statusCode: number,
    dataContains?: Record<string, any>
) => {
    expect(res.status).toHaveBeenCalledWith(statusCode);
    expect(res.json).toHaveBeenCalledTimes(1);

    if (dataContains) {
        const responseData = (res.json as jest.Mock).mock.calls[0][0];
        Object.entries(dataContains).forEach(([key, value]) => {
            expect(responseData[key]).toEqual(value);
        });
    }
};

// ==================== Date/Time Helpers ====================

export const freezeTime = (date: Date = new Date('2026-02-08T12:00:00Z')) => {
    jest.useFakeTimers();
    jest.setSystemTime(date);
};

export const unfreezeTime = () => {
    jest.useRealTimers();
};

// ==================== Async Test Helpers ====================

export const waitFor = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

export const flushPromises = (): Promise<void> => {
    return new Promise(resolve => setImmediate(resolve));
};

// ==================== Test Data Collections ====================

export const TEST_TICKET_IDS = [
    '31704c14-8a55-4bfb-b25f-618c7835926f',
    'ea0475c7-826b-4b07-9d19-091f4a75915e',
    '209ff0e2-1551-4065-8e91-c64154d3d1e3',
];

export const VALID_INCIDENT_CREATE_DATA = {
    ticketIds: TEST_TICKET_IDS.slice(0, 2),
    impact: Impact.High,
    urgency: Urgency.High,
    category: IncidentCategory.Network,
    description: 'Test incident',
};

export const INVALID_INCIDENT_DATA = {
    noTickets: {
        ticketIds: [],
        impact: Impact.High,
        urgency: Urgency.High,
        category: IncidentCategory.Network,
    },
    invalidImpact: {
        ticketIds: TEST_TICKET_IDS.slice(0, 1),
        impact: 'invalid' as any,
        urgency: Urgency.High,
        category: IncidentCategory.Network,
    },
    systemCategory: {
        ticketIds: TEST_TICKET_IDS.slice(0, 1),
        impact: Impact.High,
        urgency: Urgency.High,
        category: IncidentCategory.System,
    },
};

// ==================== Status Transition Helpers ====================

export const VALID_STATUS_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
    [IncidentStatus.New]: [IncidentStatus.Assigned],
    [IncidentStatus.Assigned]: [IncidentStatus.InProgress],
    [IncidentStatus.InProgress]: [IncidentStatus.Resolved],
    [IncidentStatus.Resolved]: [IncidentStatus.Closed],
    [IncidentStatus.Closed]: [],
};

export const INVALID_STATUS_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
    [IncidentStatus.New]: [IncidentStatus.InProgress, IncidentStatus.Resolved, IncidentStatus.Closed],
    [IncidentStatus.Assigned]: [IncidentStatus.New, IncidentStatus.Resolved, IncidentStatus.Closed],
    [IncidentStatus.InProgress]: [IncidentStatus.New, IncidentStatus.Assigned, IncidentStatus.Closed],
    [IncidentStatus.Resolved]: [IncidentStatus.New, IncidentStatus.Assigned, IncidentStatus.InProgress],
    [IncidentStatus.Closed]: [IncidentStatus.New, IncidentStatus.Assigned, IncidentStatus.InProgress, IncidentStatus.Resolved],
};

// ==================== Priority Helpers ====================

export const VALID_PRIORITY_RAISES = [
    { from: 4, to: 3 },
    { from: 4, to: 2 },
    { from: 4, to: 1 },
    { from: 3, to: 2 },
    { from: 3, to: 1 },
    { from: 2, to: 1 },
];

export const INVALID_PRIORITY_CHANGES = [
    { from: 1, to: 2 },
    { from: 1, to: 3 },
    { from: 1, to: 4 },
    { from: 2, to: 3 },
    { from: 2, to: 4 },
    { from: 3, to: 4 },
    { from: 1, to: 1 }, // Same priority
];