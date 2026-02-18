import { IncidentRepository } from '../services/incidentRepository.js';

export async function deleteIncident(
    repository: IncidentRepository,
    data: { incidentId: string }
): Promise<{ statusCode: number; body: any }> {
    try {
        if (!data.incidentId) {
            return {
                statusCode: 400,
                body: { error: 'Incident ID is required' }
            };
        }

        const incident = await repository.getIncidentById(data.incidentId);

        if (!incident) {
            return {
                statusCode: 404,
                body: { error: 'Incident not found' }
            };
        }

        await repository.deleteIncident(data.incidentId);

        console.log('Incident deleted:', {
            incidentId: data.incidentId,
            incidentNumber: incident.incidentNumber
        });

        return {
            statusCode: 200,
            body: {
                message: 'Incident deleted successfully',
                incidentId: incident.incidentId,
                incidentNumber: incident.incidentNumber
            }
        };
    } catch (error: any) {
        console.error('Error deleting incident:', error);
        return {
            statusCode: error.statusCode || 500,
            body: { error: error.message || 'Failed to delete incident' }
        };
    }
}