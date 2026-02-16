import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../state/hooks.ts";
import { fetchTicketsThunk, updateTicketThunk } from "../../state/slices/ticketSlice.ts";
import { TicketStatus, type Ticket } from "../../types/ticketTypes.ts";
import { TicketTableFilters } from "./TicketTableFilters.tsx";


import { usePolling } from "../../hooks/usePolling";
import { PollingInline } from "../../components/PollingInline";

import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable
} from "@tanstack/react-table";

import "../../styles/tables.css";

const STATUS_OPTIONS: TicketStatus[] = [
    TicketStatus.New,
    TicketStatus.InService,
    TicketStatus.Rejected,
];

const TicketSupportTable: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();


    const {
        items,
        ticketsSyncing,
        ticketsLastSyncAt,
        error
    } = useAppSelector((state) => state.ticket);

    const { incidentByTicketId } = useAppSelector((state) => state.incident);

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);


    const refreshTickets = useCallback(() => {
        dispatch(fetchTicketsThunk());
    }, [dispatch]);


    useEffect(() => {
        refreshTickets();
    }, [refreshTickets]);


    usePolling({
        enabled: !error,
        intervalMs: 15000,
        isSyncing: ticketsSyncing,
        tick: refreshTickets
    });


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
                    return <span style={{ opacity: 0.7, fontSize: '0.9em' }}>
                        {value.length > 4 ? "…"  + value.slice(value.length - 5) : value}
                    </span>;
                }
            },
            {
                header: "Title",
                accessorKey: "subject",
                cell: ({getValue}) => <span style={{ fontWeight: 600 }}>{getValue() as string}</span>
            },
            {
                header: "Description",
                accessorKey: "description",
                minSize: 300,
                cell: ({ getValue }) => {
                    const value = (getValue() ?? "") as string;
                    return value.length > 60 ? value.slice(0, 60) + "…" : value;
                },
            },
            {
                header: "Category",
                accessorKey: "category",
            },
            {
                header: "Priority",
                accessorKey: "userReportedPriority",
                cell: ({ getValue }) => {
                    const val = getValue() as string;

                    const color = val === 'High' || val === 'Critical' ? '#ff6b6b' : 'inherit';
                    return <span style={{ color, fontWeight: 500 }}>{val}</span>
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
                cell: ({ row, getValue }) => {
                    const ticket = row.original;
                    const current = getValue<TicketStatus>();
                    const incId = getIncidentId(ticket);
                    const lockedByIncident = Boolean(incId);

                    return (
                        <select
                            className="table-select"
                            value={current}
                            disabled={lockedByIncident}
                            title={lockedByIncident ? `Locked: incident ${incId}` : undefined}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                                e.stopPropagation();
                                if (lockedByIncident) return;
                                const nextStatus = e.target.value as TicketStatus;
                                if (nextStatus === ticket.status) return;
                                handleStatusChange(ticket, nextStatus);
                            }}
                            style={{
                                cursor: lockedByIncident ? "not-allowed" : "pointer",
                                opacity: lockedByIncident ? 0.6 : 1,

                                background: "rgba(0,0,0,0.2)",
                                border: "1px solid rgba(255,255,255,0.2)",
                                color: "inherit",
                                borderRadius: "6px",
                                padding: "4px 8px"
                            }}
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s} style={{color: "black"}}>
                                    {s.replace("_", " ")}
                                </option>
                            ))}
                        </select>
                    );
                },
            },
            {
                header: "Action",
                id: "incident",
                size: 150,
                cell: ({ row }) => {
                    const ticket = row.original;
                    const incId = getIncidentId(ticket);

                    if (incId) {
                        return <span className="muted-text" style={{ fontSize: '0.85em' }}>In Progress</span>;
                    }
                    if (ticket.status === TicketStatus.New) {
                        return <span className="muted-text" style={{ fontSize: '0.85em' }}>New</span>;
                    }
                    if (ticket.status === TicketStatus.Rejected) {
                        return <span className="muted-text" style={{ fontSize: '0.85em' }}>Rejected</span>;
                    }
                    if (ticket.status === TicketStatus.Done) {
                        return <span className="muted-text" style={{ fontSize: '0.85em' }}>Done</span>;
                    }

                    return (
                        <button
                            className="secondary-btn table-btn"
                            style={{

                                background: "rgba(230, 173, 62, 0.2)",
                                border: "1px solid #e6ad3e",
                                color: "#e6ad3e",
                                padding: "4px 10px",
                                fontSize: "12px",
                                borderRadius: "20px",
                                transition: "all 0.2s"
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = "#e6ad3e";
                                e.currentTarget.style.color = "#fff";
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = "rgba(230, 173, 62, 0.2)";
                                e.currentTarget.style.color = "#e6ad3e";
                            }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigate(`/incident/new/${ticket.requestId}`);
                            }}
                        >
                            Create Incident
                        </button>
                    );
                },
            },
            {
                header: "Date",
                accessorKey: "createdAt",
                cell: ({ getValue }) => {
                    const value = getValue<string | undefined>();
                    return value ? new Date(value).toLocaleDateString() : "—";
                }
            },
        ],
        [getIncidentId, handleStatusChange, navigate]
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
        <div className="support-table-page" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>


            <div className="support-table-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h1 className="support-table-title" style={{ margin: 0, fontSize: '1.8rem' }}>Support Console</h1>
                    <TicketTableFilters
                        table={table}
                        statusOptions={STATUS_OPTIONS}
                    />
                </div>


                <PollingInline
                    syncing={ticketsSyncing}
                    lastSyncAt={ticketsLastSyncAt}
                    onRefresh={refreshTickets}
                    newCount={0}
                />
            </div>


            <div className="support-table-container" style={{
                flex: 1,
                overflow: 'auto',
                background: "rgba(255,255,255,0.05)",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)"
            }}>
                <table className="support-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ position: "sticky", top: 0, background: "rgba(0,0,0,0.3)", zIndex: 10 }}>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id} style={{
                                    width: header.getSize(),
                                    padding: "16px",
                                    textAlign: "left",
                                    color: "rgba(255,255,255,0.7)",
                                    fontSize: "0.85rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "1px"
                                }}>
                                    {header.isPlaceholder? null : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
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
                            style={{
                                borderBottom: "1px solid rgba(255,255,255,0.05)",
                                cursor: "pointer",
                                transition: "background 0.2s"
                            }}
                            onClick={() => {
                                const ticket = row.original;
                                if (ticket.status === TicketStatus.Rejected) return;
                                openTicket(ticket.requestId);
                            }}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} style={{
                                    padding: "16px",
                                    fontSize: "0.95rem"
                                }}>
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

                {data.length === 0 && (
                    <div style={{ padding: "40px", textAlign: "center", opacity: 0.5 }}>
                        No tickets found
                    </div>
                )}

            </div>
        </div>
    );
};

export default TicketSupportTable;