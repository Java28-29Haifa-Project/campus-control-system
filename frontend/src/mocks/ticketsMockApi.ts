
import {mockTickets} from "./ticketMocks.ts";
import type {Ticket} from "../types/ticketTypes.ts";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// простая "эмуляция изменений": на каждом запросе обновляем updatedAt одному тикету
let tick = 0;

export async function fetchTicketsMock(): Promise<Ticket[]> {
    await sleep(600); // чтобы в сайдбаре успевало показаться Updating...

    tick++;

    const now = new Date().toISOString();

    // копия массива (важно: не мутировать mockTickets напрямую)
    const data: Ticket[] = mockTickets.map((t) => ({ ...t }));

    // каждые запросы "обновляем" 1 тикет
    const i = tick % data.length;
    data[i] = { ...data[i], updatedAt: now };

    return data;
}
