import {
    type CreateIncidentRequest,
    type Incident,
    type IncidentResponse,
    IncidentStatus
} from "../types/incidentTypes.ts";
import {request} from "./client.ts";


export const getIncidentApi = async (): Promise<Incident[]> => {
    return request<Incident[]>("/incidents");
};

export const getIncidentByIdApi = async (id: string): Promise<Incident> => {
    return request<Incident>(`/incidents/${id}`);
};

export const createIncidentApi = async (
    body: CreateIncidentRequest,
): Promise<IncidentResponse> => {
    return request<IncidentResponse>("/incidents", {
        method: "POST",
        body,
    });
};

export const updateIncidentStatusAssignedApi = async (id: string): Promise<Incident> => {
    return request<Incident>(`/incidents/${id}/assign`, {
        method: "PATCH",
    });
}
export const updateIncidentStatusApi = async (id: string, status: IncidentStatus): Promise<Incident> => {
    return request<Incident>(`/incidents/${id}/status`, {
        method: "PATCH",
        body: status,
    });
}
