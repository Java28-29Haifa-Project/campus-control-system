import {useAppDispatch, useAppSelector} from "../../state/hooks.ts";
import {type ColumnDef,} from "@tanstack/react-table";
import React, {useCallback, useMemo} from "react";
import {type Ticket, TicketStatus} from "../../types/ticketTypes.ts";
import "../../styles/tables.css";
import {useLocation, useNavigate} from "react-router-dom";
import {fetchTicketsThunk, updateTicketThunk} from "../../state/slices/ticketSlice.ts";
import {TableFilters} from "../../components/TableFilters.tsx";
import TableTanStack from "../../components/TableTanStack.tsx";
import {usePolling} from "../../hooks/usePolling.ts";
import {PollingInline} from "../../components/PollingInline.tsx";


const STATUS_OPTIONS: TicketStatus[] = [
    TicketStatus.New,
    TicketStatus.InService,
    TicketStatus.Rejected
];

const POLL_MS = 60_000;

const TicketSupportTable:React.FC = () => {

    const { items, ticketsSyncing, ticketsLastSyncAt } = useAppSelector((state) => state.ticket);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const location = useLocation();

    const enabledTicket =
        location.pathname.startsWith("/support");

    const tick = useCallback(() => {
        dispatch(fetchTicketsThunk({ source: "poll" }));
    }, [dispatch]);

    usePolling({
        enabled: enabledTicket,
        intervalMs: POLL_MS,
        isSyncing: ticketsSyncing,
        tick,
    });

    const forceRefresh = useCallback(() => {
        dispatch(fetchTicketsThunk({ source: "manual" }));
    }, [dispatch]);

    const handleStatusChange = useCallback(
        (ticket: Ticket, newStatus: TicketStatus) => {
        dispatch(
            updateTicketThunk({
                id: ticket.requestId,
                updates: { status: newStatus },
            })
        );
    }, [dispatch]);

    const columns = useMemo<ColumnDef<Ticket>[]>(
        () => [
            {
                header: "ID",
                accessorKey: "requestId",
                cell: ({getValue}) => {
                    const value = (getValue() ?? "") as string;
                    return value.length > 4 ? "…" + value.slice(-5) : value;
                }
            },
            {header: "Title", accessorKey: "subject",},
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
            {header: "Priority", accessorKey: "userReportedPriority"},
            {
                id: "status",
                accessorKey: "status",
                minSize: 400,
                filterFn: (row, columnId, filterValue) => {
                    if(!filterValue || filterValue === "ALL") return true;
                    const v = row.getValue(columnId) as TicketStatus;
                    return String(v) === String(filterValue);
                },
                cell: ({ row, getValue }) => {
                    const ticket = row.original;
                    const currentTicketStatus = getValue() as TicketStatus;
                    const lockedByIncident = currentTicketStatus === TicketStatus.InService;

                    if (ticket.status === TicketStatus.Done) {
                        return <span>{ticket.status.replace("_", " ")}</span>;
                    }

                    return (
                        <select
                            className="table-select"
                            value={currentTicketStatus}
                            disabled={lockedByIncident}
                            title={lockedByIncident ? "Status locked: incident already created" : undefined}
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                            onChange={async (e) => {
                                e.stopPropagation();
                                const nextStatus = e.target.value as TicketStatus;
                                if (nextStatus === ticket.status) return;

                                if (nextStatus === TicketStatus.InService) {
                                    navigate(`/support/incident/new/${ticket.requestId}`);
                                    return;
                                }

                                handleStatusChange(ticket, nextStatus);
                            }}
                        >
                            {STATUS_OPTIONS
                                .map((s) => (
                                <option key={s} value={s}>
                                    {s.replace("_", " ")}
                                </option>
                            ))}
                        </select>
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
        [handleStatusChange, navigate]
    );

    return (
        <TableTanStack<Ticket>
            title={
                <>
                    <PollingInline
                        syncing={ticketsSyncing}
                        lastSyncAt={ticketsLastSyncAt}
                        onRefresh={forceRefresh}
                    />
                </>
            }
            data={items}
            columns={columns}
            renderTopRight={(table) => (
                <TableFilters
                    table={table}
                    statusOptions={STATUS_OPTIONS}
                />
            )}
            isRowClickable={(row) =>  row.original.status === TicketStatus.New}
            getRowClassName={(row) => (
            row.original.status !== TicketStatus.New ? "row-disabled" : "")}
            onRowClick={(row) => navigate(`/support/ticket/${row.original.requestId}`)}
        />

    );
};

export default TicketSupportTable;