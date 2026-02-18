
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {AdminUser, UserRole} from "../../types/authTypes.ts";
import {changeUserRoleApi, getAllUsersApi} from "../../api/userApi.ts";


type State = {
    items: AdminUser[];
    loading: boolean;
    updatingById: Record<string, boolean>;
    error: string | null;
};

const initialState: State = {
    items: [],
    loading: false,
    updatingById: {},
    error: null,
};

export const fetchAllUsersThunk = createAsyncThunk(
    "userAdmin/fetchAll",
    async () => {
        return await getAllUsersApi();
    }
);

export const changeUserRoleThunk = createAsyncThunk(
    "userAdmin/changeRole",
    async ({ id, role }: { id: string; role: UserRole }) => {
        return await changeUserRoleApi(id, role);
    }
);

const slice = createSlice({
    name: "userAdmin",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllUsersThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAllUsersThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchAllUsersThunk.rejected, (state) => {
                state.loading = false;
            })

            .addCase(changeUserRoleThunk.pending, (state, action) => {
                const id = action.meta.arg.id;
                state.updatingById[id] = true;
            })
            .addCase(changeUserRoleThunk.fulfilled, (state, action) => {
                const updated = action.payload;
                const idx = state.items.findIndex(
                    (u) => u.user_id === updated.user_id
                );
                if (idx !== -1) state.items[idx] = updated;

                state.updatingById[updated.user_id] = false;
            })
            .addCase(changeUserRoleThunk.rejected, (state, action) => {
                const id = action.meta.arg.id;
                state.updatingById[id] = false;
            });
    },
});

export const userReducer = slice.reducer;
