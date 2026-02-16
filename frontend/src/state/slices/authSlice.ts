import type {LoginData, LoginRequest, User} from "../../types/authTypes";
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {getCurrentUser, login, logout, refreshToken, register} from "../../api/authApi.ts";
import ApiError, {LOGIN_ERROR_MESSAGES} from "../../utils/ApiError.ts";

import {mockUser} from "../../mocks/authMocks.ts";

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
    user: null,
    isAuthenticated: false,
    isVerified: "idle",
    isLoading: false,
    error: null,
}


export const registerThunk = createAsyncThunk <
    User,
    LoginData,
    { rejectValue: string }
> (
    "auth/register",
    async (loginData: LoginData, {rejectWithValue}) => {
        if (isMockAuth) {
            await new Promise(resolve => setTimeout(resolve, 800));

            return {
                ...mockUser,
                username: loginData.name,
                email: loginData.email
            };
        }

        try{
            return await register(loginData);
        } catch (err){
            console.log("Register failed", err);
            return rejectWithValue("Backend is unavailable");
        }
    }
);


export const loginThunk = createAsyncThunk <
    User,
    LoginRequest,
    { rejectValue: string }
>(
    "auth/login",
    async (loginData: LoginRequest, { rejectWithValue }) => {

        if (isMockAuth) {
            await new Promise(resolve => setTimeout(resolve, 600));


            return mockUser;
        }

        try {
            return await login(loginData);
        } catch (err) {
            console.log("loginThunk error ", err);
            if( err instanceof ApiError) {
                const messageFromCode = LOGIN_ERROR_MESSAGES[err.code];
                if (messageFromCode) return rejectWithValue(messageFromCode);
                if(err.status === 401) return rejectWithValue(LOGIN_ERROR_MESSAGES.UNAUTHORIZED);
                if(err.status >= 500) return rejectWithValue(LOGIN_ERROR_MESSAGES.SERVER_ERROR);
            }
            return rejectWithValue("Backend is unavailable");
        }
    }
);


export const logoutThunk = createAsyncThunk<
    void,
    void,
    {rejectValue: string}
> (
    "auth/logout",
    async (_, { rejectWithValue } ) => {
        if (isMockAuth) return;

        try {
            await logout();
        } catch (err) {
            console.log("logout thunk error ", err);
            return rejectWithValue("Backend is unavailable");
        }
    }
)


export const verifyTokenThunk = createAsyncThunk<
    User,
    void,
    { rejectValue: string }
>(
    "auth/verify",
    async (_, { rejectWithValue }) => {

        if (isMockAuth) {

            return mockUser;
        }

        try {
            return await getCurrentUser();
        } catch (err) {
            if( err instanceof ApiError){
                if (err.status === 401){
                    try {
                        await refreshToken();
                        return await getCurrentUser();
                    } catch {
                        return rejectWithValue(LOGIN_ERROR_MESSAGES.UNAUTHORIZED);
                    }
                }
            }
            return rejectWithValue("Backend is unavailable");
        }
    }
)


const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {

        builder.addCase(registerThunk.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(registerThunk.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload;
            state.error = null;
        });
        builder.addCase(registerThunk.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload ?? "Registration failed";
        });


        builder.addCase(loginThunk.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(loginThunk.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload;
            state.error = null;
        });
        builder.addCase(loginThunk.rejected, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.error = action.payload ?? "Login failed";
        });


        builder.addCase(logoutThunk.fulfilled, (state) => {
            state.user = null;
            state.isAuthenticated = false;
        });


        builder.addCase(verifyTokenThunk.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(verifyTokenThunk.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload;
        });
        builder.addCase(verifyTokenThunk.rejected, (state) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.user = null;
        });
    }
})

export const authReducer = authSlice.reducer;
