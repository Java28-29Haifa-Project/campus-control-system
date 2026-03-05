import { configureStore } from "@reduxjs/toolkit";

import { authReducer, loginThunk, logoutThunk, registerThunk, verifyTokenThunk } from "../../state/slices/authSlice.ts";
import type { User } from "../../types/authTypes.ts";

import ApiError, { LOGIN_ERROR_MESSAGES } from "../../utils/ApiError.ts";

jest.mock("../../api/authApi.ts", () => ({
    __esModule: true,
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
    refreshToken: jest.fn(),
}));

import {
    register as registerApi,
    login as loginApi,
    logout as logoutApi,
    getCurrentUser,
    refreshToken,
} from "../../api/authApi.ts";

function makeStore(preloadedState?: unknown) {
    return configureStore({
        reducer: { auth: authReducer},
        preloadedState,
    })
}

const user: User = {
    userId: "u1",
    username: "name",
    email: "test@test.com",
    role: "USER"
} as unknown as User;

describe("authSlice reducer (extraReducers)", () => {

    test("registerThunk.pending -> loading + clear error", () => {
        const state = authReducer(undefined, registerThunk.pending("rid", {email: "a", password: "b"} as never));
        expect(state.isLoading).toBe(true);
        expect(state.isVerified).toBe("loading");
        expect(state.error).toBeNull();
    })
    test("registerThunk.pending -> reset auth to logged out", () => {
        const prev = {
            auth : {
                user,
                isAuthenticated: true,
                isVerified: "succeeded",
                isLoading: true,
                error: "x"
            },
        };
        const store = makeStore(prev);
        store.dispatch(registerThunk.fulfilled(user, "rid", { email: "a", password: "b"} as never));
        const s = store.getState().auth;

        expect(s.isLoading).toBe(false);
        expect(s.isAuthenticated).toBe(false);
        expect(s.isVerified).toBe("idle");
        expect(s.user).toBeNull();
        expect(s.error).toBeNull();
    })

        test("registerThunk.rejected -> failed + payload as error", () => {
            const action = registerThunk.rejected(
                new Error("boom"),
                "rid",
                { email: "a", password: "b" } as never,
                "Backend is unavailable"
            );
            const state = authReducer(undefined, action);
            expect(state.isLoading).toBe(false);
            expect(state.isAuthenticated).toBe(false);
            expect(state.isVerified).toBe("failed");
            expect(state.user).toBeNull();
            expect(state.error).toBe("Backend is unavailable");
        });

        test("loginThunk.pending -> loading + clear error", () => {
            const state = authReducer(undefined, loginThunk.pending("rid", { email: "a", password: "b" } as never));
            expect(state.isLoading).toBe(true);
            expect(state.isVerified).toBe("loading");
            expect(state.error).toBeNull();
        });

        test("loginThunk.fulfilled -> authenticated + user", () => {
            const state = authReducer(undefined, loginThunk.fulfilled(user, "rid", { email: "a", password: "b" } as never));
            expect(state.isLoading).toBe(false);
            expect(state.isAuthenticated).toBe(true);
            expect(state.isVerified).toBe("succeeded");
            expect(state.user).toEqual(user);
            expect(state.error).toBeNull();
        });

        test("loginThunk.rejected -> failed + user null", () => {
            const action = loginThunk.rejected(new Error("x"), "rid", { email: "a", password: "b" } as never, "err msg");
            const state = authReducer(undefined, action);
            expect(state.isLoading).toBe(false);
            expect(state.isAuthenticated).toBe(false);
            expect(state.isVerified).toBe("failed");
            expect(state.user).toBeNull();
            expect(state.error).toBe("err msg");
        });

        test("logoutThunk.fulfilled -> reset to logged out state", () => {
            const prevState = {
                user,
                isAuthenticated: true,
                isVerified: "succeeded",
                isLoading: true,
                error: "x",
            };
            const state = authReducer(prevState as never, logoutThunk.fulfilled(undefined, "rid", undefined));
            expect(state).toEqual({
                user: null,
                isAuthenticated: false,
                isVerified: "idle",
                isLoading: false,
                error: null,
            });
        });

        test("logoutThunk.rejected -> reset to logged out state (same as fulfilled)", () => {
            const prevState = {
                user,
                isAuthenticated: true,
                isVerified: "succeeded",
                isLoading: true,
                error: "x",
            };
            const state = authReducer(prevState as never, logoutThunk.rejected(new Error("x"), "rid", undefined, "any"));
            expect(state).toEqual({
                user: null,
                isAuthenticated: false,
                isVerified: "idle",
                isLoading: false,
                error: null,
            });
        });

        test("verifyTokenThunk.pending -> loading + clear error", () => {
            const state = authReducer(undefined, verifyTokenThunk.pending("rid", undefined));
            expect(state.isLoading).toBe(true);
            expect(state.isVerified).toBe("loading");
            expect(state.error).toBeNull();
        });

        test("verifyTokenThunk.fulfilled -> authenticated + user", () => {
            const state = authReducer(undefined, verifyTokenThunk.fulfilled(user, "rid", undefined));
            expect(state.isLoading).toBe(false);
            expect(state.isAuthenticated).toBe(true);
            expect(state.isVerified).toBe("succeeded");
            expect(state.user).toEqual(user);
            expect(state.error).toBeNull();
        });

        test("verifyTokenThunk.rejected with UNAUTHORIZED -> forced logout-ish state + error UNAUTHORIZED", () => {
            const action = verifyTokenThunk.rejected(
                new Error("x"),
                "rid",
                undefined,
                LOGIN_ERROR_MESSAGES.UNAUTHORIZED
            );
            const state = authReducer(
                { user, isAuthenticated: true, isVerified: "loading", isLoading: true, error: null } as never,
                action
            );

            expect(state.user).toBeNull();
            expect(state.isAuthenticated).toBe(false);
            expect(state.isLoading).toBe(false);
            expect(state.isVerified).toBe("failed");
            expect(state.error).toBe(LOGIN_ERROR_MESSAGES.UNAUTHORIZED);
        });

        test("verifyTokenThunk.rejected with other payload -> failed + error payload", () => {
            const action = verifyTokenThunk.rejected(new Error("x"), "rid", undefined, "Backend is unavailable");
            const state = authReducer(undefined, action);
            expect(state.isVerified).toBe("failed");
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe("Backend is unavailable");
        });
    });

    describe("auth thunks (logic + api calls)", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        test("registerThunk -> calls register api and fulfills", async () => {
            (registerApi as jest.Mock).mockResolvedValueOnce(user);
            const store = makeStore();

            const res = await store.dispatch(registerThunk({ email: "a", password: "b" } as never));
            expect(registerApi).toHaveBeenCalledWith({ email: "a", password: "b" });
            expect(registerThunk.fulfilled.match(res)).toBe(true);
        });

        test("registerThunk -> api error -> rejects with 'Backend is unavailable'", async () => {
            (registerApi as jest.Mock).mockRejectedValueOnce(new Error("down"));
            const store = makeStore();

            const res = await store.dispatch(registerThunk({ email: "a", password: "b" } as never));
            expect(registerThunk.rejected.match(res)).toBe(true);
            expect(res.payload).toBe("Backend is unavailable");
        });

        test("loginThunk -> success -> fulfills with user", async () => {
            (loginApi as jest.Mock).mockResolvedValueOnce(user);
            const store = makeStore();

            const res = await store.dispatch(loginThunk({ email: "a", password: "b" } as never));
            expect(loginApi).toHaveBeenCalledWith({ email: "a", password: "b" });
            expect(loginThunk.fulfilled.match(res)).toBe(true);
            expect(res.payload).toEqual(user);
        });

        test("loginThunk -> ApiError with known code -> rejects with mapped message", async () => {
            // known code = ключ, который реально есть в LOGIN_ERROR_MESSAGES
            const err = new ApiError("nope", 400, "UNAUTHORIZED");
            (loginApi as jest.Mock).mockRejectedValueOnce(err);
            const store = makeStore();

            const res = await store.dispatch(loginThunk({ email: "a", password: "b" } as never));

            expect(loginThunk.rejected.match(res)).toBe(true);
            expect(res.payload).toBe(LOGIN_ERROR_MESSAGES.UNAUTHORIZED);
        });

        test("loginThunk -> ApiError status 401 without known code -> UNAUTHORIZED", async () => {
            // code НЕ должен быть в LOGIN_ERROR_MESSAGES, чтобы сработала ветка status===401
            const err = new ApiError("nope", 401, "SOME_UNKNOWN_CODE");
            (loginApi as jest.Mock).mockRejectedValueOnce(err);
            const store = makeStore();

            const res = await store.dispatch(loginThunk({ email: "a", password: "b" } as never));

            expect(loginThunk.rejected.match(res)).toBe(true);
            expect(res.payload).toBe(LOGIN_ERROR_MESSAGES.UNAUTHORIZED);
        });

        test("loginThunk -> ApiError status >=500 -> SERVER_ERROR", async () => {
            // code НЕ должен быть в LOGIN_ERROR_MESSAGES, чтобы сработала ветка status>=500
            const err = new ApiError("boom", 500, "SOME_UNKNOWN_CODE");
            (loginApi as jest.Mock).mockRejectedValueOnce(err);
            const store = makeStore();

            const res = await store.dispatch(loginThunk({ email: "a", password: "b" } as never));

            expect(loginThunk.rejected.match(res)).toBe(true);
            expect(res.payload).toBe(LOGIN_ERROR_MESSAGES.SERVER_ERROR);
        });

        test("loginThunk -> non ApiError -> Backend is unavailable", async () => {
            (loginApi as jest.Mock).mockRejectedValueOnce(new Error("network"));
            const store = makeStore();

            const res = await store.dispatch(loginThunk({ email: "a", password: "b" } as never));

            expect(loginThunk.rejected.match(res)).toBe(true);
            expect(res.payload).toBe("Backend is unavailable");
        });

        test("logoutThunk -> success -> calls logout api", async () => {
            (logoutApi as jest.Mock).mockResolvedValueOnce(undefined);
            const store = makeStore({ auth: { user, isAuthenticated: true, isVerified: "succeeded", isLoading: false, error: null } });

            const res = await store.dispatch(logoutThunk());
            expect(logoutApi).toHaveBeenCalled();
            expect(logoutThunk.fulfilled.match(res)).toBe(true);

            const s = store.getState().auth;
            expect(s.user).toBeNull();
            expect(s.isAuthenticated).toBe(false);
        });

        test("verifyTokenThunk -> getCurrentUser success -> fulfills", async () => {
            (getCurrentUser as jest.Mock).mockResolvedValueOnce(user);
            const store = makeStore();

            const res = await store.dispatch(verifyTokenThunk());
            expect(getCurrentUser).toHaveBeenCalledTimes(1);
            expect(verifyTokenThunk.fulfilled.match(res)).toBe(true);
            expect(res.payload).toEqual(user);
        });

        test("verifyTokenThunk -> 401 then refreshToken then getCurrentUser success -> fulfills", async () => {
            const err401 = new ApiError("unauth", 401, "ANY_CODE");
            (getCurrentUser as jest.Mock)
                .mockRejectedValueOnce(err401)
                .mockResolvedValueOnce(user);
            (refreshToken as jest.Mock).mockResolvedValueOnce(undefined);

            const store = makeStore();
            const res = await store.dispatch(verifyTokenThunk());

            expect(getCurrentUser).toHaveBeenCalledTimes(2);
            expect(refreshToken).toHaveBeenCalledTimes(1);
            expect(verifyTokenThunk.fulfilled.match(res)).toBe(true);
            expect(res.payload).toEqual(user);
        });

        test("verifyTokenThunk -> 401 then refreshToken fails -> rejects with UNAUTHORIZED", async () => {
            const err401 = new ApiError("unauth", 401, "ANY_CODE");
            (getCurrentUser as jest.Mock).mockRejectedValueOnce(err401);
            (refreshToken as jest.Mock).mockRejectedValueOnce(new Error("refresh failed"));

            const store = makeStore();
            const res = await store.dispatch(verifyTokenThunk());

            expect(getCurrentUser).toHaveBeenCalledTimes(1);
            expect(refreshToken).toHaveBeenCalledTimes(1);
            expect(verifyTokenThunk.rejected.match(res)).toBe(true);
            expect(res.payload).toBe(LOGIN_ERROR_MESSAGES.UNAUTHORIZED);
        });

        test("verifyTokenThunk -> ApiError >=500 -> rejects SERVER_ERROR", async () => {
            const err500 = new ApiError("server down", 500, "ANY_CODE");
            (getCurrentUser as jest.Mock).mockRejectedValueOnce(err500);

            const store = makeStore();
            const res = await store.dispatch(verifyTokenThunk());

            expect(verifyTokenThunk.rejected.match(res)).toBe(true);
            expect(res.payload).toBe(LOGIN_ERROR_MESSAGES.SERVER_ERROR);
        });

        test("verifyTokenThunk -> non ApiError -> rejects Backend is unavailable", async () => {
            (getCurrentUser as jest.Mock).mockRejectedValueOnce(new Error("network"));
            const store = makeStore();

            const res = await store.dispatch(verifyTokenThunk());

            expect(verifyTokenThunk.rejected.match(res)).toBe(true);
            expect(res.payload).toBe("Backend is unavailable");
        });
    });









