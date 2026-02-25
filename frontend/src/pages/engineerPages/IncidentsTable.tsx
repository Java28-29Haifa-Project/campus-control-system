import React, {useCallback, useMemo} from "react";
import {useAppDispatch, useAppSelector} from "../../state/hooks.ts";
import {type ColumnDef} from "@tanstack/react-table";
import {type Incident, IncidentPriority, IncidentStatus} from "../../types/incidentTypes.ts";
import {
    getIncidentsThunk,
    updateIncidentAssignedThunk, updateIncidentPriorityThunk,
    updateIncidentStatusThunk
} from "../../state/slices/incidentSlice.ts";
import {TableFilters} from "../../components/TableFilters.tsx";
import TableTanStack from "../../components/TableTanStack.tsx";
import {
    canMoveByRank,
    INCIDENT_PRIORITY_ORDER,
    INCIDENT_STATUS_ORDER,
    isOptionDisabledByRank
} from "../../utils/helper.ts";
import {useLocation, useNavigate} from "react-router-dom";
import {usePolling} from "../../hooks/usePolling.ts";
import {PollingInline} from "../../components/PollingInline.tsx";
import {CommentCell} from "../../components/CommentCell.tsx";

const STATUS_OPTIONS_INCIDENT: IncidentStatus[] = [
    IncidentStatus.New,
    IncidentStatus.Assign,
    IncidentStatus.InProgress,
    IncidentStatus.Resolved,
    IncidentStatus.Closed,
];
const PRIORITY_OPTIONS_INCIDENT: IncidentPriority[] = [
    IncidentPriority.P1,
    IncidentPriority.P2,
    IncidentPriority.P3,
    IncidentPriority.P4,
];

const POLL_MS = 60_000;

const IncidentTable:React.FC = () => {

    const { incidents, incidentsSyncing, incidentsLastSyncAt, incidentsNewCount } = useAppSelector((s) => s.incident);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const enabled =
        location.pathname.startsWith("/incident");

    const tick = useCallback(() => {
        dispatch(getIncidentsThunk({ source: "poll" }));
    }, [dispatch]);

    usePolling({
        enabled,
        intervalMs: POLL_MS,
        isSyncing: incidentsSyncing,
        tick,
    });

    const forceRefresh = useCallback(() => {
        dispatch(getIncidentsThunk({ source: "manual" }));
    }, [dispatch]);

    const handleStatusChange = useCallback(
        (incident: Incident, nextStatus: IncidentStatus) => {
            const current = incident.status;

            if (nextStatus === current) return;

            if (!canMoveByRank(INCIDENT_STATUS_ORDER, incident.status, nextStatus)) return;

            if (nextStatus === IncidentStatus.Assign) {
                dispatch(updateIncidentAssignedThunk(incident.incidentId));
                return;
            }

            dispatch(
                updateIncidentStatusThunk({
                    id: incident.incidentId,
                    updates: {status: nextStatus}
                }));
        },
        [dispatch]
    );
    const handlePriorityChange = useCallback(
        (incident: Incident, nextPriority: IncidentPriority) => {
            const current = incident.priority;

            if (nextPriority === current) return;

            if (!canMoveByRank(INCIDENT_PRIORITY_ORDER, incident.priority, nextPriority)) return;

            dispatch(
                updateIncidentPriorityThunk({
                    id: incident.incidentId,
                    updates: {priority: nextPriority}
                }));
        },
        [dispatch]
    );


    const columns = useMemo<ColumnDef<Incident>[]>(
        () => [
            {
                header: "ID",
                accessorKey: "incidentId",
                cell: ({getValue}) => {
                    const value = (getValue() ?? "") as string;
                    return value.length > 4 ? "…"  + value.slice(value.length - 5, value.length - 1) : value;
                }
            },
            {
                header: "Description",
                accessorKey: "description",
                minSize: 400,
                cell: ({ getValue }) => {
                    const value = (getValue() ?? "") as string;
                    return value.length > 80 ? value.slice(0, 80) + "…" : value;
                },
            },
            {header: "Category", accessorKey: "category",},
            {
                id: "priority",
                accessorKey: "priority",
                minSize: 200,
                filterFn: (row, columnId, filterValue) => {
                    if (!filterValue || filterValue === "ALL") return true;
                    return row.getValue(columnId) === filterValue;
                },
                cell: ({ getValue, row }) => {
                    const incident = row.original;
                    const currentPriority = getValue<IncidentPriority>();

                    return (
                        <select
                            className="table-select"
                            value={currentPriority}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                                e.stopPropagation();
                                const nextPriority = Number(e.target.value) as IncidentPriority;
                                handlePriorityChange(incident, nextPriority);
                            }}
                        >
                            {PRIORITY_OPTIONS_INCIDENT.map((p) => (
                                <option
                                    key={p}
                                    value={p}
                                    disabled={isOptionDisabledByRank(
                                        INCIDENT_PRIORITY_ORDER,
                                        incident.priority,
                                        p,
                                    )}
                                >
                                    {p}
                                </option>
                            ))}
                        </select>
                    );
                }
            },
            {
                id: "status",
                accessorKey: "status",
                minSize: 200,
                filterFn: (row, columnId, filterValue) => {
                    if(!filterValue || filterValue === "ALL") return true;
                    return row.getValue(columnId) === filterValue;
                },
                cell: ({ getValue, row }) => {
                    const incident = row.original;
                    const currentIncidentStatus = getValue<IncidentStatus>();

                    if (incident.status === IncidentStatus.Closed) {
                        return <span>{incident.status.replace("_", " ")}</span>;
                    }

                    return (
                        <select
                            className="table-select"
                            value={currentIncidentStatus}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                                e.stopPropagation();
                                const next = e.target.value as IncidentStatus;
                                handleStatusChange(incident, next);
                            }}
                        >
                            {STATUS_OPTIONS_INCIDENT.map((s) => (
                                <option
                                    key={s}
                                    value={s}
                                    disabled={isOptionDisabledByRank(
                                        INCIDENT_STATUS_ORDER,
                                        incident.status,
                                        s,
                                    )}
                                >
                                    {s.replace("_", " ")}
                                </option>
                            ))}
                        </select>
                    );
                },
            },
            {
                header: "Assigned by",
                accessorKey: "assignedBy",
                cell: ({ row }) => {
                    const t = row.original;
                    return t.assignedBy ? t.assignedBy : "—";
                },

            },
            {
                header: "Created at",
                accessorKey: "createdAt",
                cell: ({ getValue }) => {
                    const value = getValue<string | undefined>();
                    return value ? new Date(value).toLocaleString() : "—";
                }
            },
            {
                header: "Comment",
                accessorKey: "comment",
                minSize: 400,
                cell: ({ row }) => <CommentCell incident={row.original} />
            },
        ],
        [handlePriorityChange, handleStatusChange]
    );

    return (
        <TableTanStack<Incident>
            title={
                <>
                    <PollingInline
                        newCount={incidentsNewCount}
                        syncing={incidentsSyncing}
                        lastSyncAt={incidentsLastSyncAt}
                        onRefresh={forceRefresh}
                    />
                </>
            }
            data={incidents}
            columns={columns}
            renderTopRight={(table)=>(
                <TableFilters
                    table={table}
                    statusOptions={STATUS_OPTIONS_INCIDENT}
                    priorityOptions={PRIORITY_OPTIONS_INCIDENT}
                />
            )}
            isRowClickable={(row) => row.original.status !== IncidentStatus.Resolved}
            getRowClassName={(row) => (
                row.original.status === IncidentStatus.Resolved || row.original.status === IncidentStatus.Closed ? "row-disabled" : "")}
            onRowClick={(row) => navigate(`/incident/${row.original.incidentId}`)}

        />
    );
};

export default IncidentTable;