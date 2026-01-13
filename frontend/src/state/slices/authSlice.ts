import type {LoginRequest, User} from "../../types/authTypes";
import {createAsyncThunk, createSlice, type PayloadAction} from "@reduxjs/toolkit";
import {login} from "../../api/authApi.ts";

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean,
    isLoading: boolean,
}
const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
}

export const loginThunk = createAsyncThunk <User, LoginRequest>(
    "auth/login",
    async (loginData: LoginRequest, thunkAPI) => {
        try {
            const user = await login(loginData);
            return user;
        } catch (err) {
            console.log("loginThunk error ", err);
            return thunkAPI.rejectWithValue(err);
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
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginThunk.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(loginThunk.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(loginThunk.rejected, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
            })
    }

})

export const { logout } = authSlice.actions;
export const authReducer = authSlice.reducer;