import {createTicketApi, getTicketByIdApi, getTicketsApi, updateTicketApi} from "../../api/ticketApi.ts"
import {request} from "../../api/client.ts";
import {Category, type Ticket, type TicketRequest, TicketStatus, UserPriority} from "../../types/ticketTypes.ts";

jest.mock("../../api/client.ts", () => ({
    request: jest.fn(),
}));

const fakeTicket: Ticket = {
    requestId: "123",
    requestNumber: "11111",
    userId: "user001",
    subject: "problem",
    status: TicketStatus.New,
    category: Category.Plumbing,
    userReportedPriority: UserPriority.Low,
    createdAt: "01.01.01",
}
const fakeTickets: Ticket[] = [fakeTicket];

const fakeTicketRequest: TicketRequest = {
    subject: "problem",
    category: Category.Plumbing,
    userReportedPriority: UserPriority.Low,
}

const mockedRequest = request as jest.Mock;

describe("Tickets", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("getTicketApi: calls request with correct url", async () => {
        mockedRequest.mockReturnValue(fakeTickets);

        const response = await getTicketsApi();
        expect(mockedRequest).toHaveBeenCalledWith("/requests");
        expect(response).toEqual(fakeTickets)
    })

    test("getTicketByIdApi: calls request with correct url", async () => {
        mockedRequest.mockReturnValue(fakeTicket);

        const response = await getTicketByIdApi("123");
        expect(mockedRequest).toHaveBeenCalledWith("/requests/123");
        expect(response).toEqual(fakeTicket);
    })

    test("createTicketApi: calls request with correct url", async () => {
        mockedRequest.mockReturnValue(fakeTicket);

        const response = await createTicketApi(fakeTicketRequest);
        expect(mockedRequest).toHaveBeenCalledWith("/requests", {
            method: "POST",
            body: fakeTicketRequest,
        });
        expect(response).toEqual(fakeTicket);
    })

    test("updateTicketApi: calls request with correct url", async () => {
        mockedRequest.mockReturnValue({requestId: "123", status: TicketStatus.InService});

        const response = await updateTicketApi("123", {status: TicketStatus.InService});

        expect(mockedRequest).toHaveBeenCalledWith("/requests/123", {
            method: "PATCH",
            body: {status: TicketStatus.InService},
        });
        expect(response).toEqual({requestId: "123", status: TicketStatus.InService});
    })
})