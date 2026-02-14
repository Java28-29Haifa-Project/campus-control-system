import {createAsyncThunk, createSlice, type PayloadAction,} from "@reduxjs/toolkit";
import {type Ticket, type TicketRequest, TicketStatus} from "../../types/ticketTypes.ts";
import {createTicketApi, getTicketByIdApi, getTicketsApi, updateTicketApi} from "../../api/ticketApi.ts";
import ApiError, {TICKET_ERROR_MESSAGES} from "../../utils/ApiError.ts";
import {fetchTicketsMock} from "../../mocks/ticketsMockApi.ts";

const mapTicketErrorCodeToMessage = (code?: string | null): string => {
    if (!code) {
        return TICKET_ERROR_MESSAGES.UNKNOWN;
    }
    if (TICKET_ERROR_MESSAGES[code]) {
        return TICKET_ERROR_MESSAGES[code];
    }
    return code;
};

const USE_MOCK_TICKETS = import.meta.env.VITE_USE_MOCK_TICKETS === "true";


export const fetchTicketsThunk = createAsyncThunk<
    Ticket[],
    void,
    { rejectValue: string }
>(
    "tickets",
    async (_, { rejectWithValue }) => {
        try {
            if (USE_MOCK_TICKETS) {
                return await fetchTicketsMock();
            }

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
export const updateTicketThunk = createAsyncThunk<
    Ticket,
    {id: string; updates: Partial<Ticket>},
    { rejectValue: string }
>(
    "updateTicket",
    async ({id, updates}, {rejectWithValue}) => {
        try {
            return await updateTicketApi(id, updates);
        } catch (e) {
            if (e instanceof ApiError) {
                return rejectWithValue(e.code || "SERVER_ERROR");
            }
            return rejectWithValue("Failed to update ticket");
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
    filterStatus: TicketStatus  | "ALL";

    isUpdating: boolean;

    ticketsSyncing: boolean;
    ticketsLastSyncAt: string | null;
    ticketsSyncError: string | null;
}

const initialState: TicketState = {
    items: [],
    current: null,
    isLoadingList: false,
    isLoadingCurrent: false,
    isCreating: false,
    error: null,
    filterStatus: "ALL",

    isUpdating: false,

    ticketsSyncing: false,
    ticketsLastSyncAt: null as string | null,
    ticketsSyncError: null as string | null,
};

const ticketSlice = createSlice({
    name: "ticket",
    initialState,
    reducers: {
        setFilterStatus(state, action: PayloadAction<TicketStatus>) {
            state.filterStatus = action.payload;
        },
        clearCurrentTicket(state) {
            state.current = null;
        },
        // attachIncidentToTicket: (state, action: PayloadAction<{ ticketId: string; incidentId: string }>) => {
        //     const { ticketId, incidentId } = action.payload;
        //
        //     const t = state.items.find((x) => x.requestId === ticketId);
        //     if (t) t.incidentId = incidentId;
        //
        //     if (state.current?.requestId === ticketId) {
        //         state.current.incidentId = incidentId;
        //     }
        // }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTicketsThunk.pending, (state) => {
                state.isLoadingList = true;
                state.error = null;

                state.ticketsSyncing = true;
                state.ticketsSyncError = null;
            })
            .addCase(fetchTicketsThunk.fulfilled, (state, action) => {
                state.isLoadingList = false;
                state.items = action.payload;
                // const prevById = new Map(state.items.map(t => [t.requestId, t]));
                //
                // state.items = (action.payload ?? [])
                //     .filter(Boolean)
                //     .map((t) => {
                //         const prev = prevById.get(t.requestId);
                //         return {
                //             ...t,
                //             incidentId: t.incidentId ?? prev?.incidentId,
                //         };
                //     });

                state.ticketsSyncing = false;
                state.ticketsLastSyncAt = new Date().toISOString();
            })
            .addCase(fetchTicketsThunk.rejected, (state, action) => {
                state.isLoadingList = false;
                state.error = mapTicketErrorCodeToMessage(
                    action.payload ?? action.error.message
                );

                state.ticketsSyncing = false;
                state.ticketsSyncError = action.error?.message ?? "Tickets sync failed";
            })
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
            })
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
            })
            .addCase(updateTicketThunk.pending, (state) => {
                state.isUpdating = true;
                state.error = null;
            })
            .addCase(updateTicketThunk.fulfilled, (state, action) => {
                state.isUpdating = false;
                const patch = action.payload;

                const index = state.items.findIndex(
                    (t) => t.requestId === patch.requestId
                );
                if(index !== -1) {
                    state.items[index] = {
                        ...state.items[index],
                        ...patch,
                    };
                }

                if(state.current && (state.current.requestId === patch.requestId)) {
                    state.current = {
                        ...state.current,
                        ...patch,
                    };
                }
            })
            .addCase(updateTicketThunk.rejected, (state, action) => {
                state.isUpdating = false;
                state.error = mapTicketErrorCodeToMessage(
                    action.payload ?? action.error.message
                );
            });
    }
});

export const { setFilterStatus, clearCurrentTicket } = ticketSlice.actions;
export const ticketReducer = ticketSlice.reducer;
