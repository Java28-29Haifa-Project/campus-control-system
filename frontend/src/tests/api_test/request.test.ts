import ApiError from "../../utils/ApiError.ts";
import { request } from "../../api/client.ts";
import { getApiBaseUrl } from "../../utils/getBaseUrl.ts";

jest.mock("../../utils/getBaseUrl.ts", () => ({
    getApiBaseUrl: jest.fn(),
}));



describe("request<T>", () => {
    const BASE = 'https://example.test';
    const PATH = "/ticket/123";

    beforeEach(() => {
        jest.clearAllMocks();
        (getApiBaseUrl as jest.Mock).mockReturnValue(BASE);
    });function makeResponse(params: {
        status: number;
        ok?: boolean;
        json?: unknown;
        text?: string;
    }): Response {
        const {
            status,
            ok = status >= 200 && status < 300,
            json = {},
            text = ""
        } = params;
        return {
            status,
            ok,
            json: async () => json,
            text: async () => text,
        } as Response;
    }

    test("success: do fetch on baseurl+path and return JSON like T", async () => {
        const payload = {id: 123, title: "Hello"};

        const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
        fetchMock.mockResolvedValue(makeResponse({ status: 200, json: payload }))
        global.fetch = fetchMock;

        const promise = request<typeof payload>(PATH);
        await expect(promise).resolves.toEqual(payload);

        expect(fetchMock).toHaveBeenCalledTimes(1);

        const [url, init]=fetchMock.mock.calls[0] as [string, RequestInit];

        expect(url).toBe(BASE + PATH);
        expect(init.method).toBe("GET");
        expect(init.credentials).toBe("include");
    })

    test("POST with body: add Content-Type and JSON.stringify(body)", async () => {
        const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
        fetchMock.mockResolvedValue(makeResponse({ status: 200, json: { ok: true }}));
        global.fetch = fetchMock;

        const body = { a: 1 };

        const promise = request<{ ok: boolean }>(PATH, { method:"POST", body});
        await expect(promise).resolves.toEqual({ ok: true});

        const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(init.method).toBe("POST");
        expect(init.body).toBe(JSON.stringify(body));
        expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
    })

    test("if body undefined: there are NO Content-Type and body", async () => {
        const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
        fetchMock.mockResolvedValue(makeResponse({ status: 200, json: { ok:true}}));
        global.fetch = fetchMock;

        const promise = request<{ ok: boolean }>(PATH, { method: "POST"});
        await expect(promise).resolves.toEqual({ ok: true });

        const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(init.body).toBeUndefined();
        expect(init.headers).not.toHaveProperty("Content-Type");
    })

    test("custom headers are superimposed in the default ones", async () => {
        const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
        fetchMock.mockResolvedValue(makeResponse({ status: 200, json: { ok: true }}));
        global.fetch = fetchMock;

        const promise = request<{ ok: boolean }>(PATH, {
                method: "POST",
                body: { a:1 },
                headers: { Authorization: "Bearer 123" },
            });
        await expect(promise).resolves.toEqual({ ok: true });

        const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(init.headers).toMatchObject({
            "Content-Type": "application/json",
            Authorization: "Bearer 123",
        })
    })

    test("the signal is passing", async () => {
        const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
        fetchMock.mockResolvedValue(makeResponse({ status: 200, json: { ok: true }}));
        global.fetch = fetchMock;

        const controller = new AbortController();

        const promise = request<{ ok: boolean }>(PATH, {
            method: "POST",
            body: { a:1 },
            signal: controller.signal,
        })
        await expect(promise).resolves.toEqual({ ok: true });
        const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(init.signal).toBe(controller.signal);
    })

    test("error 401: ApiError returns UNAUTHORIZED", async () => {
        const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
        fetchMock.mockResolvedValue(makeResponse({ status: 401, ok: false, text: "Token expired" }));
        global.fetch = fetchMock;

        const promise = request<{ ok: boolean }>(PATH);
        await expect(request(PATH)).rejects.toBeInstanceOf(ApiError);
        await expect(promise).rejects.toMatchObject({
            status: 401,
            code: "UNAUTHORIZED",
            message: "Token expired",
        })
    })

    test("error 500: ApiError returns SERVER_ERROR", async () => {
        const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
        fetchMock.mockResolvedValue(makeResponse({ status: 503, ok: false, text: "Server Unavailable" }));
        global.fetch = fetchMock;

        const promise = request<{ ok: boolean }>(PATH);
        await expect(promise).rejects.toBeInstanceOf(ApiError);
        await expect(promise).rejects.toMatchObject({
            status: 503,
            code: "SERVER_ERROR",
            message: "Server Unavailable",
        })
    })

    test("error 400: ApiError returns UNKNOWN", async () => {
        const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
        fetchMock.mockResolvedValue(makeResponse({ status: 400, ok: false, text: "Bad Request" }));
        global.fetch = fetchMock;

        const promise = request<{ ok: boolean }>(PATH);
        await expect(promise).rejects.toBeInstanceOf(ApiError);
        await expect(promise).rejects.toMatchObject({
            status: 400,
            code: "UNKNOWN",
            message: "Bad Request",
        })
    })

    test("network error: ApiError returns BACKEND_UNAVAILABLE", async () => {
        const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
        fetchMock.mockRejectedValue(new TypeError("Network Error"));
        global.fetch = fetchMock;

        const promise = request<{ ok: boolean }>(PATH);
        await expect(promise).rejects.toBeInstanceOf(ApiError);
        await expect(promise).rejects.toMatchObject({
            status: 0,
            code: "BACKEND_UNAVAILABLE",
            message: "Backend is unavailable",
        })
    })

    test("if fetch returns ApiError, catch doesn't returns BACKEND_UNAVAILABLE", async () => {
        const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
        fetchMock.mockResolvedValue(makeResponse({ status: 401, ok: false, text: "No auth" }));
        global.fetch = fetchMock;

        const promise = request<{ ok: boolean }>(PATH);
        await expect(promise).rejects.toBeInstanceOf(ApiError);
        await expect(promise).rejects.toMatchObject({
            status: 401,
            code: "UNAUTHORIZED",
            message: "No auth",
        })
    })
})



