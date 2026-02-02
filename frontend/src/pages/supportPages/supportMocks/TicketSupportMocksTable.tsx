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
import {type MockTicket, mockTickets} from "../../../mocks/ticketMocks.ts";
import {TicketStatus} from "../../../types/ticketTypes.ts";



const TicketSupportMocksTable: React.FC = () => {
    const navigate = useNavigate();

    const data = useMemo(() => mockTickets, []);

    const columns = useMemo<ColumnDef<MockTicket>[]>(
        () => [
            {
                header: "ID",
                accessorKey: "requestId",
                size:140,
            },
            // {
            //     header: "Title",
            //     accessorKey: "subject",
            //     size:200,
            // },
            {
                header: "Description",
                accessorKey: "description",
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
                                navigate(`/incident/new/${row.original.requestId}`);
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
