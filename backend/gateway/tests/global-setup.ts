export default async function globalSetup() {
    console.log('\n Starting Jest Test Suite...\n');

    // Set test environment variables
    process.env.NODE_ENV = 'test';

    // You can add global setup tasks here:
    // - Start test database
    // - Start test Redis instance
    // - Initialize test fixtures

    return Promise.resolve();
}