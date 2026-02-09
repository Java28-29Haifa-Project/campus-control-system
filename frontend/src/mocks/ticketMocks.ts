import {Category, type Ticket, TicketStatus, UserPriority} from "../types/ticketTypes.ts";


// export type MockTicket = {
//     requestId: string;
//     subject: string;
//     description: string;
//     category: string;
//     status: TicketStatus;
//     userReportedPriority: UserPriority;
//     createdAt: string;
//     updatedAt: string;
// };
export const mockTickets: Ticket[] = [
    {
        requestId: "req-1",
        subject: "No Wi-Fi in lecture hall",
        description: "Wi-Fi network is not available in room B204. Students cannot connect during lectures.",
        category: Category.Electrical,
        status: TicketStatus.New,
        userReportedPriority: UserPriority.High,
        createdAt: "2025-01-01T10:25:00Z",
        updatedAt: "2025-02-01T10:25:00Z",
        requestNumber: "",
        userId: ""
    },
    {
        requestId: "req-2",
        subject: "Projector is flickering",
        description: "The projector in auditorium A101 keeps flickering and sometimes turns off completely.",
        category: Category.Plumbing,
        status: TicketStatus.InService,
        userReportedPriority: UserPriority.Medium,
        createdAt: "2025-01-02T09:10:00Z",
        updatedAt: "2025-01-10T09:10:00Z",
        requestNumber: "",
        userId: ""
    },
    {
        requestId: "req-3",
        subject: "Broken chair in library",
        description: "One of the chairs in the quiet zone is broken and unsafe to sit on.",
        category: Category.Infrastructure,
        status: TicketStatus.Done,
        userReportedPriority: UserPriority.Low,
        createdAt: "2025-01-03T12:45:00Z",
        updatedAt: "2025-01-03T12:45:00Z",
        requestNumber: "",
        userId: ""
    },
    {
        requestId: "req-4",
        subject: "Air conditioner too cold",
        description: "In room C310 the AC is set too low, students are freezing during the exams.",
        category: Category.Other,
        status: TicketStatus.Rejected,
        userReportedPriority: UserPriority.Low,
        createdAt: "2025-01-03T12:45:00Z",
        updatedAt: "2025-01-10T09:10:00Z",
        requestNumber: "",
        userId: ""
    },
];