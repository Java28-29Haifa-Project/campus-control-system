import {useMemo, useState} from "react";
import type {Table} from "@tanstack/react-table";
import "../styles/tables.css";

type Props<TData> = {
    table: Table<TData>;
    statusOptions: string[];
    priorityOptions?: number[];
};

export function TableFilters<TData>({
                                              table,
                                              statusOptions,
                                        priorityOptions
                                          }: Props<TData>) {

    const [open, setOpen] = useState(false);

    const statusCol = table.getColumn("status");
    const hasPriorityFilter = !!priorityOptions?.length;
    const priorityCol = hasPriorityFilter ? table.getColumn("priority") : undefined;

    const appliedStatus = (statusCol?.getFilterValue() as string) ?? "ALL";
    const appliedPriority =
        hasPriorityFilter ? ((priorityCol?.getFilterValue() as number | "ALL") ?? "ALL") : "ALL";

    const isActive = useMemo(() => {
        if (hasPriorityFilter) return appliedStatus !== "ALL" || appliedPriority !== "ALL";
        return appliedStatus !== "ALL";
    }, [appliedStatus, appliedPriority, hasPriorityFilter]);

    return (
        <div className="support-table-actions" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="secondary-btn" onClick={() => setOpen((v) => !v)}>
                Filter{isActive ? " •" : ""}
            </button>

            {open && (
                <div className="filter-popover">
                    <div className="filter-row">
                        <span className="filter-label">Status</span>
                        <select
                            className="filter-select"
                            value={appliedStatus}
                            onChange={(e) => statusCol?.setFilterValue(e.target.value)}
                        >
                            <option value="ALL">All</option>
                            {statusOptions.map((s) => (
                                <option key={s} value={s}>
                                    {String(s).replaceAll("_", " ")}
                                </option>
                            ))}
                        </select>
                    </div>

                    {hasPriorityFilter && priorityCol && (
                        <div className="filter-row">
                            <span className="filter-label">Priority</span>

                            <select
                                className="filter-select"
                                value={String(appliedPriority)}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    priorityCol.setFilterValue(v === "ALL" ? "ALL" : Number(v));
                                }}
                            >
                                <option value="ALL">All</option>
                                {priorityOptions!.map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="filter-actions">
                        <button
                            type="button"
                            className="secondary-btn table-btn"
                            onClick={() => {
                                statusCol?.setFilterValue("ALL");
                                if (hasPriorityFilter) priorityCol?.setFilterValue("ALL");
                                setOpen(false);
                            }}
                        >
                            Reset
                        </button>

                        <button
                            type="button"
                            className="secondary-btn table-btn"
                            onClick={() => setOpen(false)}
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}