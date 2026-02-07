import { randomUUID } from 'crypto';
import { IncidentRepository } from '../services/incidentRepository.js';
import { calculatePriority } from '../services/priorityCalculator.js';
import { CreateIncidentInput, Incident } from '../types/incident.js';

export async function createIncident(
    repository: IncidentRepository,
    data: CreateIncidentInput
): Promise<{ statusCode: number; body: Incident }> {
    try {
        // Validate input
        if (!data.ticketIds || data.ticketIds.length === 0) {
            return {
                statusCode: 400,
                body: { error: 'At least one ticket ID is required' } as any
            };
        }

        if (!data.impact || !data.urgency || !data.category) {
            return {
                statusCode: 400,
                body: { error: 'Impact, urgency, and category are required' } as any
            };
        }

        // Calculate priority from impact + urgency
        const priority = calculatePriority(data.impact, data.urgency);

        // Generate incident ID
        const incidentId = randomUUID();

        // Create incident in database
        const incident = await repository.createIncident({
            incidentId,
            ticketIds: data.ticketIds,
            priority,
            status: 'new',
            category: data.category,
            description: data.description,
            createdBy: data.createdBy
        });

        console.log('Incident created:', {
            incidentId: incident.incidentId,
            priority: incident.priority,
            ticketCount: data.ticketIds.length
        });

        return {
            statusCode: 201,
            body: incident
        };
    } catch (error: any) {
        console.error('Error creating incident:', error);
        return {
            statusCode: error.statusCode || 500,
            body: { error: error.message || 'Failed to create incident' } as any
        };
    }
}
