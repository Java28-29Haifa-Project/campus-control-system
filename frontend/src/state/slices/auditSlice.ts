import {createAsyncThunk, createSlice, type PayloadAction} from "@reduxjs/toolkit";
import { getAuditLogsApi } from "../../api/auditApi";
import type {AuditLog, AuditPagination, AuditQuery, AuditResponse} from "../../types/auditTypes.ts";
import ApiError, {AUDIT_ERROR_MESSAGES} from "../../utils/ApiError.ts";

export const mapAuditErrorCodeToMessage = (
    code?: string | null
): string => {
    if (!code) {
        return AUDIT_ERROR_MESSAGES.UNKNOWN;
    }
    if (AUDIT_ERROR_MESSAGES[code]) {
        return AUDIT_ERROR_MESSAGES[code]
    }
    return code;
};

export const fetchAuditLogsThunk = createAsyncThunk<
    AuditResponse,
    AuditQuery,
    { rejectValue: string }
>(
    "audit/fetchLogs",
    async (query, { rejectWithValue }) => {
        try {
            return await getAuditLogsApi(query);
        } catch (e) {
            if (e instanceof ApiError) {
                return rejectWithValue(e.code || "SERVER_ERROR");
            }
            return rejectWithValue("Failed to load audit logs");
        }
    }
);

type AuditState = {
    logs: AuditLog[];
    pagination: AuditPagination | null;
    query: AuditQuery;

    isLoading: boolean;
    error: string | null;
};

const initialState: AuditState = {
    logs: [],
    pagination: null,
    query: {
        entityId: "",
        userId: "",
        role: "",
        startDate: "",
        endDate: "",
        page: 1,
    },
    isLoading: false,
    error: null,
};

const auditSlice = createSlice({
    name: "audit",
    initialState,
    reducers: {
        setAuditQuery(state, action: PayloadAction<Partial<AuditQuery>>) {
            state.query = { ...state.query, ...action.payload };
        },
        resetAuditQuery(state) {
            state.query = { ...initialState.query };
        },
        setAuditPage(state, action: PayloadAction<number>) {
            state.query.page = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAuditLogsThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAuditLogsThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.logs = action.payload.logs ?? [];
                state.pagination = action.payload.pagination ?? null;
            })
            .addCase(fetchAuditLogsThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = mapAuditErrorCodeToMessage(
                    action.payload ?? action.error.message
                );
            });
    },
});

export const { setAuditQuery, resetAuditQuery, setAuditPage } = auditSlice.actions;
export const auditReducer = auditSlice.reducer;

