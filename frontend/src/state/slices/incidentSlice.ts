import {createAsyncThunk} from "@reduxjs/toolkit";
import {
    type CommentIncident,
    type CreateIncidentRequest,
    type Incident,
    IncidentStatus
} from "../../types/incidentTypes.ts";
import {createSlice} from "@reduxjs/toolkit";
import ApiError, {INCIDENT_ERROR_MESSAGES} from "../../utils/ApiError.ts";
import {
    addIncidentCommentApi,
    createIncidentApi,
    getIncidentApi, getIncidentByIdApi, updateIncidentPriorityApi,
    updateIncidentStatusApi,
    updateIncidentStatusAssignedApi
} from "../../api/incidentApi.ts";

type FetchSource = "poll" | "manual";

function countNewIncidentsByStatus(list: Incident[]) {
    return list.filter((i) => i.status === IncidentStatus.New).length;
}

const mapIncidentErrorCodeToMessage = (code?: string | null): string => {
    if (!code) {
        return INCIDENT_ERROR_MESSAGES.UNKNOWN;
    }
    if (INCIDENT_ERROR_MESSAGES[code]) {
        return INCIDENT_ERROR_MESSAGES[code];
    }
    return code;
};

const applyIncidentPatch = (state: IncidentState, updated: Partial<Incident> & { incidentId: string }) => {
    const idx = state.incidents.findIndex(i => i.incidentId === updated.incidentId);
    if (idx !== -1) {
        state.incidents[idx] = { ...state.incidents[idx], ...updated };
    }
    if (state.currentInc?.incidentId === updated.incidentId) {
        state.currentInc = { ...state.currentInc, ...updated };
    }
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
export const getIncidentByIdThunk = createAsyncThunk<
    Incident,
    string,
    { rejectValue: string }
>(
    "incidentById",
    async (id, { rejectWithValue }) => {
        try {
            return await getIncidentByIdApi(id);
        } catch (e) {
            if (e instanceof ApiError) {
                return rejectWithValue(e.code || "SERVER_ERROR");
            }
            return rejectWithValue("Failed to load incident");
        }
    }
);

export const getIncidentsThunk = createAsyncThunk<
    Incident[],
    { source: FetchSource } | void,
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

export const updateIncidentAssignedThunk = createAsyncThunk<
    Incident,
    string,
    { rejectValue: string }
>(
    "incident/assign",
    async (id, {rejectWithValue}) => {
        try {
            return await updateIncidentStatusAssignedApi(id);
        } catch (e) {
            if (e instanceof ApiError) {
                return rejectWithValue(e.code || "SERVER_ERROR");
            }
            return rejectWithValue("Failed to assigned incident");
        }
    }
);
export const updateIncidentStatusThunk = createAsyncThunk<
    Incident,
    { id: string; updates: Partial<Incident> },
    { rejectValue: string }
>(
    "incident/status",
    async ({id, updates},  {rejectWithValue}) => {
        try {
            return await updateIncidentStatusApi(id, updates);
        } catch (e) {
            if (e instanceof ApiError) {
                return rejectWithValue(e.code || "SERVER_ERROR");
            }
            return rejectWithValue("Failed to update status incident");
        }
    }
);
export const updateIncidentPriorityThunk = createAsyncThunk<
    Incident,
    { id: string; updates: Partial<Incident> },
    { rejectValue: string }
>(
    "incident/priority",
    async ({id, updates},  {rejectWithValue}) => {
        try {
            return await updateIncidentPriorityApi(id, updates);
        } catch (e) {
            if (e instanceof ApiError) {
                return rejectWithValue(e.code || "SERVER_ERROR");
            }
            return rejectWithValue("Failed to update priority incident");
        }
    }
);
export const addIncidentCommentThunk = createAsyncThunk<
    { incidentId: string; comment: CommentIncident },
    { incidentId: string; commentText: string },
    { rejectValue: string }
>(
    "incident/addComment",
    async ({ incidentId, commentText }, { rejectWithValue }) => {
        try {
            const comment = await addIncidentCommentApi(incidentId, {commentText} );
            return { incidentId, comment };
        } catch (e) {
            if (e instanceof ApiError) {
                return rejectWithValue(
                    mapIncidentErrorCodeToMessage(e.code)
                );
            }
            return rejectWithValue(INCIDENT_ERROR_MESSAGES.UNKNOWN);
        }
    }
);


export interface IncidentState {
    incidents: Incident[];
    currentInc: Incident | null;
    isLoadingIncidents: boolean;
    isLoadingCurrentInc: boolean;
    isCreatingInc: boolean;
    errorInc?: string | null;

    isUpdatingStatusInc: boolean;
    incidentByTicketId: Record<string, string>;

    isAssigned: boolean;

    incidentsSyncing: boolean;
    incidentsLastSyncAt: string | null;
    incidentsSyncError: string | null;
    incidentsNewCount: number;

    addingCommentByIncidentId: Record<string, boolean>
    addCommentErrorByIncidentId: Record<string, string | null>
}
const initialState: IncidentState = {
    incidents: [],
    currentInc: null,
    isLoadingIncidents: false,
    isLoadingCurrentInc: false,
    isCreatingInc: false,
    errorInc: null,

    isUpdatingStatusInc: false,
    incidentByTicketId: {},

    isAssigned: false,

    incidentsSyncing: false,
    incidentsLastSyncAt: null,
    incidentsSyncError: null,
    incidentsNewCount: 0,

    addingCommentByIncidentId: {},
    addCommentErrorByIncidentId: {}
}


const incidentSlice = createSlice({
    name: "incident",
    initialState,
    reducers: {
        clearCurrentIncident(state) {
            state.currentInc = null;
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
            .addCase(createIncidentThunk.rejected, (state, action) => {
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
                const next = action.payload;

                state.incidents = next;
                state.incidentsSyncing = false;
                state.incidentsLastSyncAt = new Date().toISOString();

                state.incidentsNewCount =
                    countNewIncidentsByStatus(next);
            })
            .addCase(getIncidentsThunk.rejected, (state, action) => {
                state.isLoadingIncidents = false;
                state.errorInc = mapIncidentErrorCodeToMessage(
                    action.payload ?? action.error.message
                );

                state.incidentsSyncing = false;
                state.incidentsSyncError = action.error?.message ?? "Incidents sync failed";
            })

            .addCase(getIncidentByIdThunk.pending, (state) => {
                state.isLoadingCurrentInc = true;
                state.errorInc = null;
            })
            .addCase(getIncidentByIdThunk.fulfilled, (state, action) => {
                state.isLoadingCurrentInc = false;
                state.currentInc = action.payload;
            })
            .addCase(getIncidentByIdThunk.rejected, (state, action) => {
                state.isLoadingCurrentInc = false;
                state.errorInc = mapIncidentErrorCodeToMessage(
                    action.payload ?? action.error.message
                );
            })

            .addCase(updateIncidentAssignedThunk.pending, (state) => {
                state.isAssigned = true;
                state.errorInc = null;
            })
            .addCase(updateIncidentAssignedThunk.fulfilled, (state, action) => {
                state.isAssigned = false;
                applyIncidentPatch(state, action.payload);
            })
            .addCase(updateIncidentAssignedThunk.rejected, (state, action) => {
                state.isAssigned = false;
                state.errorInc = mapIncidentErrorCodeToMessage(
                    action.payload ?? action.error.message
                );
            })

            .addCase(updateIncidentStatusThunk.pending, (state) => {
                state.isAssigned = true;
                state.errorInc = null;
            })
            .addCase(updateIncidentStatusThunk.fulfilled, (state, action) => {
                state.isAssigned = false;
                applyIncidentPatch(state, action.payload);
            })
            .addCase(updateIncidentStatusThunk.rejected, (state, action) => {
                state.isAssigned = false;
                state.errorInc = mapIncidentErrorCodeToMessage(
                    action.payload ?? action.error.message
                );
            })

            .addCase(updateIncidentPriorityThunk.pending, (state) => {
                state.isAssigned = true;
                state.errorInc = null;
                })
            .addCase(updateIncidentPriorityThunk.fulfilled, (state, action) => {
                state.isAssigned = false;
                state.isAssigned = false;
                applyIncidentPatch(state, action.payload);
            })
            .addCase(updateIncidentPriorityThunk.rejected, (state, action) => {
                state.isAssigned = false;
                state.errorInc = mapIncidentErrorCodeToMessage(
                    action.payload ?? action.error.message
                );
            })

            .addCase(addIncidentCommentThunk.pending, (state, action) => {
                const id = action.meta.arg.incidentId;
                state.addingCommentByIncidentId[id] = true;
                state.addCommentErrorByIncidentId[id] = null;
            })
            .addCase(addIncidentCommentThunk.fulfilled, (state, action) => {
                const { incidentId, comment } = action.payload;

                state.addingCommentByIncidentId[incidentId] = false;

                const inc = state.incidents.find(i => i.incidentId === incidentId);
                if (!inc) return;

                inc.comment ??= [];
                inc.comment.unshift(comment);
            })
            .addCase(addIncidentCommentThunk.rejected, (state, action) => {
                const id = action.meta.arg.incidentId;
                state.addingCommentByIncidentId[id] = false;
                state.addCommentErrorByIncidentId[id] =
                    action.payload || INCIDENT_ERROR_MESSAGES.UNKNOWN;
            });

    }
});

export const { clearCurrentIncident } = incidentSlice.actions;
export const incidentReducer = incidentSlice.reducer;
