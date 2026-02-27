import type {AuditLog, AuditPagination, AuditResponse} from "../types/auditTypes.ts";
import {request} from "../api/client.ts";
import {getAuditLogsApi} from "../api/auditApi.ts";

jest.mock("../api/client.ts", () => ({
    request: jest.fn(),
}));

const mockedRequest = request as jest.Mock;

const fakeAuditLog: AuditLog = {
    _id: "000001",
    action: "test",
    timestamp: "2026-01-01",
};
const fakeAuditPagination: AuditPagination = {
    totalCount: 10,
    totalPages: 10,
    limit: 4,
    page: 2,
}

const fakeResponse: AuditResponse = {
    logs: [fakeAuditLog],
    pagination: fakeAuditPagination,
}

describe("getAuditLogsApi", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    it("should build correct query with all parameters", async () => {
        mockedRequest.mockResolvedValue(fakeResponse);
        await getAuditLogsApi({
            entityId: "123",
            userId: "user1",
            role: "ADMIN",
            startDate: "2026-01-01",
            endDate: "2026-01-31",
            page: 2,
        });
        expect(mockedRequest).toHaveBeenCalledWith(
            "/audit/logs?entityId=123&userId=user1&role=ADMIN&startDate=2026-01-01&endDate=2026-01-31&page=2",
        )
    })

    it("should skip undefined and empty parameters", async () => {
        mockedRequest.mockResolvedValue(fakeResponse);

        await getAuditLogsApi({
            entityId: "",
            userId: undefined,
            role: undefined,
            startDate: undefined,
            endDate: undefined,
            page: undefined,
        })
        expect(mockedRequest).toHaveBeenCalledWith(
            "/audit/logs?page=1",
        )
    })

    it("should use default page = 1 if page not provided", async () => {
        mockedRequest.mockResolvedValue(fakeResponse);

        await getAuditLogsApi({
            entityId: "42",
            userId: undefined,
            role: undefined,
            startDate: undefined,
            endDate: undefined,
            page: undefined,
        });

        expect(mockedRequest).toHaveBeenCalledWith(
            "/audit/logs?entityId=42&page=1"
        );
    })

    it("should use default page = 1 if page not provided", async () => {
        mockedRequest.mockResolvedValue(fakeResponse);

        await getAuditLogsApi({
            entityId: "abc 123",
            userId: undefined,
            role: undefined,
            startDate: undefined,
            endDate: undefined,
            page: undefined,
        });

        expect(mockedRequest).toHaveBeenCalledWith(
            "/audit/logs?entityId=abc%20123&page=1"
        );
    })
})



