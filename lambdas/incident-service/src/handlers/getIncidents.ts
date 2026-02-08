import { IncidentRepository } from '../services/incidentRepository.js';
import { GetIncidentsFilters, Incident } from '../types/incident.js';

export async function getIncidents(
    repository: IncidentRepository,
    data: { filters?: GetIncidentsFilters }
): Promise<{ statusCode: number; body: Incident[] }> {
    try {
        const incidents = await repository.getIncidents(data.filters || {});

        console.log('Incidents retrieved:', {
            count: incidents.length,
            filters: data.filters
        });

        return {
            statusCode: 200,
            body: incidents
        };
    } catch (error: any) {
        console.error('Error getting incidents:', error);
        return {
            statusCode: error.statusCode || 500,
            body: { error: error.message || 'Failed to get incidents' } as any
        };
    }
}
