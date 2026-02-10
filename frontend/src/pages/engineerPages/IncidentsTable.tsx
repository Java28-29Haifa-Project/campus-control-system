import React, {useCallback, useEffect, useMemo} from "react";
import {useAppDispatch, useAppSelector} from "../../state/hooks.ts";
import {type ColumnDef} from "@tanstack/react-table";
import {type Incident, IncidentStatus} from "../../types/incidentTypes.ts";
import {
    getIncidentsThunk,
    updateIncidentAssignedThunk,
    updateIncidentStatusThunk
} from "../../state/slices/incidentSlice.ts";
import {TableFilters} from "../../components/TableFilters.tsx";
import TableTanStack from "../../components/TableTanStack.tsx";
import {canMoveIncident, isOptionDisabled} from "../../utils/helper.ts";

const STATUS_OPTIONS_INCIDENT: IncidentStatus[] = [
    IncidentStatus.Open,
    IncidentStatus.Assign,
    IncidentStatus.InProgress,
    IncidentStatus.Resolved
];

const IncidentTable:React.FC = () => {

    const { incidents } = useAppSelector((state) => state.incident);

    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(getIncidentsThunk());
    }, [dispatch]);

    const handleStatusChange = useCallback(
        (incident: Incident, nextStatus: IncidentStatus) => {
            const current = incident.status;
            if (nextStatus === current) return;

            if (!canMoveIncident(current, nextStatus)) return;

            if (nextStatus === IncidentStatus.Assign) {
                dispatch(updateIncidentAssignedThunk(incident.incidentId));
                return;
            }

            dispatch(updateIncidentStatusThunk({ id: incident.incidentId, status: nextStatus }));
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
            // {
            //     header: "Ticket's id",
            //     accessorKey: "ticketIds",
            //     cell: ({getValue}) => {
            //         // return getValue() ? getValue() : "-";
            //         const value = (getValue() ?? "") as string;
            //         return value.length > 4 ? "…"  + value.slice(value.length - 5, value.length - 1) : value;
            //     }
            // },
            {
                header: "Description",
                accessorKey: "description",
                minSize: 600,
                cell: ({ getValue }) => {
                    const value = (getValue() ?? "") as string;
                    return value.length > 80 ? value.slice(0, 80) + "…" : value;
                },
            },
            {header: "Category", accessorKey: "category",},
            {
                header: "Priority",
                accessorKey: "priority",
                minSize: 40,
            },
            {
                id: "status",
                accessorKey: "status",
                minSize: 400,
                filterFn: (row, columnId, filterValue) => {
                    if(!filterValue || filterValue === "ALL") return true;
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
                                    disabled={isOptionDisabled(incident.status, s)}
                                >
                                    {s.replace("_", " ")}
                                </option>
                            ))}
                        </select>
                    );
                },
            },
            // {
            //     header: "Created by",
            //     accessorKey: "createdBy",
            //     cell: ({ getValue }) => {
            //         const value = getValue<string | undefined>();
            //         return value ? value : "—";
            //     }
            // },
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
            // {
            //     header: "Updated at",
            //     accessorKey: "updatedAt",
            //     cell: ({ row }) => {
            //         const t = row.original;
            //
            //         if (!t.updatedAt) return "—";
            //         if (t.createdAt && t.updatedAt === t.createdAt) return "—";
            //
            //         return new Date(t.updatedAt).toLocaleString();
            //     },
            // },
            {
                header: "Comment",
                accessorKey: "comment",
                minSize: 600,
                cell: () => "",
            },
        ],
        [handleStatusChange]
    );

    return (
        <TableTanStack
            title="All incidents"
            data={incidents}
            columns={columns}
            renderTopRight={(table)=>(
                <TableFilters table={table} statusOptions={STATUS_OPTIONS_INCIDENT}/>
            )}
            isRowClickable={(row) => row.original.status !== IncidentStatus.Resolved}
            getRowClassName={(row) => (
                row.original.status === IncidentStatus.Resolved ? "row-disabled" : "")}
            // onRowClick={(row) => navigate(`/support/ticket/${row.original.}`)}

        />
    );
};

export default IncidentTable;