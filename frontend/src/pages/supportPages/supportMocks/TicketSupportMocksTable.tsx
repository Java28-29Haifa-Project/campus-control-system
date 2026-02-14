import React, { useMemo } from "react";
import '../../../styles/forms.css';
import '../../../styles/tables.css';
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    type ColumnDef,
} from "@tanstack/react-table";
import {mockTickets} from "../../../mocks/ticketMocks.ts";
import {TicketStatus, type Ticket} from "../../../types/ticketTypes.ts";



const TicketSupportMocksTable: React.FC = () => {
    const navigate = useNavigate();

    const data = useMemo(() => mockTickets, []);

    const columns = useMemo<ColumnDef<Ticket>[]>(
        () => [
            {
                header: "ID",
                accessorKey: "requestId",
                // size:140,
            },
            {
                header: "Title",
                accessorKey: "subject",
                // size:200,
            },
            {
                header: "Description",
                accessorKey: "description",
                minSize: 600,
                cell: (info) => {
                    const value = info.getValue<string>();
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
                cell: (info) => info.getValue<TicketStatus>(),
            },
            {
                header: "Created at",
                accessorKey: "createdAt",
                cell: (info) =>
                    new Date(info.getValue<string>()).toLocaleString(),
            },
            {
                header: "Updated at",
                accessorKey: "updatedAt",
                cell: (info) =>
                    new Date(info.getValue<string>()).toLocaleString(),
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
                header: "IncidentDetails",
                id: "incident",
                size:150,
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
                                navigate(`/support/incident/new/${row.original.requestId}`);
                            }}
                        >
                            <FaPlus className="icon"/>
                        </button>
                    );
                },
            },
        ],
        [navigate]
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        columnResizeMode: "onChange"
    });

    return (
        <div className="support-table-page">
            <h1 className="support-table-title">All tickets (Mock)</h1>

            <div className="support-table-container">
                <table className="support-table" style={{width:'100%'}}>
                        <thead>
                        {table.getHeaderGroups().map((hg) => (
                            <tr key={hg.id}>
                                {hg.headers.map((header) => (
                                    <th
                                        key={header.id}
                                    style={{ width: header.getSize()}}
                                    >
                                        {flexRender(
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
                                className="table-row-clickable"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        style={{width:cell.column.getSize()}}
                                    >
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

export default TicketSupportMocksTable;
