import {TicketStatus} from "../src/types/ticketTypes";

export type MockTicket = {
    requestId: string;
    subject: string;
    description: string;
    category: string;
    status: TicketStatus;
    createdAt: string;
};
export const mockTickets: MockTicket[] = [
    {
        requestId: "req-1",
        subject: "No Wi-Fi in lecture hall",
        description: "Wi-Fi network is not available in room B204. Students cannot connect during lectures.",
        category: "electrical",
        status: TicketStatus.New,
        createdAt: "2025-01-01T10:25:00Z",
    },
    {
        requestId: "req-2",
        subject: "Projector is flickering",
        description: "The projector in auditorium A101 keeps flickering and sometimes turns off completely.",
        category: "plumbing",
        status: TicketStatus.InService,
        createdAt: "2025-01-02T09:10:00Z",
    },
    {
        requestId: "req-3",
        subject: "Broken chair in library",
        description: "One of the chairs in the quiet zone is broken and unsafe to sit on.",
        category: "general",
        status: TicketStatus.Done,
        createdAt: "2025-01-03T12:45:00Z",
    },
    {
        requestId: "req-4",
        subject: "Air conditioner too cold",
        description: "In room C310 the AC is set too low, students are freezing during the exams.",
        category: "general",
        status: TicketStatus.Rejected,
        createdAt: "2025-01-03T12:45:00Z",
    },
];