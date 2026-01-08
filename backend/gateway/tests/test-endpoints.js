import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

const endpoints = [
    { method: 'get', url: '/health' },
    { method: 'get', url: '/health/lambdas/request' },
    { method: 'get', url: '/health/lambdas/auth' },
    { method: 'get', url: '/health/lambdas/incident' },
    { method: 'get', url: '/health/lambdas/monitoring' },
    { method: 'get', url: '/health/lambdas/audit' },

    { method: 'post', url: '/auth/login', body: { email: 'email0@test.org', password: 'pass' } },
    { method: 'post', url: '/auth/verify', body: { userId: 'user0' } },

    { method: 'get', url: '/requests' },
    { method: 'get', url: '/requests/req0' },
    { method: 'post', url: '/requests', body: { title: 'Test Request', description: 'Some description' } },
    { method: 'patch', url: '/requests/req0', body: { status: 'IN_PROGRESS' } },

    { method: 'get', url: '/incidents' },
    { method: 'get', url: '/incidents/inc0' },
    { method: 'post', url: '/incidents', body: { ticketIds: ['req0'], impact: 'high', urgency: 'critical', category: 'Network', description: 'Test incident', createdBy: 'user0' } },
    { method: 'patch', url: '/incidents/inc0', body: { status: 'RESOLVED', updatedBy: 'user0' } },

    { method: 'get', url: '/monitoring/logs' },
    { method: 'get', url: '/monitoring/alarms' },

    { method: 'post', url: '/audit', body: { actor: 'user0', action: 'TEST', entityType: 'request', entityId: 'req0', timestamp: new Date().toISOString() } }
];

(async () => {
    for (const ep of endpoints) {
        try {
            const res = await axios({
                method: ep.method,
                url: `${BASE_URL}${ep.url}`,
                data: ep.body || undefined
            });
            console.log(`[OK] ${ep.method.toUpperCase()} ${ep.url} → ${res.status}`);
            console.log(JSON.stringify(res.data, null, 2));
        } catch (err) {
            if (err.response) {
                console.log(`[FAIL] ${ep.method.toUpperCase()} ${ep.url} → ${err.response.status}`);
                console.log(JSON.stringify(err.response.data, null, 2));
            } else {
                console.log(`[ERROR] ${ep.method.toUpperCase()} ${ep.url} → ${err.message}`);
            }
        }
        console.log('----------------------------------------');

    }
})();
