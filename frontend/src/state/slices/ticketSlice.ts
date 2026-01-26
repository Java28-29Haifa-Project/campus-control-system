import { createSlice, createAsyncThunk, type PayloadAction, } from "@reduxjs/toolkit";
import type {Ticket, TicketRequest, TicketStatus} from "../../types/ticketTypes.ts";
import {createTicketApi, getTicketByIdApi, getTicketsApi} from "../../api/ticketApi.ts";
import ApiError, {TICKET_ERROR_MESSAGES} from "../../utils/ApiError.ts";

const mapTicketErrorCodeToMessage = (code?: string | null): string => {
    if (!code) {
        return TICKET_ERROR_MESSAGES.UNKNOWN;
    }
    if (TICKET_ERROR_MESSAGES[code]) {
        return TICKET_ERROR_MESSAGES[code];
    }
    return code;
};

export const fetchTicketsThunk = createAsyncThunk<
    Ticket[],
    void,
    { rejectValue: string }
>(
    "tickets",
    async (_, { rejectWithValue }) => {
        try {
            return await getTicketsApi();
        } catch (e) {
            if (e instanceof ApiError) {
                return rejectWithValue(e.code || "SERVER_ERROR");
            }
            return rejectWithValue("Failed to load tickets");
        }
    }
);

export const fetchTicketByIdThunk = createAsyncThunk<
    Ticket,
    string,
    { rejectValue: string }
>(
    "ticketById",
    async (id, { rejectWithValue }) => {
        try {
            return await getTicketByIdApi(id);
        } catch (e) {
            if (e instanceof ApiError) {
                return rejectWithValue(e.code || "SERVER_ERROR");
            }
            return rejectWithValue("Failed to load ticket");
        }
    }
);

export const createTicketThunk = createAsyncThunk<
    Ticket,
    TicketRequest,
    { rejectValue: string }
>(
    "createTicket",
    async (body, { rejectWithValue }) => {
        try {
            const { ticket } = await createTicketApi(body);
            return ticket;
        } catch (e) {
            if (e instanceof ApiError) {
                return rejectWithValue(e.code || "SERVER_ERROR");
            }
            return rejectWithValue("Failed to create ticket");
        }
    }
);

export interface TicketState {
    items: Ticket[];
    current: Ticket | null;
    isLoadingList: boolean;
    isLoadingCurrent: boolean;
    isCreating: boolean;
    error?: string | null;
    filterStatus: TicketStatus | "ALL";
}

const initialState: TicketState = {
    items: [],
    current: null,
    isLoadingList: false,
    isLoadingCurrent: false,
    isCreating: false,
    error: null,
    filterStatus: "ALL",
};

const ticketSlice = createSlice({
    name: "ticket",
    initialState,
    reducers: {
        setFilterStatus(state, action: PayloadAction<TicketStatus | "ALL">) {
            state.filterStatus = action.payload;
        },
        clearCurrentTicket(state) {
            state.current = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTicketsThunk.pending, (state) => {
                state.isLoadingList = true;
                state.error = null;
            })
            .addCase(fetchTicketsThunk.fulfilled, (state, action) => {
                state.isLoadingList = false;
                state.items = action.payload;
            })
            .addCase(fetchTicketsThunk.rejected, (state, action) => {
                state.isLoadingList = false;
                state.error = mapTicketErrorCodeToMessage(
                    action.payload ?? action.error.message
                );
            });

        builder
            .addCase(fetchTicketByIdThunk.pending, (state) => {
                state.isLoadingCurrent = true;
                state.error = null;
            })
            .addCase(fetchTicketByIdThunk.fulfilled, (state, action) => {
                state.isLoadingCurrent = false;
                state.current = action.payload;
            })
            .addCase(fetchTicketByIdThunk.rejected, (state, action) => {
                state.isLoadingCurrent = false;
                state.error = mapTicketErrorCodeToMessage(
                    action.payload ?? action.error.message
                );
            });

        builder
            .addCase(createTicketThunk.pending, (state) => {
                state.isCreating = true;
                state.error = null;
            })
            .addCase(createTicketThunk.fulfilled, (state, action) => {
                state.isCreating = false;
                state.items.unshift(action.payload);
            })
            .addCase(createTicketThunk.rejected, (state, action) => {
                state.isCreating = false;
                state.error = mapTicketErrorCodeToMessage(
                    action.payload ?? action.error.message
                );
            });
    }
});

export const { setFilterStatus, clearCurrentTicket } = ticketSlice.actions;
export const ticketReducer = ticketSlice.reducer;
