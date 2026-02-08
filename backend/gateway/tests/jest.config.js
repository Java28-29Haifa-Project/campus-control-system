/** @type {import('jest').Config} */
export default {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',

    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },

    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                useESM: true,
                tsconfig: {
                    module: 'ESNext',
                    moduleResolution: 'node',
                    esModuleInterop: true,
                },
            },
        ],
    },

    testMatch: [
        '**/tests/**/*.test.ts',
        '**/tests/**/*.spec.ts',
    ],

    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/types/**',
        '!src/data/**',
        '!src/app.ts',
        '!src/server.ts',
    ],

    coverageThresholds: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },

    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

    testTimeout: 10000,

    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,

    verbose: true,

    testPathIgnorePatterns: ['/node_modules/', '/dist/'],

    globalSetup: '<rootDir>/tests/global-setup.ts',
    globalTeardown: '<rootDir>/tests/global-teardown.ts',
};