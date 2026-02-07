import {useAppDispatch, useAppSelector} from "../../state/hooks.ts";
import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable
} from "@tanstack/react-table";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {TicketStatus, type Ticket} from "../../types/ticketTypes.ts";
import "../../styles/tables.css";
import {useNavigate} from "react-router-dom";
import {fetchTicketsThunk, updateTicketThunk} from "../../state/slices/ticketSlice.ts";
import {TicketTableFilters} from "./TicketTableFilters.tsx";


const STATUS_OPTIONS: TicketStatus[] = [
    TicketStatus.New,
    TicketStatus.InService,
    TicketStatus.Rejected,
];

const TicketSupportTable:React.FC = () => {

    const { items } = useAppSelector((state) => state.ticket);

    const { incidentByTicketId } = useAppSelector((s) => s.incident);

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(fetchTicketsThunk());
    }, [dispatch]);

    const getIncidentId = useCallback(
        (ticket: Ticket) => ticket.incidentId ?? incidentByTicketId[ticket.requestId],
        [incidentByTicketId]
    );

    const handleStatusChange = useCallback((ticket: Ticket, newStatus: TicketStatus) => {
        dispatch(
            updateTicketThunk({
                id: ticket.requestId,
                updates: { status: newStatus },
            })
        );
    }, [dispatch]);

    const openTicket = useCallback(
        (ticketId: string) => {
            navigate(`/support/ticket/${ticketId}`);
        },
        [navigate]
    );


    const data = useMemo(() => items, [items]);

    const columns = useMemo<ColumnDef<Ticket>[]>(
        () => [
            {
                header: "ID",
                accessorKey: "requestId",
                cell: ({getValue}) => {
                    const value = (getValue() ?? "") as string;
                    return value.length > 4 ? "…"  + value.slice(value.length - 5, value.length - 1) : value;
                }
            },
            {
                header: "Title",
                accessorKey: "subject",
                cell: ({getValue}) => {
                    const value = (getValue() ?? "") as string;
                    return value;
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
                accessorKey: "userReportedPriority",
            },
            {
                id: "status",
                accessorKey: "status",
                minSize: 400,
                filterFn: (row, columnId, filterValue) => {
                    if(!filterValue || filterValue === "ALL") return true;
                    return row.getValue(columnId) === filterValue;
                },
                header: ({ column }) => (
                    <div className="th-status">
                        <span>Status</span>

                        <select
                            className="th-status__filter"
                            value={(column.getFilterValue() as string) ?? "ALL"}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => column.setFilterValue(e.target.value)}
                        >
                            <option value="ALL">All</option>
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                    {s.replace("_", " ")}
                                </option>
                            ))}
                        </select>
                    </div>
                ),
                cell: ({ row, getValue }) => {
                    const ticket = row.original;
                    const current = getValue<TicketStatus>();

                    const incId = getIncidentId(ticket);
                    const lockedByIncident = Boolean(incId);
                    // const lockedByIncident = Boolean(ticket.incidentId);

                    return (
                        <select
                            className="table-select"
                            value={current}
                            disabled={lockedByIncident}
                            title={lockedByIncident ? `Locked: incident ${incId}` : undefined}
                            // title={lockedByIncident ? "Status locked: incident already created" : undefined}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                                e.stopPropagation();
                                if (lockedByIncident) return;

                                const nextStatus = e.target.value as TicketStatus;
                                if (nextStatus === ticket.status) return;
                                handleStatusChange(ticket, nextStatus);
                            }}
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                    {s.replace("_", " ")}
                                </option>
                            ))}
                        </select>
                    );
                },
            },
            {
                header: "Incident",
                id: "incident",
                size:150,
                cell: ({ row }) => {
                    const ticket = row.original;

                    // if (ticket.incidentId) {
                    //     return <span className="muted-text" style={{color:"#BF863C"}}>Incident {ticket.incidentId} created</span>;
                    // }
                    const incId = getIncidentId(ticket);

                    if (incId) {
                        return <span className="muted-text">Created</span>;
                    }

                    if (ticket.status === TicketStatus.New) {
                        return <span className="muted-text">Need change status</span>;
                    }
                    if (ticket.status === TicketStatus.Rejected) {
                        return <span className="muted-text">Ticket rejected</span>;
                    }
                    if (ticket.status === TicketStatus.Done) {
                        return <span className="muted-text">Ticket done</span>;
                    }

                    return (
                        <button
                            className="secondary-btn table-btn"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigate(`/incident/new/${ticket.requestId}`);
                            }}
                        >
                            Create incident
                        </button>
                    );
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
        ],
        [navigate, handleStatusChange]
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { columnFilters },
        onColumnFiltersChange: setColumnFilters,
        columnResizeMode: "onChange",
    })

    return (
        <div className="support-table-page">

            <div className="support-table-header">
                <h1 className="support-table-title">All tickets</h1>

                <TicketTableFilters
                    table={table}
                    statusOptions={STATUS_OPTIONS}
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
                            className={`table-row-clickable ${
                                row.original.status === TicketStatus.Rejected
                                    ? "row-disabled"
                                    : ""
                            }`}
                            onClick={() => {
                            const ticket = row.original;

                            if (ticket.status === TicketStatus.Rejected) return;

                            openTicket(ticket.requestId);
                        }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                const ticket = row.original;

                                if (ticket.status === TicketStatus.Rejected) return;

                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    openTicket(ticket.requestId);
                                }
                            }}

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

export default TicketSupportTable;