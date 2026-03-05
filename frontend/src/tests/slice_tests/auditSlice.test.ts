import { configureStore } from "@reduxjs/toolkit";

import {
    auditReducer,
    setAuditQuery,
    resetAuditQuery,
    setAuditPage,
    fetchAuditLogsThunk,
    mapAuditErrorCodeToMessage,
} from "../../state/slices/auditSlice";

import { getAuditLogsApi } from "../../api/auditApi";
import ApiError, { AUDIT_ERROR_MESSAGES } from "../../utils/ApiError.ts";

jest.mock("../../api/auditApi", () => ({
    __esModule: true,
    getAuditLogsApi: jest.fn(),
}));

const mockedGetAuditLogsApi = jest.mocked(getAuditLogsApi);

describe("auditSlice reducers", () => {
    test("setAuditQuery merges partial into query", () => {
        const s1 = auditReducer(undefined, { type: "init" } );

        const s2 = auditReducer(s1, setAuditQuery({ entityId: "E1", page: 3 }));

        expect(s2.query.entityId).toBe("E1");
        expect(s2.query.page).toBe(3);
        expect(s2.query.userId).toBe("");
        expect(s2.query.role).toBe("");
    });

    test("resetAuditQuery resets query to initial values", () => {
        const s1 = auditReducer(undefined, { type: "init" } );

        const s2 = auditReducer(
            s1,
            setAuditQuery({
                entityId: "E1",
                userId: "U1",
                role: "ADMIN",
                startDate: "2026-01-01",
                endDate: "2026-02-01",
                page: 99,
            })
        );

        const s3 = auditReducer(s2, resetAuditQuery());

        expect(s3.query).toEqual({
            entityId: "",
            userId: "",
            role: "",
            startDate: "",
            endDate: "",
            page: 1,
        });
    });

    test("setAuditPage updates query.page only", () => {
        const s1 = auditReducer(undefined, { type: "init" });

        const s2 = auditReducer(s1, setAuditQuery({ entityId: "E1" }));
        const s3 = auditReducer(s2, setAuditPage(7));

        expect(s3.query.page).toBe(7);
        expect(s3.query.entityId).toBe("E1");
    });
});

describe("mapAuditErrorCodeToMessage", () => {
    test("returns UNKNOWN when code is missing", () => {
        expect(mapAuditErrorCodeToMessage(undefined)).toBe(AUDIT_ERROR_MESSAGES.UNKNOWN);
        expect(mapAuditErrorCodeToMessage(null)).toBe(AUDIT_ERROR_MESSAGES.UNKNOWN);
        expect(mapAuditErrorCodeToMessage("")).toBe(AUDIT_ERROR_MESSAGES.UNKNOWN);
    });

    test("returns mapped message when code is known", () => {
        expect(mapAuditErrorCodeToMessage("AUDIT_FORBIDDEN")).toBe(
            AUDIT_ERROR_MESSAGES.AUDIT_FORBIDDEN
        );
        expect(mapAuditErrorCodeToMessage("INVALID_DATE_RANGE")).toBe(
            AUDIT_ERROR_MESSAGES.INVALID_DATE_RANGE
        );
    });

    test("returns raw code when it is not in the map", () => {
        expect(mapAuditErrorCodeToMessage("SOME_NEW_CODE")).toBe("SOME_NEW_CODE");
    });
});

describe("fetchAuditLogsThunk + extraReducers", () => {
    const makeStore = () =>
        configureStore({
            reducer: { audit: auditReducer },
        });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("pending sets isLoading=true and clears error", async () => {
        mockedGetAuditLogsApi.mockImplementation(() => new Promise(() => {}) as never);

        const store = makeStore();

        const promise = store.dispatch(
            fetchAuditLogsThunk({
                entityId: "E1",
                userId: "U1",
                role: "",
                startDate: "",
                endDate: "",
                page: 1,
            })
        );

        const state = store.getState().audit;
        expect(state.isLoading).toBe(true);
        expect(state.error).toBeNull();

        void promise; // чтобы не ругался линтер
    });

    test("fulfilled writes logs and pagination; isLoading=false; error stays null", async () => {
        mockedGetAuditLogsApi.mockResolvedValue({
            logs: [{ id: "1" } as never],
            pagination: { page: 1, totalPages: 3 } as never,
        });

        const store = makeStore();

        await store.dispatch(
            fetchAuditLogsThunk({
                entityId: "E1",
                userId: "U1",
                role: "",
                startDate: "",
                endDate: "",
                page: 1,
            })
        );

        const state = store.getState().audit;
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.logs).toEqual([{ id: "1" }]);
        expect(state.pagination).toEqual({ page: 1, totalPages: 3 });
    });

    test("fulfilled defaults logs to [] and pagination to null when missing", async () => {
        mockedGetAuditLogsApi.mockResolvedValue({} as never);

        const store = makeStore();

        await store.dispatch(
            fetchAuditLogsThunk({
                entityId: "E1",
                userId: "U1",
                role: "",
                startDate: "",
                endDate: "",
                page: 1,
            })
        );

        const state = store.getState().audit;
        expect(state.isLoading).toBe(false);
        expect(state.logs).toEqual([]);
        expect(state.pagination).toBeNull();
    });

    test("rejected with ApiError: uses e.code and maps it to message", async () => {
        mockedGetAuditLogsApi.mockRejectedValue(
            new ApiError("forbidden", 403, "AUDIT_FORBIDDEN")
        );

        const store = makeStore();

        await store.dispatch(
            fetchAuditLogsThunk({
                entityId: "E1",
                userId: "U1",
                role: "",
                startDate: "",
                endDate: "",
                page: 1,
            })
        );

        const state = store.getState().audit;
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe(AUDIT_ERROR_MESSAGES.AUDIT_FORBIDDEN);
    });

    test("rejected with ApiError: unknown code returns raw code (because map falls back to code)", async () => {
        mockedGetAuditLogsApi.mockRejectedValue(
            new ApiError("weird", 500, "WEIRD_BACKEND_CODE")
        );

        const store = makeStore();

        await store.dispatch(
            fetchAuditLogsThunk({
                entityId: "E1",
                userId: "U1",
                role: "",
                startDate: "",
                endDate: "",
                page: 1,
            })
        );

        const state = store.getState().audit;
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe("WEIRD_BACKEND_CODE");
    });

    test('rejected with non-ApiError: uses payload "Failed to load audit logs"', async () => {
        mockedGetAuditLogsApi.mockRejectedValue(new Error("network down"));

        const store = makeStore();

        await store.dispatch(
            fetchAuditLogsThunk({
                entityId: "E1",
                userId: "U1",
                role: "",
                startDate: "",
                endDate: "",
                page: 1,
            })
        );

        const state = store.getState().audit;
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe("Failed to load audit logs");
    });
});