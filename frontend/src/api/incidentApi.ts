

import type {
    CreateIncidentRequest,
    Incident,
    IncidentResponse,
    IncidentStatus,
    IncidentPriority
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



export const updateIncidentStatusApi = async (id: string, status: IncidentStatus): Promise<Incident> => {
    return request<Incident>(`/incidents/${id}/status`, {
        method: "PATCH",
        body: { status },
    });
};

export const updateIncidentPriorityApi = async (id: string, priority: IncidentPriority): Promise<Incident> => {
    return request<Incident>(`/incidents/${id}/priority`, {
        method: "PATCH",
        body: { priority },
    });
};


export const updateIncidentStatusAssignedApi = async (id: string): Promise<Incident> => {

    return request<Incident>(`/incidents/${id}/assign`, {
        method: "PATCH",
    });
};


export const updateIncidentApi = async (id: string, updates: Partial<Incident>): Promise<Incident> => {
    return request<Incident>(`/incidents/${id}`, {
        method: "PATCH",
        body: updates,
    });
};