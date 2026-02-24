import React, { useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {type Incident, IncidentPriority, IncidentStatus} from "../../types/incidentTypes.ts";
import {useAppDispatch, useAppSelector} from "../../state/hooks.ts";
import {
    getIncidentsThunk,
    updateIncidentAssignedThunk,
    updateIncidentStatusThunk
} from "../../state/slices/incidentSlice.ts";
import {usePolling} from "../../hooks/usePolling.ts";
import type {ColumnDef} from "@tanstack/react-table";
import TableTanStack from "../../components/TableTanStack.tsx";
import {PollingInline} from "../../components/PollingInline.tsx";
import {TableFilters} from "../../components/TableFilters.tsx";

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

export const IncidentAdminTable: React.FC = () => {
    const {
        incidents,
        incidentsSyncing,
        incidentsLastSyncAt,
        incidentsNewCount,
    } = useAppSelector((s) => s.incident);

    const dispatch = useAppDispatch();
    const location = useLocation();

    const enabled = location.pathname.startsWith("/admin/incident");

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

            if (nextStatus === IncidentStatus.Assign) {
                dispatch(updateIncidentAssignedThunk(incident.incidentId));
                return;
            }

            dispatch(
                updateIncidentStatusThunk({
                    id: incident.incidentId,
                    updates: { status: nextStatus },
                })
            );
        },
        [dispatch]
    );

    // const handlePriorityChange = useCallback(
    //     (incident: Incident, nextPriority: IncidentPriority) => {
    //         const current = incident.priority;
    //         if (nextPriority === current) return;
    //
    //         dispatch(
    //             updateIncidentPriorityThunk({
    //                 id: incident.incidentId,
    //                 updates: { priority: nextPriority },
    //             })
    //         );
    //     },
    //     [dispatch]
    // );

    const handleClose = useCallback(
        (incident: Incident) => {
            if (incident.status === IncidentStatus.Closed) return;

            dispatch(
                updateIncidentStatusThunk({
                    id: incident.incidentId,
                    updates: { status: IncidentStatus.Closed },
                })
            );
        },
        [dispatch]
    );

    const columns = useMemo<ColumnDef<Incident>[]>(
        () => [
            {
                header: "ID",
                accessorKey: "incidentId",
                minSize: 200,
                cell: ({ getValue }) => getValue(),
            },
            {
                header: "ID's Ticket",
                accessorKey: "ticketIds",
                minSize: 200,
                cell: ({ getValue }) => getValue(),
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
            { header: "Category", accessorKey: "category" },

            {
                id: "priority",
                accessorKey: "priority",
                minSize: 200,
                filterFn: (row, columnId, filterValue) => {
                    if (!filterValue || filterValue === "ALL") return true;
                    return row.getValue(columnId) === filterValue;
                },
                cell: ({ getValue }) => getValue(),
                // cell: ({ getValue, row }) => {
                //     const incident = row.original;
                //     const currentPriority = getValue<IncidentPriority>();
                //
                //     return (
                //         <select
                //             className="table-select"
                //             value={currentPriority}
                //             onClick={(e) => e.stopPropagation()}
                //             onChange={(e) => {
                //                 e.stopPropagation();
                //                 const nextPriority = Number(e.target.value) as IncidentPriority;
                //                 handlePriorityChange(incident, nextPriority);
                //             }}
                //         >
                //             {PRIORITY_OPTIONS_INCIDENT.map((p) => (
                //                 <option
                //                     key={p}
                //                     value={p}
                //                 >
                //                     {p}
                //                 </option>
                //             ))}
                //         </select>
                //     );
                // },
            },
            {
                id: "status",
                accessorKey: "status",
                minSize: 200,
                filterFn: (row, columnId, filterValue) => {
                    if (!filterValue || filterValue === "ALL") return true;
                    return row.getValue(columnId) === filterValue;
                },
                cell: ({ getValue, row }) => {
                    const incident = row.original;
                    const currentIncidentStatus = getValue<IncidentStatus>();

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
                                >
                                    {s.replace("_", " ")}
                                </option>
                            ))}
                        </select>
                    );
                },
            },

            {
                id: "adminAction",
                header: "Close",
                minSize: 120,
                cell: ({ row }) => {
                    const incident = row.original;
                    const disabled =
                        incident.status === IncidentStatus.Closed;

                    return (
                        <button
                            className="secondary-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClose(incident);
                            }}
                            disabled={disabled}
                            title={incident.status === IncidentStatus.Closed ? "Already closed" : "Set status to Closed"}
                        >
                            Close incident
                        </button>
                    );
                },
            },

            {
                header: "Assigned by",
                accessorKey: "assignedBy",
                cell: ({ row }) => (row.original.assignedBy ? row.original.assignedBy : "—"),
            },

            {
                header: "Created at",
                accessorKey: "createdAt",
                cell: ({ getValue }) => {
                    const value = getValue<string | undefined>();
                    return value ? new Date(value).toLocaleString() : "—";
                },
            },

            // {
            //     header: "Comments",
            //     accessorKey: "comments",
            //     minSize: 400,
            //     cell: ({ row }) => {
            //         const comments = row.original.comments ?? [];
            //
            //         if (!comments.length) {
            //             return <span className="muted-text">No comments</span>;
            //         }
            //
            //         return (
            //             <div className="comment-list">
            //                 {comments.map((c) => (
            //                     <div key={c.commentId} className="comment-item">
            //                         <div className="comment-text">{c.commentText}</div>
            //
            //                         <div className="comment-meta">
            //                             {c.createdBy} •{" "}
            //                             {c.createdAt
            //                                 ? new Date(c.createdAt).toLocaleString()
            //                                 : "—"}
            //                         </div>
            //                     </div>
            //                 ))}
            //             </div>
            //         );
            //     },
            // }

        ],
        [handleStatusChange, handleClose]
    );

    return (
        <TableTanStack
            title={
                <PollingInline
                    newCount={incidentsNewCount}
                    syncing={incidentsSyncing}
                    lastSyncAt={incidentsLastSyncAt}
                    onRefresh={forceRefresh}
                />
            }
            data={incidents}
            columns={columns}
            renderTopRight={(table) => (
                <TableFilters
                    table={table}
                    statusOptions={STATUS_OPTIONS_INCIDENT}
                    priorityOptions={PRIORITY_OPTIONS_INCIDENT}
                />
            )}

            isRowClickable={() => false}
            getRowClassName={() => ""}
        />
    );
};
export default IncidentAdminTable;
