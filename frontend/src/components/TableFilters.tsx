import {useMemo, useState} from "react";
import type {Table} from "@tanstack/react-table";
import "../styles/tables.css";

type Props<TData> = {
    table: Table<TData>;
    statusOptions: string[];
};

export function TableFilters<TData>({
                                              table,
                                              statusOptions,
                                          }: Props<TData>) {

    const [open, setOpen] = useState(false);

    const statusCol = table.getColumn("status");
    const appliedStatus = (statusCol?.getFilterValue() as string) ?? "ALL";

    const isActive = useMemo(() => appliedStatus !== "ALL", [appliedStatus]);

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
                            onChange={(e) => {
                                statusCol?.setFilterValue(e.target.value);
                                setOpen(false);
                            }}                        >
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

                        {/*<button*/}
                        {/*    type="button"*/}
                        {/*    className="secondary-btn table-btn"*/}
                        {/*    onClick={() => {*/}
                        {/*        setOpen(false);*/}
                        {/*    }}*/}
                        {/*>*/}
                        {/*    Done*/}
                        {/*</button>*/}
                    </div>
                </div>
            )}
        </div>
    );
}
