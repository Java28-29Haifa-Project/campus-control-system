import type {CreateIncidentRequest, Incident, IncidentResponse} from "../types/incidentTypes.ts";
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

export const updateIncidentStatusAssignedApi = async (idEngineer: string): Promise<Incident> => {
    return request<Incident>(`/incidents/${idEngineer}/assign`, {
        method: "PATCH",
    });
}
