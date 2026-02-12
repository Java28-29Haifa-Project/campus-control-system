import { getPool } from './utils/db.js';
import { IncidentRepository } from './services/incidentRepository.js';
import { createIncident } from './handlers/createIncident.js';
import { assignIncident } from './handlers/assignIncident.js';
import { updateStatus } from './handlers/updateStatus.js';
import { updatePriority } from './handlers/updatePriority.js';
import { getIncidents } from './handlers/getIncidents.js';
import { getIncidentById } from './handlers/getIncidentById.js';
import { addComment } from './handlers/addComment.js';

export const handler = async (event: any) => {
    console.log('Action received:', event.action);
    console.log('Event data:', JSON.stringify(event.data));

    const pool = getPool();
    const repository = new IncidentRepository(pool);

    try {
        const { action, data } = event;

        switch (action) {
            case 'CREATE_INCIDENT':
                return await createIncident(repository, data);

            case 'ASSIGN_INCIDENT':
                return await assignIncident(repository, data);

            case 'UPDATE_STATUS':
                return await updateStatus(repository, data);

            case 'UPDATE_PRIORITY':
                return await updatePriority(repository, data);

            case 'GET_INCIDENTS':
                return await getIncidents(repository, data);

            case 'GET_INCIDENT_BY_ID':
                return await getIncidentById(repository, data);

            case 'ADD_COMMENT':
                return await addComment(repository, data);

            case 'HEALTH_CHECK':
                return {
                    statusCode: 200,
                    body: {
                        service: 'incident-service',
                        status: 'UP',
                        timestamp: new Date().toISOString()
                    }
                };

            default:
                console.error('Unknown action:', action);
                return {
                    statusCode: 400,
                    body: { error: `Unknown action: ${action}` }
                };
        }
    } catch (error: any) {
        console.error('Lambda handler error:', error);
        return {
            statusCode: 500,
            body: { error: error.message || 'Internal server error' }
        };
    }
};