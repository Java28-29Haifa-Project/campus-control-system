// @ts-nocheck


import { jest } from '@jest/globals';

// ==================== Global Test Setup ====================

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
process.env.REDIS_URL = 'redis://localhost:6379';

// ==================== Mock External Dependencies ====================

// Mock Redis
jest.mock('../src/utils/redis.client.js', () => ({
    redisClient: {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        setex: jest.fn(),
        exists: jest.fn(),
        quit: jest.fn(),
        connect: jest.fn(),
        disconnect: jest.fn(),
        isReady: true,
    },
}));

// Mock Database Client
jest.mock('../src/utils/db.client.js', () => ({
    pool: {
        query: jest.fn(),
        connect: jest.fn(),
        end: jest.fn(),
    },
}));

// Mock Logger to avoid console noise in tests
jest.mock('../src/utils/logger.js', () => ({
    default: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    },
    requestLoggerMiddleware: jest.fn((req, res, next) => next()),
}));

// Mock AWS SDK (if used directly)
jest.mock('@aws-sdk/client-lambda', () => ({
    LambdaClient: jest.fn(),
    InvokeCommand: jest.fn(),
}));

// ==================== Global Test Utilities ====================

// Suppress console errors in tests (optional)
global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
};

// Add custom matchers (if needed)
expect.extend({
    toBeValidDate(received: any) {
        const pass = received instanceof Date && !isNaN(received.getTime());
        return {
            pass,
            message: () => `Expected ${received} to be a valid Date`,
        };
    },
    toBeValidUUID(received: string) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const pass = typeof received === 'string' && uuidRegex.test(received);
        return {
            pass,
            message: () => `Expected ${received} to be a valid UUID v4`,
        };
    },
});

// ==================== Test Cleanup ====================

afterEach(() => {
    jest.clearAllMocks();
});