import React, { useMemo, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import {
    fetchAuditLogsThunk,
    resetAuditQuery,
    setAuditPage,
    setAuditQuery,
} from "../../state/slices/auditSlice";
import type {AuditLog, AuditRole} from "../../types/auditTypes.ts";
import type {ColumnDef} from "@tanstack/react-table";
import TableTanStack from "../../components/TableTanStack.tsx";
import "../../styles/tables.css";
import {IsoDateInput} from "../../components/IsoDateInput.tsx";

function toIsoStartOfDay(d: Date) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x.toISOString();
}
function toIsoNow() {
    return new Date().toISOString();
}
function toHuman(iso: string) {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleString();
}

const ROLE_OPTIONS: (AuditRole | "")[] = ["", "USER", "ADMIN", "SUPPORT", "ENGINEER"];

const JsonPreview: React.FC<{ obj?: Record<string, unknown> }> = ({ obj }) => {
    if (!obj) return <span className="muted-text">—</span>;
    const text = JSON.stringify(obj, null, 2);
    return (
        <details>
            <summary className="muted-text" style={{ cursor: "pointer" }}>
                metadata
            </summary>
            <pre style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>{text}</pre>
        </details>
    );
};

const Audit: React.FC = () => {
    const dispatch = useAppDispatch();
    const { logs, pagination, query, isLoading, error } = useAppSelector((s) => s.audit);

    const runSearch = useCallback(() => {
        dispatch(setAuditPage(1));
        dispatch(fetchAuditLogsThunk({ ...query, page: 1 }));
    }, [dispatch, query]);

    const quickRole = useCallback(
        (role: AuditRole) => {
            dispatch(setAuditQuery({ role, page: 1 }));
            dispatch(fetchAuditLogsThunk({ ...query, role, page: 1 }));
        },
        [dispatch, query]
    );

    const quickToday = useCallback(() => {
        const startDate = toIsoStartOfDay(new Date());
        const endDate = toIsoNow();
        dispatch(setAuditQuery({ startDate, endDate, page: 1 }));
        dispatch(fetchAuditLogsThunk({ ...query, startDate, endDate, page: 1 }));
    }, [dispatch, query]);

    const quickLast24h = useCallback(() => {
        const endDate = toIsoNow();
        const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        dispatch(setAuditQuery({ startDate, endDate, page: 1 }));
        dispatch(fetchAuditLogsThunk({ ...query, startDate, endDate, page: 1 }));
    }, [dispatch, query]);

    const clearAll = useCallback(() => {
        dispatch(resetAuditQuery());
        dispatch(fetchAuditLogsThunk({ ...query, entityId: "", userId: "", role: "", startDate: "", endDate: "", page: 1 }));
    }, [dispatch, query]);

    const goPrev = useCallback(() => {
        const p = query.page ?? 1;
        const nextPage = Math.max(1, p - 1);
        dispatch(setAuditPage(nextPage));
        dispatch(fetchAuditLogsThunk({ ...query, page: nextPage }));
    }, [dispatch, query]);

    const goNext = useCallback(() => {
        const p = query.page ?? 1;
        const totalPages = pagination?.totalPages ?? p;
        const nextPage = Math.min(totalPages, p + 1);
        dispatch(setAuditPage(nextPage));
        dispatch(fetchAuditLogsThunk({ ...query, page: nextPage }));
    }, [dispatch, query, pagination?.totalPages]);

    const columns = useMemo<ColumnDef<AuditLog>[]>(() => {
        return [
            { header: "Entity", accessorKey: "entity"},
            {
                header: "EntityId",
                accessorKey: "entityId",
                minSize:200,
                cell: ({ getValue }) => {
                    const v = String(getValue() ?? "");
                    if (!v) return "—";
                    return v;
                },
            },
            { header: "Action", accessorKey: "action",},
            {
                header: "Metadata",
                accessorKey: "metadata",
                minSize:400,
                cell: ({ row }) => <JsonPreview obj={row.original.metadata} />,
            },
            {
                header: "Correlation",
                accessorKey: "correlationId",
                minSize:230,
                cell: ({ getValue }) => {
                    const v = String(getValue() ?? "");
                    if (!v) return "—";
                    return v;
                },
            },
            { header: "Role", accessorKey: "role", },
            {
                header: "User",
                accessorKey: "userId",
                cell: ({ getValue }) => {
                    const v = String(getValue() ?? "");
                    if (!v) return "—";
                    return v;
                },
            },
            {
                header: "Time",
                accessorKey: "timestamp",
                minSize:200,
                cell: ({ getValue }) => {
                    const iso = String(getValue() ?? "");
                    return <span>{toHuman(iso)}</span>;
                },
            },
        ];
    }, []);

    return (
        <TableTanStack<AuditLog>
            data={logs}
            columns={columns}
            renderTopRight={() => (
                <div
                    className="audit-toolbar"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                        width: "100%",
                    }}
                >
                        <h4
                        style={{
                            width: "100%",
                            display: "inline-flex",
                            justifyContent: "flex-start",
                            flexWrap: "wrap",
                            gap: 8,
                            margin: "0 5px",
                        }}>Audit Logs</h4>

                    <div
                        className="filter-actions"
                    >
                        <button className="secondary-btn" type="button" onClick={() => quickRole("SUPPORT")}>
                            SUPPORT
                        </button>
                        <button className="secondary-btn" type="button" onClick={() => quickRole("ENGINEER")}>
                            ENGINEER
                        </button>
                        <button className="secondary-btn" type="button" onClick={() => quickRole("ADMIN")}>
                            ADMIN
                        </button>

                        <button className="secondary-btn" type="button" onClick={quickToday}>
                            Today
                        </button>
                        <button className="secondary-btn" type="button" onClick={quickLast24h}>
                            Last 24h
                        </button>

                        <button className="secondary-btn" type="button" onClick={clearAll}>
                            Clear
                        </button>
                    </div>


                    <div
                        className="filter-actions"
                    >
                        <div
                            className="audit-filters"
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(7, minmax(130px, 1fr))",
                                gap: 10,
                                width: "100%",
                                maxWidth: 980,
                                marginLeft: "auto",

                            }}
                        >
                            <label className="field">
                                <input
                                    value={query.entityId ?? ""}
                                    onChange={(e) => dispatch(setAuditQuery({ entityId: e.target.value }))}
                                    placeholder="entityId"
                                />
                            </label>

                            <label className="field">
                                <input
                                    value={query.userId ?? ""}
                                    onChange={(e) => dispatch(setAuditQuery({ userId: e.target.value }))}
                                    placeholder="userId"
                                />
                            </label>

                            <label className="field">
                                <select
                                    style={{fontSize:"11px"}}
                                    value={query.role ?? ""}
                                    id={query.role}
                                    onChange={(e) => dispatch(setAuditQuery({ role: e.target.value as AuditRole | ""}))}
                                >
                                    {ROLE_OPTIONS.map((r) => (
                                        <option key={r || "ALL"} value={r}>
                                            {r || "ALL"}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="field">
                                <IsoDateInput
                                    isoValue={query.startDate ?? ""}
                                    kind="start"
                                    placeholder="start date"
                                    disabled={isLoading}
                                    onChangeIso={(startDate) => dispatch(setAuditQuery({ startDate }))}
                                />
                            </label>

                            <label className="field">
                                <IsoDateInput
                                    isoValue={query.endDate ?? ""}
                                    kind="end"
                                    placeholder="end date"
                                    disabled={isLoading}
                                    onChangeIso={(endDate) => dispatch(setAuditQuery({ endDate }))}
                                />
                            </label>


                                <button className="secondary-btn" type="button" onClick={runSearch} disabled={isLoading}>
                                    {isLoading ? "Loading..." : "Search"}
                                </button>
                                <button
                                    className="secondary-btn"
                                    type="button"
                                    onClick={() => dispatch(fetchAuditLogsThunk(query))}
                                    disabled={isLoading}
                                >
                                    Refresh
                                </button>
                        </div>
                    </div>


                    {error && (
                        <div style={{ color: "salmon", width: "100%", textAlign: "right" }}>
                            {error}
                        </div>
                    )}


                    <div
                        className="audit-row audit-row--pagination"
                        style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "flex-end",
                        }}
                    >
          <span className="muted-text" style={{ fontSize: 13 }}>
            {pagination
                ? `Total: ${pagination.totalCount} • Page ${pagination.page}/${pagination.totalPages}`
                : "—"}
          </span>
                    </div>


                    <div
                        className="filter-actions"
                    >
                        <button
                            className="more-btn"
                            type="button"
                            onClick={goPrev}
                            disabled={isLoading || (query.page ?? 1) <= 1}
                        >
                            Prev
                        </button>

                        <span className="muted-text">
            Page {query.page ?? 1} / {pagination?.totalPages ?? "—"}
          </span>

                        <button
                            className="more-btn"
                            type="button"
                            onClick={goNext}
                            disabled={isLoading || !pagination || (query.page ?? 1) >= (pagination?.totalPages ?? 1)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        />
    );


};

export default Audit;
