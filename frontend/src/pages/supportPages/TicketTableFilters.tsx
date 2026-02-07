import { useMemo, useState } from "react";
import type { Table } from "@tanstack/react-table";
import "../../styles/tables.css";

type Props<TData> = {
    table: Table<TData>;
    statusOptions: string[];
};

export function TicketTableFilters<TData>({
                                              table,
                                              statusOptions,
                                          }: Props<TData>) {
    const [open, setOpen] = useState(false);

    const statusCol = table.getColumn("status");
    const statusValue = (statusCol?.getFilterValue() as string) ?? "ALL";

    const isActive = useMemo(() => statusValue !== "ALL", [statusValue]);

    return (
        <div className="support-table-actions" onClick={(e) => e.stopPropagation()}>
            <button
                type="button"
                className="secondary-btn"
                onClick={() => setOpen((v) => !v)}
            >
                Filter{isActive ? " •" : ""}
            </button>

            {open && (
                <div className="filter-popover">
                    <div className="filter-row">
                        <span className="filter-label">Status</span>

                        <select
                            className="filter-select"
                            value={statusValue}
                            onChange={(e) => statusCol?.setFilterValue(e.target.value)}
                        >
                            <option value="ALL">All</option>
                            {statusOptions.map((s) => (
                                <option key={s} value={s}>
                                    {s.replace("_", " ")}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-actions">
                        <button
                            type="button"
                            className="secondary-btn table-btn"
                            onClick={() => {
                                statusCol?.setFilterValue("ALL");
                                setOpen(false);
                            }}
                        >
                            Reset
                        </button>

                        <button
                            type="button"
                            className="table-btn incident"
                            onClick={() => setOpen(false)}
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
