import { IncidentRepository } from '../services/incidentRepository.js';
import { UpdateStatusInput, Incident, IncidentStatus } from '../types/incident.js';

const ENGINEER_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
    new: ['assigned', 'in_progress'],
    assigned: ['in_progress'],
    in_progress: ['resolved'],
    resolved: ['closed'],
    closed: []
};

const ADMIN_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
    new: ['assigned', 'in_progress'],
    assigned: ['new', 'in_progress'],
    in_progress: ['assigned', 'resolved'],
    resolved: ['in_progress', 'closed'],
    closed: ['resolved']
};

export async function updateStatus(
    repository: IncidentRepository,
    data: UpdateStatusInput & { userRole?: string }
): Promise<{ statusCode: number; body: Incident | { error: string } }> {
    try {
        if (!data.incidentId || !data.status || !data.updatedBy) {
            return {
                statusCode: 400,
                body: { error: 'incidentId, status, and updatedBy required' }
            };
        }

        const incident = await repository.getIncidentById(data.incidentId);
        if (!incident) {
            return { statusCode: 404, body: { error: 'Incident not found' } };
        }

        const isAdmin = data.userRole === 'ADMIN';
        const allowed = isAdmin
            ? ADMIN_TRANSITIONS[incident.status]
            : ENGINEER_TRANSITIONS[incident.status];

        if (!allowed.includes(data.status)) {
            return {
                statusCode: 400,
                body: {
                    error: `Cannot transition from ${incident.status} to ${data.status}. Allowed: ${allowed.join(', ')}`
                }
            };
        }

        const updated = await repository.updateIncidentStatusWithAutoAssign(
            data.incidentId,
            data.status,
            data.updatedBy
        );

        const comments = await repository.getComments(data.incidentId);
        updated.comments = comments;

        console.log('Status updated:', {
            incident: updated.incidentNumber,
            from: incident.status,
            to: data.status,
            role: data.userRole
        });

        return { statusCode: 200, body: updated };
    } catch (error: any) {
        console.error('Update status error:', error);
        return {
            statusCode: 500,
            body: { error: error.message || 'Failed to update status' }
        };
    }
}