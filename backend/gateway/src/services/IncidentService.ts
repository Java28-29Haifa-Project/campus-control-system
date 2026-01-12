import { Incident, CreateIncidentRequest, UpdateIncidentRequest } from '../types/incident.js';
import { IncidentStatus } from '../types/incident.js';

export interface IncidentService {
    createIncident(request: CreateIncidentRequest): Promise<Incident>;
    getIncident(incidentId: string): Promise<Incident>;
    getIncidents(status?: IncidentStatus): Promise<Incident[]>;
    updateIncident(request: UpdateIncidentRequest): Promise<Partial<Incident>>;
}