import {useAppDispatch, useAppSelector} from "../../state/hooks.ts";
import {type ColumnDef,} from "@tanstack/react-table";
import React, {useCallback, useMemo} from "react";
import {type Ticket, TicketStatus} from "../../types/ticketTypes.ts";
import "../../styles/tables.css";
import {useNavigate} from "react-router-dom";
import {updateTicketThunk} from "../../state/slices/ticketSlice.ts";
import {TableFilters} from "../../components/TableFilters.tsx";
import TableTanStack from "../../components/TableTanStack.tsx";


const STATUS_OPTIONS: TicketStatus[] = [
    TicketStatus.New,
    TicketStatus.InService,
    TicketStatus.Rejected,
];

const TicketSupportTable:React.FC = () => {

    const { items } = useAppSelector((state) => state.ticket);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

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
                    return value.length > 4 ? "…"  + value.slice(value.length - 5, value.length - 1) : value;
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
            {header: "Priority", accessorKey: "userReportedPriority",},
            {
                id: "status",
                accessorKey: "status",
                minSize: 400,
                filterFn: (row, columnId, filterValue) => {
                    if(!filterValue || filterValue === "ALL") return true;
                    return row.getValue(columnId) === filterValue;
                },
                cell: ({ row, getValue }) => {
                    const ticket = row.original;
                    const currentTicketStatus = getValue<TicketStatus>();

                    const lockedByIncident = ticket.status === TicketStatus.InService;
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
            // {
            //     header: "Incident",
            //     id: "incident",
            //     size:150,
            //     cell: ({ row }) => {
            //         const ticket = row.original;
            //
            //         if (ticket.incidentId) {
            //             return <span className="muted-text" style={{color:"#BF863C"}}>Incident {ticket.incidentId} created</span>;
            //         }
            //         // const incId = getIncidentId(ticket);
            //         //
            //         // if (incId) {
            //         //     return <span className="muted-text">Created</span>;
            //         // }
            //
            //         if (ticket.status === TicketStatus.New) {
            //             return <span className="muted-text">Need change status</span>;
            //         }
            //         if (ticket.status === TicketStatus.Rejected) {
            //             return <span className="muted-text">Ticket rejected</span>;
            //         }
            //         if (ticket.status === TicketStatus.Done) {
            //             return <span className="muted-text">Ticket done</span>;
            //         }
            //
            //         return (
            //             <button
            //                 className="secondary-btn table-btn"
            //                 onClick={(e) => {
            //                     e.preventDefault();
            //                     e.stopPropagation();
            //                     navigate(`/support/incident/new/${ticket.requestId}`);
            //                 }}
            //             >
            //                 Create incident
            //             </button>
            //         );
            //     },
            // },
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
        <TableTanStack <Ticket>
            title="All tickets"
            data={items}
            columns={columns}
            renderTopRight={(table) => (
                <TableFilters
                    table={table}
                    statusOptions={STATUS_OPTIONS}
                />
            )}
            isRowClickable={(row) => row.original.status !== TicketStatus.Rejected}
            getRowClassName={(row) => (
            row.original.status === TicketStatus.InService ||
            row.original.status === TicketStatus.Rejected ? "row-disabled" : "")}
            onRowClick={(row) => navigate(`/support/ticket/${row.original.requestId}`)}
        />

    );
};

export default TicketSupportTable;