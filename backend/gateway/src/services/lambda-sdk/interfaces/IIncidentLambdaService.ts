export interface IIncidentLambdaService {
    createIncident(input: any): Promise<any>;
    assignIncident(input: any): Promise<any>;
    updateStatus(input: any): Promise<any>;
    updatePriority(input: any): Promise<any>;
    getIncidents(input: any): Promise<any[]>;
    getIncidentById(input: any): Promise<any>;
    addComment(data: {
        incidentId: string;
        commentText: string;
        createdBy: string
    }): Promise<any>;
    healthCheck(): Promise<any>;
}