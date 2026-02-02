import {useAppDispatch, useAppSelector} from "../../state/hooks.ts";
import {type ColumnDef, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import React, {useCallback, useEffect, useMemo} from "react";
import {TicketStatus, type Ticket} from "../../types/ticketTypes.ts";
import {useNavigate} from "react-router-dom";
import {FaPlus} from "react-icons/fa";
import {fetchTicketsThunk, updateTicketThunk} from "../../state/slices/ticketSlice.ts";


const STATUS_OPTIONS: TicketStatus[] = [
    TicketStatus.New,
    TicketStatus.InService,
    TicketStatus.Rejected,
];

const TicketSupportTable:React.FC = () => {

    const { items, filterStatus} = useAppSelector((state) => state.ticket);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(fetchTicketsThunk());
    }, [dispatch]);

    const handleStatusChange = useCallback((ticket: Ticket, newStatus: TicketStatus) => {
        dispatch(
            updateTicketThunk({
                id: ticket.requestId,
                updates: { status: newStatus },
            })
        );
    }, [dispatch]);

    const filteredData = useMemo(() =>
        items.filter((item) => {
            if(filterStatus === TicketStatus.New) return true;
            return item.status === filterStatus;
        })
    , [items, filterStatus]);

    const columns = useMemo<ColumnDef<Ticket>[]>(
        () => [
            {
                header: "ID",
                accessorKey: "requestId",
            },
            {
                header: "Description",
                accessorKey: "description",
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
                header: "Status",
                accessorKey: "status",
                cell: ({ row, getValue }) => {
                    const ticket = row.original;
                    const current = getValue<TicketStatus>();

                    const isDisabled = ticket.status === TicketStatus.New;

                    return (
                        <select
                            className="table-select"
                            value={current}
                            disabled={isDisabled}
                            onChange={(e) => {
                                const nextStatus = e.target.value as TicketStatus;

                                if (nextStatus === ticket.status) return;
                                handleStatusChange(ticket, nextStatus);
                            }}
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                    {s}
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
                cell: () => "",
                // cell: ({getValue}) => {
                //     const value = getValue<string | undefined>();
                //     return value ? new Date(value).toLocaleString() : "—";
                // }
            },
            {
                header: "Open",
                id: "open",
                cell: ({ row }) => (
                    <button
                        className="secondary-btn table-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/support/ticket/${row.original.requestId}`);
                        }}
                    >
                        Open
                    </button>
                ),
            },
            {
                header: "Incident",
                id: "incident",
                cell: ({ row }) => {
                    const ticket = row.original;

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
                            className="table-btn incident"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/incident/new`);
                            }}
                        >
                            <FaPlus className="icon"/>
                        </button>
                    );
                },
            },
        ],
        [navigate, handleStatusChange]
    );

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="support-table-page">
            <h1 className="support-table-title">All tickets (Mock)</h1>
            <div className="support-table-container">
                <table className="support-table">
                    <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id}>
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
                            className="table-row-clickable">
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id}>
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