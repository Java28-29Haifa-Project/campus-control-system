import React, { useMemo } from "react";
import '../../../styles/forms.css';
import '../../../styles/tables.css';
import { useNavigate } from "react-router-dom";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    type ColumnDef,
} from "@tanstack/react-table";
import {type MockTicket, mockTickets} from "../../../mocks/ticketMocks.ts";
import {TicketStatus} from "../../../types/ticketTypes.ts";



const TicketSupportMocksTable: React.FC = () => {
    const navigate = useNavigate();

    const data = useMemo(() => mockTickets, []);

    const columns = useMemo<ColumnDef<MockTicket>[]>(
        () => [
            {
                header: "Open",
                id: "open",
                size:80,
                cell: ({ row }) => (
                    <button
                        className="secondary-btn table-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/ticket/${row.original.requestId}`);
                        }}
                    >
                        Open
                    </button>
                ),
            },
            {
                header: "ID",
                accessorKey: "requestId",
                size:140,
            },
            {
                header: "Title",
                accessorKey: "subject",
                size:200,
            },
            {
                header: "Description",
                accessorKey: "description",
                size:1,
                cell: (info) => {
                    const value = info.getValue<string>();
                    return value.length > 80 ? value.slice(0, 80) + "…" : value;
                },
            },
            {
                header: "Category",
                accessorKey: "category",
                size:120,
            },
            {
                header: "Priority",
                accessorKey: "userReportedPriority",
                size:120,
            },
            {
                header: "Status",
                accessorKey: "status",
                size:120,
                cell: (info) => info.getValue<TicketStatus>(),
            },
            {
                header: "Created at",
                accessorKey: "createdAt",
                size:180,
                cell: (info) =>
                    new Date(info.getValue<string>()).toLocaleString(),
            },
            {
                header: "Updated at",
                accessorKey: "updatedAt",
                size:180,
                cell: (info) =>
                    new Date(info.getValue<string>()).toLocaleString(),
            },
            {
                header: "Incident",
                id: "incident",
                size:160,
                cell: ({ row }) => {
                    const ticket = row.original;

                    if (ticket.status === TicketStatus.Rejected) {
                        return <span className="muted-text">Ticket rejected</span>;
                    }

                    return (
                        <button
                            className="secondary-btn table-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/incidents/new?ticketId=${encodeURIComponent(ticket.requestId)}`);
                            }}
                        >
                            Create
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
    });

    return (
        <div className="support-table-page">
            <h1 className="support-table-title">All tickets (Mock)</h1>

            <div className="support-table-container">
                <table className="support-table">
                        <thead>
                        {table.getHeaderGroups().map((hg) => (
                            <tr key={hg.id}>
                                {hg.headers.map((header) => (
                                    <th key={header.id}>
                                        {flexRender(
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
                                className="table-row-clickable"
                            >
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

export default TicketSupportMocksTable;
