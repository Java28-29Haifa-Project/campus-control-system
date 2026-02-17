import React, {useCallback, useEffect, useMemo} from "react";
import {TicketStatus, type Ticket} from "../../types/ticketTypes.ts";
import {useAppDispatch, useAppSelector} from "../../state/hooks.ts";
import {fetchTicketsThunk, updateTicketThunk} from "../../state/slices/ticketSlice.ts";
import type {ColumnDef} from "@tanstack/react-table";
import TableTanStack from "../../components/TableTanStack.tsx";
import {TableFilters} from "../../components/TableFilters.tsx";

const ADMIN_STATUS_FILTERS: TicketStatus[] = [
    TicketStatus.New,
    TicketStatus.InService,
    TicketStatus.Rejected,
    TicketStatus.Done,
];

const TicketAdminTable: React.FC = () => {
    const { items } = useAppSelector((state) => state.ticket);
    const dispatch = useAppDispatch();

    const closeTicket = useCallback(
        (ticket: Ticket) => {
            if (ticket.status === TicketStatus.Rejected) return;

            dispatch(
                updateTicketThunk({
                    id: ticket.requestId,
                    updates: { status: TicketStatus.Done },
                })
            );
        },
        [dispatch]
    );

    useEffect(() => {
        dispatch(fetchTicketsThunk());
    }, [dispatch]);

    const columns = useMemo<ColumnDef<Ticket>[]>(() => {
        const cols: ColumnDef<Ticket>[] = [
            {
                header: "ID",
                accessorKey: "requestId",
                cell: ({ getValue }) => {
                    return getValue() as string;
                },
            },
            { header: "Title", accessorKey: "subject" },
            {
                header: "Description",
                accessorKey: "description",
                minSize: 600,
                cell: ({ getValue }) => {
                    const value = (getValue() ?? "") as string;
                    return value.length > 80 ? value.slice(0, 80) + "…" : value;
                },
            },
            // { header: "Category", accessorKey: "category" },
            // { header: "Priority", accessorKey: "userReportedPriority" },

            {
                id: "status",
                header: "Status",
                accessorKey: "status",
                minSize: 220,
                filterFn: (row, columnId, filterValue) => {
                    if (!filterValue || filterValue === "ALL") return true;
                    return row.getValue(columnId) === filterValue;
                },
                cell: ({ getValue }) => {
                    const s = getValue<TicketStatus>();
                    return <span>{String(s).replace("_", " ")}</span>;
                },
            },

            {
                id: "adminActions",
                header: "Close",
                minSize: 160,
                cell: ({ row }) => {
                    const ticket = row.original;

                    const disabled =
                        ticket.status === TicketStatus.Rejected ||
                        ticket.status === TicketStatus.Done;

                    const title =
                        ticket.status === TicketStatus.Rejected
                            ? "Rejected tickets cannot be closed"
                            : ticket.status === TicketStatus.Done
                                ? "Ticket already closed"
                                : "Close ticket";

                    return (
                        <button
                            className="secondary-btn table-btn"
                            disabled={disabled}
                            title={title}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                closeTicket(ticket);
                            }}
                        >
                            Close
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
                },
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
        ];

        return cols;
    }, [closeTicket]);

    return (
        <TableTanStack<Ticket>
            title="All tickets"
            data={items}
            columns={columns}
            renderTopRight={(table) => (
                <TableFilters
                    table={table}
                    statusOptions={ADMIN_STATUS_FILTERS}
                />
            )}

            isRowClickable={(row) =>
                row.original.status !== TicketStatus.Rejected}
            getRowClassName={(row) => (
                row.original.status === TicketStatus.Rejected ? "row-disabled" : "")}
            onRowClick={() => {}}
        />
    );
};

export default TicketAdminTable;
