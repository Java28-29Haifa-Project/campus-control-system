import { IncidentRepository } from '../services/incidentRepository.js';
import { canRaisePriority } from '../services/priorityCalculator.js';
import { UpdatePriorityInput, Incident } from '../types/incident.js';

export async function updatePriority(
    repository: IncidentRepository,
    data: UpdatePriorityInput
): Promise<{ statusCode: number; body: Incident }> {
    try {
        if (!data.incidentId || data.priority === undefined || !data.updatedBy) {
            return {
                statusCode: 400,
                body: { error: 'Incident ID, priority, and updatedBy are required' } as any
            };
        }

        const currentIncident = await repository.getIncidentById(data.incidentId);

        if (!currentIncident) {
            return {
                statusCode: 404,
                body: { error: 'Incident not found' } as any
            };
        }

        if (!canRaisePriority(currentIncident.priority, data.priority)) {
            return {
                statusCode: 400,
                body: {
                    error: `Cannot change priority from ${currentIncident.priority} to ${data.priority}. Priority can only be raised (4→3→2→1).`
                } as any
            };
        }

        const incident = await repository.updatePriority(
            data.incidentId,
            data.priority,
            data.updatedBy
        );

        const comments = await repository.getComments(data.incidentId);
        incident.comments = comments;

        console.log('Incident priority raised:', {
            incidentId: incident.incidentId,
            oldPriority: currentIncident.priority,
            newPriority: data.priority,
            updatedBy: data.updatedBy
        });

        return {
            statusCode: 200,
            body: incident
        };
    } catch (error: any) {
        console.error('Error updating incident priority:', error);

        if (error.message === 'Incident not found') {
            return {
                statusCode: 404,
                body: { error: 'Incident not found' } as any
            };
        }

        return {
            statusCode: error.statusCode || 500,
            body: { error: error.message || 'Failed to update incident priority' } as any
        };
    }
}