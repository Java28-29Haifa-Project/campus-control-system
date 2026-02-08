export default async function globalTeardown() {
    console.log('\n Jest Test Suite Complete\n');

    // You can add global cleanup tasks here:
    // - Stop test database
    // - Stop test Redis instance
    // - Clean up test fixtures

    return Promise.resolve();
}