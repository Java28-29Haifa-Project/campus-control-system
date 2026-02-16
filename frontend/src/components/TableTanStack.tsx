import React, { useState } from "react";
import {
    type ColumnDef, type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel, type Row,
    useReactTable,
} from "@tanstack/react-table";
import "../styles/tables.css";

type TableTabStackProps<TData> = {
    data: TData[];
    columns: ColumnDef<TData, unknown>[];
    initialColumnFilters?: ColumnFiltersState;
    onRowClick?: (row: Row<TData>) => void;
    isRowClickable?: (row: Row<TData>) => boolean;
    getRowClassName?: (row: Row<TData>) => string;
    renderTopRight?: (table: ReturnType<typeof useReactTable<TData>>) => React.ReactNode;

    title?: string | React.ReactNode;

    actionsHeader?: React.ReactNode;
    actionsWidth?: number;
    renderRowActions?: (row: Row<TData>) => React.ReactNode;
};

function TableTanStack<TData>({
                                            data,
                                            columns,
                                            initialColumnFilters = [],
                                            onRowClick,
                                            isRowClickable,
                                            getRowClassName,
                                            renderTopRight,
                                            title,
                                  actionsHeader = "Actions",
                                  actionsWidth = 120,
                                  renderRowActions,
                                        }: TableTabStackProps<TData>) {

    const [columnFilters, setColumnFilters] =
        useState<ColumnFiltersState>(initialColumnFilters);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { columnFilters },
        onColumnFiltersChange: setColumnFilters,
        columnResizeMode: "onChange",
    });

    const hasActions = Boolean(renderRowActions);

    return (
        <div className="support-table-page">
            {(title || renderTopRight) && (
                <div className="support-table-header">
                    {title && <h1 className="support-table-title">{title}</h1>}
                    {renderTopRight?.(table)}
                </div>
            )}

            <div className="support-table-container">
                <table className="support-table">
                    <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id} style={{ width: header.getSize() }}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
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

                            {hasActions && (
                                <th style={{ width: actionsWidth, whiteSpace: "nowrap" }}>
                                    {actionsHeader}
                                </th>
                            )}
                        </tr>
                    ))}
                    </thead>

                    <tbody>
                    {table.getRowModel().rows.map((row) => {
                        const clickable = onRowClick
                            ? (isRowClickable ? isRowClickable(row) : true)
                            : false;

                        const rowClass = [
                            clickable ? "table-row-clickable" : "",
                            getRowClassName?.(row) ?? "",
                        ]
                            .filter(Boolean)
                            .join(" ");

                        return (
                            <tr
                                key={row.id}
                                className={rowClass}
                                role={clickable ? "button" : undefined}
                                tabIndex={clickable ? 0 : undefined}
                                onClick={() => {
                                    if (!clickable) return;
                                    onRowClick?.(row);
                                }}
                                onKeyDown={(e) => {
                                    if (!clickable) return;
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        onRowClick?.(row);
                                    }
                                }}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} style={{ width: cell.column.getSize() }}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}

                                {hasActions && (
                                    <td
                                        style={{ width: actionsWidth }}
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => e.stopPropagation()}
                                    >
                                        {renderRowActions?.(row)}
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TableTanStack
