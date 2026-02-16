import {mockTickets} from "./ticketMocks.ts";
import type {Ticket} from "../types/ticketTypes.ts";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));


let tick = 0;

export async function fetchTicketsMock(): Promise<Ticket[]> {
    await sleep(600);

    tick++;

    const now = new Date().toISOString();


    const data: Ticket[] = mockTickets.map((t) => ({ ...t }));


    const i = tick % data.length;
    data[i] = { ...data[i], updatedAt: now };

    return data;
}