import { IncidentRepository } from '../services/incidentRepository.js';
import { AssignIncidentInput, Incident } from '../types/incident.js';

export async function assignIncident(
    repository: IncidentRepository,
    data: AssignIncidentInput
): Promise<{ statusCode: number; body: Incident }> {
    try {
        if (!data.incidentId || !data.assignedBy) {
            return {
                statusCode: 400,
                body: { error: 'Incident ID and assignedBy are required' } as any
            };
        }

        const incident = await repository.assignIncident(data.incidentId, data.assignedBy);

        console.log('Incident assigned:', {
            incidentId: incident.incidentId,
            assignedBy: data.assignedBy
        });

        return {
            statusCode: 200,
            body: incident
        };
    } catch (error: any) {
        console.error('Error assigning incident:', error);

        if (error.message === 'Incident not found') {
            return {
                statusCode: 404,
                body: { error: 'Incident not found' } as any
            };
        }

        return {
            statusCode: error.statusCode || 500,
            body: { error: error.message || 'Failed to assign incident' } as any
        };
    }
}
