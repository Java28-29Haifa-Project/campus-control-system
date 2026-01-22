import type {Ticket, TicketRequest, TicketResponse} from "../types/ticketTypes.ts";
import {request} from "./client.ts";


export const getTicketsApi = async (): Promise<Ticket[]> => {
    return request<Ticket[]>("/requests");
};

export const getTicketByIdApi = async (id: string): Promise<Ticket> => {
    return request<Ticket>(`/requests/${id}`);
};

export const createTicketApi = async (
    body: TicketRequest,
): Promise<TicketResponse> => {
    return request<TicketResponse>("/requests", {
        method: "POST",
        body,
    });
};
