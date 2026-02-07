import {useEffect, useMemo, useState} from "react";
import type {Table} from "@tanstack/react-table";
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
    const appliedStatus = (statusCol?.getFilterValue() as string) ?? "ALL";

    const [draftStatus, setDraftStatus] = useState(appliedStatus);
    const isActive = useMemo(() => appliedStatus !== "ALL", [appliedStatus]);

    useEffect(() => {
        if (open) setDraftStatus(appliedStatus);
    }, [open, appliedStatus]);



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
                            value={appliedStatus}
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
                            className="table-btn"
                            onClick={() => {
                                setDraftStatus("ALL");
                                statusCol?.setFilterValue("ALL");
                                setOpen(false);
                            }}
                        >
                            Reset
                        </button>

                        <button
                            type="button"
                            className="secondary-btn table-btn"
                            onClick={() => {
                                statusCol?.setFilterValue(draftStatus);
                                setOpen(false);
                            }}
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
