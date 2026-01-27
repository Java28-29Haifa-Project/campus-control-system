import type {LoginRequest, User} from "../../types/authTypes";
import {createAsyncThunk, createSlice, type PayloadAction} from "@reduxjs/toolkit";
import {getCurrentUser, login, refreshToken} from "../../api/authApi.ts";
import ApiError, {LOGIN_ERROR_MESSAGES} from "../../utils/ApiError.ts";
import {mockLoginUser, mockUser} from "../../../mocks/authMocks.ts";

const isMockAuth = import.meta.env.VITE_MOCK_AUTH === 'true';

export type AuthStatus = "idle" | "loading" | "succeeded" | "failed";

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean,
    isVerified: AuthStatus,
    isLoading: boolean,
    error: string | null,
}

const initialState: AuthState = {
    user: isMockAuth? mockUser : null,
    isAuthenticated: isMockAuth,
    isVerified: isMockAuth ? "succeeded" : "idle",
    isLoading: false,
    error: null,
}

export const loginThunk = createAsyncThunk <
    User,
    LoginRequest,
    { rejectValue: string }
>(
    "auth/login",
    async (loginData: LoginRequest, { rejectWithValue }) => {
        //TODO delete mocks
        if (isMockAuth) {
            const { email, password } = loginData;

            if (!email || !password) {
                return rejectWithValue("Email & password required (mock)");
            }
            if (email !== mockLoginUser.email || password !== mockLoginUser.password) {
                return rejectWithValue("Invalid mock credentials");
            }

            return mockUser;
        }
        try {
            return await login(loginData);
        } catch (err) {
            console.log("loginThunk error ", err);

            if( err instanceof ApiError) {
                const messageFromCode = LOGIN_ERROR_MESSAGES[err.code];
                if (messageFromCode) {
                    return rejectWithValue(messageFromCode);
                }
                if(err.status === 401) {
                    return rejectWithValue(LOGIN_ERROR_MESSAGES.UNAUTHORIZED);
                }
                else if(err.status >= 500) {
                    return rejectWithValue(LOGIN_ERROR_MESSAGES.SERVER_ERROR);
                }
            }
            return rejectWithValue("Backend is unavailable");
        }
    }
);

export const verifyTokenThunk = createAsyncThunk<
    User,
    void,
    { rejectValue: string }
>(
    "auth/verify",
    async (_, { rejectWithValue }) => {
        //TODO delete mocks
        if (isMockAuth) {
            console.log("verifyTokenThunk: mock mode, returning mockUser");
            return mockUser;
        }
        try {
            return await getCurrentUser();
        } catch (err) {
            console.log("verifyTokenThunk error ", err);

            if( err instanceof ApiError){
                if (err.status === 401){
                    try {
                        await refreshToken();
                        return await getCurrentUser();
                    } catch (e) {
                        console.log("verifyTokenThunk error after refresh", e);
                        return rejectWithValue(LOGIN_ERROR_MESSAGES.UNAUTHORIZED);
                    }
                }
                if(err.status >= 500){
                    return rejectWithValue(LOGIN_ERROR_MESSAGES.SERVER_ERROR);
                }
            }
            return rejectWithValue("Backend is unavailable");
        }
    }
)


const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            Object.assign(state, {
                user: null,
                isAuthenticated: false,
                isVerified: "idle" as AuthStatus,
                isLoading: false,
                error: null,
            });
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginThunk.pending, (state) => {
                state.isLoading = true;
                state.isVerified = "loading";
                state.error = null;
            })
            .addCase(loginThunk.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.isVerified = "succeeded";
                state.user = action.payload;
                state.error = null;
            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.isVerified = "failed";
                state.user = null;
                state.error = action.payload ?? action.error.message ?? "Unexpected error";
            })
            .addCase(verifyTokenThunk.pending, (state) => {
                state.isLoading = true;
                state.isVerified = "loading";
                state.error = null;
            })
            .addCase(verifyTokenThunk.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.isVerified = "succeeded";
                state.user = action.payload;
                state.error = null;
            })
            .addCase(verifyTokenThunk.rejected, (state, action) => {
                if((action.payload ?? "") === LOGIN_ERROR_MESSAGES.UNAUTHORIZED) {
                    state.user = null;
                    state.isAuthenticated = false;
                    state.isLoading = false;
                    state.isVerified = "failed";
                    state.error = LOGIN_ERROR_MESSAGES.UNAUTHORIZED;
                }
                state.isVerified = "failed";
                state.isLoading = false;
                state.error = action.payload ?? action.error.message ?? null;
            })
    }
})
export const { logout } = authSlice.actions;
export const authReducer = authSlice.reducer;