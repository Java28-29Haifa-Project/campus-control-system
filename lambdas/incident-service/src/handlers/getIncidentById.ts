import { IncidentRepository } from '../services/incidentRepository.js';
import { Incident } from '../types/incident.js';

export async function getIncidentById(
    repository: IncidentRepository,
    data: { incidentId: string }
): Promise<{ statusCode: number; body: Incident }> {
    try {
        if (!data.incidentId) {
            return {
                statusCode: 400,
                body: { error: 'Incident ID is required' } as any
            };
        }

        const incident = await repository.getIncidentById(data.incidentId);

        if (!incident) {
            return {
                statusCode: 404,
                body: { error: 'Incident not found' } as any
            };
        }

        const comments = await repository.getComments(data.incidentId);
        incident.comments = comments;

        console.log('Incident retrieved:', {
            incidentId: incident.incidentId,
            commentCount: comments.length
        });

        return {
            statusCode: 200,
            body: incident
        };
    } catch (error: any) {
        console.error('Error getting incident:', error);
        return {
            statusCode: error.statusCode || 500,
            body: { error: error.message || 'Failed to get incident' } as any
        };
    }
}