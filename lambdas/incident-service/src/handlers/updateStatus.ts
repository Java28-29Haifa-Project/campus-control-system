import { IncidentRepository } from '../services/incidentRepository.js';
import { UpdateStatusInput, Incident, IncidentStatus } from '../types/incident.js';

const VALID_STATUS_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
    new: ['assigned', 'in_progress'],
    assigned: ['in_progress'],
    in_progress: ['resolved'],
    resolved: ['closed'],
    closed: []
};

export async function updateStatus(
    repository: IncidentRepository,
    data: UpdateStatusInput
): Promise<{ statusCode: number; body: Incident }> {
    try {
        if (!data.incidentId || !data.status || !data.updatedBy) {
            return {
                statusCode: 400,
                body: { error: 'Incident ID, status, and updatedBy are required' } as any
            };
        }

        // Get current incident to check status transition
        const currentIncident = await repository.getIncidentById(data.incidentId);

        if (!currentIncident) {
            return {
                statusCode: 404,
                body: { error: 'Incident not found' } as any
            };
        }

        // Validate status transition (forward only)
        const allowedTransitions = VALID_STATUS_TRANSITIONS[currentIncident.status];
        if (!allowedTransitions.includes(data.status)) {
            return {
                statusCode: 400,
                body: {
                    error: `Cannot transition from ${currentIncident.status} to ${data.status}. Allowed: ${allowedTransitions.join(', ')}`
                } as any
            };
        }

        const incident = await repository.updateIncidentStatus(
            data.incidentId,
            data.status,
            data.updatedBy
        );

        console.log('Incident status updated:', {
            incidentId: incident.incidentId,
            oldStatus: currentIncident.status,
            newStatus: data.status,
            updatedBy: data.updatedBy
        });

        return {
            statusCode: 200,
            body: incident
        };
    } catch (error: any) {
        console.error('Error updating incident status:', error);

        if (error.message === 'Incident not found') {
            return {
                statusCode: 404,
                body: { error: 'Incident not found' } as any
            };
        }

        return {
            statusCode: error.statusCode || 500,
            body: { error: error.message || 'Failed to update incident status' } as any
        };
    }
}
