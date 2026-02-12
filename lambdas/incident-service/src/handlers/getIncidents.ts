import { IncidentRepository } from '../services/incidentRepository.js';
import { GetIncidentsFilters, Incident } from '../types/incident.js';

export async function getIncidents(
    repository: IncidentRepository,
    data: { filters?: GetIncidentsFilters }
): Promise<{ statusCode: number; body: Incident[] }> {
    try {
        const incidents = await repository.getIncidents(data.filters || {});

        const incidentsWithComments = await Promise.all(
            incidents.map(async (incident) => {
                const comments = await repository.getComments(incident.incidentId);
                return { ...incident, comments };
            })
        );

        console.log('Incidents retrieved:', {
            count: incidentsWithComments.length,
            filters: data.filters
        });

        return {
            statusCode: 200,
            body: incidentsWithComments
        };
    } catch (error: any) {
        console.error('Error getting incidents:', error);
        return {
            statusCode: error.statusCode || 500,
            body: { error: error.message || 'Failed to get incidents' } as any
        };
    }
}