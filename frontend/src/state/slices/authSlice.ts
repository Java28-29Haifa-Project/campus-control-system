import type {LoginRequest, User} from "../../types/authTypes";
import {createAsyncThunk, createSlice, type PayloadAction} from "@reduxjs/toolkit";
import {getCurrentUser, login, refreshToken} from "../../api/authApi.ts";
import ApiError, {LOGIN_ERROR_MESSAGES} from "../../utils/ApiError.ts";

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean,
    isVerified: boolean,
    isLoading: boolean,
    error: string | null,
}
const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isVerified: false,
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
                else
                    return rejectWithValue("Unexpected error");
            }
            return rejectWithValue("Backend is unavailable");
        }
    }
);

export const verifyTokenThunk = createAsyncThunk( 
    "auth/verify",
    async (_, { rejectWithValue }) => {
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
                else
                    return rejectWithValue("Unexpected error");
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
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginThunk.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.error = action.payload ?? action.error.message ?? "Unexpected error";
            })
            .addCase(verifyTokenThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(verifyTokenThunk.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.isVerified = true;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(verifyTokenThunk.rejected, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.isVerified = true;
                state.user = null;
            })
    }

})

export const { logout } = authSlice.actions;
export const authReducer = authSlice.reducer;