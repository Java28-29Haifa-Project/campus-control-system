import {useAppSelector} from "../../state/hooks.ts";
import {flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import {useMemo} from "react";
import {TicketStatus} from "../../types/ticketTypes.ts";


const TicketSupportTable = () => {

    const {items,filterStatus} = useAppSelector((state) => state.ticket);

    const filteredData = useMemo(() =>
        items.filter((item) => {
            if(filterStatus === TicketStatus.New) return true;
            return item.status === filterStatus;
        })
    , [items, filterStatus]);

    const columns = useMemo(()=>[
        {
            header: "Open",
            accessor: "open",
            // cell: (info) => info.getValue(),
        },
        {
            header: "ID",
            accessor: "requestId",
            // cell: (info) => info.getValue(),
        },
        {
            header: "Title",
            accessor: "subject",
            // cell: (info) => info.getValue(),
        },
        {
            header: "Description",
            accessor: "description",
            // cell: (info) => info.getValue(),
        },
        {
            header: "Category",
            accessor: "category",
            // cell: (info) => info.getValue(),
        },
        {
            header: "Status",
            accessor: "status",
            // cell: (info) => info.getValue(),
        },
        {
            header: "Priority",
            accessor: "userReportedPriority",
            // cell: (info) => info.getValue(),
        },
        {
            header: "CreatedAt",
            accessor: "createdAt",
            // cell: (info) => info.getValue(),
        },
        {
            header: "User ID",
            accessor: "userId",
            // cell: (info) => info.getValue(),
        },
        {
            header: "UpdatedBy",
            accessor: "updatedBy",
            // cell: (info) => info.getValue(),
        },
        {
            header: "Status",
            accessor: "status",
            // cell: (info) => info.getValue(),
        },
        {
            header: "Incident",
            accessor: "incident",
            // cell: (info) => info.getValue(),
        },

    ], [])

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div>
            <div>
                <table>
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
                        <tr key={row.id}>
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