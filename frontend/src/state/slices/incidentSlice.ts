import {createAsyncThunk} from "@reduxjs/toolkit";
import {type CreateIncidentRequest, type Incident, IncidentStatus} from "../../types/incidentTypes.ts";
import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import ApiError, {INCIDENT_ERROR_MESSAGES} from "../../utils/ApiError.ts";
import {createIncidentApi, getIncidentApi} from "../../api/incidentApi.ts";
import {fetchTicketsThunk} from "./ticketSlice.ts";

const mapIncidentErrorCodeToMessage = (code?: string | null): string => {
    if (!code) {
        return INCIDENT_ERROR_MESSAGES.UNKNOWN;
    }
    if (INCIDENT_ERROR_MESSAGES[code]) {
        return INCIDENT_ERROR_MESSAGES[code];
    }
    return code;
};

export const createIncidentThunk = createAsyncThunk<
    Incident,
    CreateIncidentRequest,
    { rejectValue: string }
>(
    "createIncident",
    async (body, { rejectWithValue }) => {
        try {
            const { incident } = await createIncidentApi(body);
            return incident;
        } catch (e) {
            if (e instanceof ApiError) {
                return rejectWithValue(e.code || "SERVER_ERROR");
            }
            return rejectWithValue("Failed to create incident");
        }
    }
);

export const getIncidentsThunk = createAsyncThunk<
    Incident[],
    void,
    { rejectValue: string }
>(
    "getIncidents",
    async (_, {rejectWithValue}) => {
        try{
            return getIncidentApi();
        } catch (e) {
            if (e instanceof ApiError) {
                return rejectWithValue(e.code || "SERVER_ERROR");
            }
            return rejectWithValue("Failed to load incidents");
        }
    }
)

export interface IncidentState {
    incidents: Incident[];
    currentInc: Incident | null;
    isLoadingIncidents: boolean;
    isLoadingCurrentInc: boolean;
    isCreatingInc: boolean;
    errorInc?: string | null;
    filterStatus: IncidentStatus | "ALL";

    isUpdatingStatusInc: boolean;
    incidentByTicketId: Record<string, string>;

    incidentsSyncing: boolean,
    incidentsLastSyncAt: string | null,
    incidentsSyncError: string | null,
}
const initialState: IncidentState = {
    incidents: [],
    currentInc: null,
    isLoadingIncidents: false,
    isLoadingCurrentInc: false,
    isCreatingInc: false,
    errorInc: null,
    filterStatus: "ALL",

    isUpdatingStatusInc: false,
    incidentByTicketId: {},

    incidentsSyncing: false,
    incidentsLastSyncAt: null as string | null,
    incidentsSyncError: null as string | null,
}

const incidentSlice = createSlice({
    name: "incident",
    initialState,
    reducers: {
        setIncFilterStatus(state, action: PayloadAction<IncidentStatus>) {
            state.filterStatus = action.payload;
        },
        clearCurrentIncident(state) {
            state.currentInc = null;
        },
        linkIncidentToTicketLocal: (
            state,
            action: PayloadAction<{ ticketId: string; incidentId: string }>
        ) => {
            state.incidentByTicketId[action.payload.ticketId] = action.payload.incidentId;
        },
        unlinkIncidentFromTicketLocal: (state, action: PayloadAction<{ ticketId: string }>) => {
            delete state.incidentByTicketId[action.payload.ticketId];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createIncidentThunk.pending, (state) => {
                state.isCreatingInc = true;
                state.errorInc = null;
            })
            .addCase(createIncidentThunk.fulfilled, (state, action) => {
                state.isCreatingInc = false;
                state.incidents.unshift(action.payload);
            })
            .addCase(fetchTicketsThunk.rejected, (state, action) => {
                state.isCreatingInc = false;
                state.errorInc = mapIncidentErrorCodeToMessage(
                    action.payload ?? action.error.message
                );
            })
            .addCase(getIncidentsThunk.pending, (state) => {
                state.isLoadingIncidents = true;
                state.errorInc = null;

                state.incidentsSyncing = true;
                state.incidentsSyncError = null;
            })
            .addCase(getIncidentsThunk.fulfilled, (state, action) => {
                state.isLoadingIncidents = false;
                state.incidents = (action.payload ?? []).filter(Boolean) ;

                state.incidentsSyncing = false;
                state.incidentsLastSyncAt = new Date().toISOString();
            })
            .addCase(getIncidentsThunk.rejected, (state, action) => {
                state.isLoadingIncidents = false;
                state.errorInc = mapIncidentErrorCodeToMessage(
                    action.payload ?? action.error.message
                );

                state.incidentsSyncing = false;
                state.incidentsSyncError = action.error?.message ?? "Incidents sync failed";
            })
    }
});

export const {setIncFilterStatus, clearCurrentIncident, unlinkIncidentFromTicketLocal, linkIncidentToTicketLocal} = incidentSlice.actions;
export const incidentReducer = incidentSlice.reducer;
