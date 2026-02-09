import React, {useEffect, useMemo} from "react";
import {useAppDispatch, useAppSelector} from "../../state/hooks.ts";
import {
    type ColumnDef, flexRender,
    getCoreRowModel,
    useReactTable
} from "@tanstack/react-table";
import {useNavigate} from "react-router-dom";
import {TicketTableFilters} from "../supportPages/TicketTableFilters.tsx";
import {type Incident, IncidentStatus} from "../../types/incidentTypes.ts";
import {getIncidentsThunk} from "../../state/slices/incidentSlice.ts";

const STATUS_OPTIONS_INCIDENT: IncidentStatus[] = [
    IncidentStatus.Open,
    IncidentStatus.InProgress,
    IncidentStatus.Resolved,
    IncidentStatus.Closed,
];

const IncidentTable:React.FC = () => {

    const { incidents } = useAppSelector((state) => state.incident);

    // const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(getIncidentsThunk());
    }, [dispatch]);

    // const handleStatusChange = useCallback((incident: IncidentDetails, newStatus: IncidentStatus) => {
    //     dispatch(
    //         updateTicketThunk({
    //             id: ticket.requestId,
    //             updates: { status: newStatus },
    //         })
    //     );
    // }, [dispatch]);

    // const openTicket = useCallback(
    //     (ticketId: string) => {
    //         navigate(`/support/ticket/${ticketId}`);
    //     },
    //     [navigate]
    // );


    const data = useMemo(() => incidents, [incidents]);

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
                header: "Ticket's id",
                accessorKey: "ticketIds",
                cell: ({getValue}) => {
                    return getValue() ? getValue() : "-";
                    // const value = (getValue() ?? "") as string;
                    // return value.length > 4 ? "…"  + value.slice(value.length - 5, value.length - 1) : value;
                }
            },
            {
                header: "Description",
                accessorKey: "description",
                minSize: 600,
                cell: ({ getValue }) => {
                    const value = (getValue() ?? "") as string;
                    return value.length > 80 ? value.slice(0, 80) + "…" : value;
                },
            },
            {
                header: "Category",
                accessorKey: "category",
            },
            {
                header: "Priority",
                accessorKey: "priority",
            },
            {
                id: "status",
                accessorKey: "status",
                minSize: 400,
                // filterFn: (row, columnId, filterValue) => {
                //     if(!filterValue || filterValue === "ALL") return true;
                //     return row.getValue(columnId) === filterValue;
                // },
                cell: ({ getValue }) => {
                    // const incident = row.original;
                    const current = getValue<IncidentStatus>();

                    // const incId = getIncidentId(ticket);
                    // const lockedByIncident = Boolean(incId);
                    // const lockedByIncident = Boolean(ticket.incidentId);

                    return (
                        <select
                            className="table-select"
                            value={current}
                            // disabled={lockedByIncident}
                            // title={lockedByIncident ? `Locked: incident ${incId}` : undefined}
                            // title={lockedByIncident ? "Status locked: incident already created" : undefined}
                            // onClick={(e) => e.stopPropagation()}
                            // onChange={(e) => {
                            //     e.stopPropagation();
                            //     if (lockedByIncident) return;
                            //
                            //     const nextStatus = e.target.value as TicketStatus;
                            //     if (nextStatus === ticket.status) return;
                            //     handleStatusChange(ticket, nextStatus);
                            // }}
                        >
                            {STATUS_OPTIONS_INCIDENT.map((s) => (
                                <option key={s} value={s}>
                                    {s.replace("_", " ")}
                                </option>
                            ))}
                        </select>
                    );
                },
            },
            {
                header: "Created by",
                accessorKey: "createdBy",
                cell: ({ getValue }) => {
                    const value = getValue<string | undefined>();
                    return value ? value : "—";
                }
            },
            {
                header: "Assigned by",
                accessorKey: "assignedBy",
                cell: ({ row }) => {
                    const t = row.original;

                    if (!t.assignedBy) return "—";
                    if (t.assignedBy && t.assignedBy === t.assignedBy) return "—";

                    return t.assignedBy;
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
                header: "Updated at",
                accessorKey: "updatedAt",
                cell: ({ row }) => {
                    const t = row.original;

                    if (!t.updatedAt) return "—";
                    if (t.createdAt && t.updatedAt === t.createdAt) return "—";

                    return new Date(t.updatedAt).toLocaleString();
                },
            },
            {
                header: "Comment",
                accessorKey: "comment",
                minSize: 200,
                cell: () => "",
            },
        ],
        [navigate]
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        // getFilteredRowModel: getFilteredRowModel(),
        // state: { columnFilters },
        // onColumnFiltersChange: setColumnFilters,
        columnResizeMode: "onChange",
    })

    return (
        <div className="support-table-page">

            <div className="support-table-header">
                <h1 className="support-table-title">All incidents</h1>

                <TicketTableFilters
                    table={table}
                    statusOptions={STATUS_OPTIONS_INCIDENT}
                />
            </div>

            <div className="support-table-container">
                <table className="support-table">
                    <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id} style={{ width: header.getSize()}}>
                                    {header.isPlaceholder? null : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                                    <div
                                        onMouseDown={header.getResizeHandler()}
                                        onTouchStart={header.getResizeHandler()}
                                        className={`resizer ${
                                            header.column.getIsResizing() ? "isResizing" : ""
                                        }`}
                                    />
                                </th>
                            ))}
                        </tr>
                    ))}
                    </thead>

                    <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr
                            key={row.id}
                            // className={`table-row-clickable ${
                            //     row.original.status === TicketStatus.Rejected
                            //         ? "row-disabled"
                            //         : ""
                            // }`}
                            // onClick={() => {
                            //     const ticket = row.original;
                            //
                            //     if (ticket.status === TicketStatus.Rejected) return;
                            //
                            //     openTicket(ticket.requestId);
                            // }}
                            role="button"
                            tabIndex={0}
                            // onKeyDown={(e) => {
                            //     const ticket = row.original;
                            //
                            //     if (ticket.status === TicketStatus.Rejected) return;
                            //
                            //     if (e.key === "Enter" || e.key === " ") {
                            //         e.preventDefault();
                            //         openTicket(ticket.requestId);
                            //     }
                            // }}

                        >
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} style={{width:cell.column.getSize()}}>
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>

            </div>

        </div>
    );
};

export default IncidentTable;