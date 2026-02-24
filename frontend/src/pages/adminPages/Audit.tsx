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

// async function copyToClipboard(text: string) {
//     try {
//         await navigator.clipboard.writeText(text);
//     } catch {
//         const el = document.createElement("textarea");
//         el.value = text;
//         document.body.appendChild(el);
//         el.select();
//         document.execCommand("copy");
//         document.body.removeChild(el);
//     }
// }

const ROLE_OPTIONS: (AuditRole | "")[] = ["", "USER", "ADMIN", "SUPPORT", "ENGINEER"];

// const CopyMiniBtn: React.FC<{ value?: string }> = ({ value }) => {
//     if (!value) return null;
//     return (
//         <button
//             className="secondary-btn"
//             style={{ padding: "4px 8px", fontSize: 12 }}
//             onClick={async (e) => {
//                 e.stopPropagation();
//                 await copyToClipboard(value);
//             }}
//             title="Copy"
//             type="button"
//         >
//             Copy
//         </button>
//     );
// };

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
                // cell: ({ row }) => (
                //     <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                //         <span style={{ fontFamily: "monospace" }}>{row.original.entityId ?? "—"}</span>
                //         <CopyMiniBtn value={row.original.entityId} />
                //     </div>
                // ),
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
                // cell: ({ row }) => (
                //     <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                //         <span style={{ fontFamily: "monospace" }}>{row.original.correlationId ?? "—"}</span>
                //         <CopyMiniBtn value={row.original.correlationId} />
                //     </div>
                // ),
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
                // cell: ({ row }) => (
                //     <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                //         <span>{row.original.userId ?? "—"}</span>
                //         <CopyMiniBtn value={row.original.userId} />
                //     </div>
                // ),
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
                        // style={{
                        //     width: "100%",
                        //     display: "inline-flex",
                        //     justifyContent: "flex-end",
                        //     flexWrap: "wrap",
                        //     gap: 8,
                        // }}
                    >
                        <button className="secondary-btn" type="button" onClick={() => quickRole("SUPPORT")}>
                            SUPPORT
                        </button>
                        <button className="secondary-btn" type="button" onClick={() => quickRole("ENGINEER")}>
                            ENGINEER
                        </button>
                        {/*<button className="secondary-btn" type="button" onClick={() => quickRole("USER")}>*/}
                        {/*    USER*/}
                        {/*</button>*/}
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
                        className="audit-row audit-row--filters"
                        style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "flex-end",
                        }}
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
                                {/*<div className="muted-text">entityId</div>*/}
                                <input
                                    value={query.entityId ?? ""}
                                    onChange={(e) => dispatch(setAuditQuery({ entityId: e.target.value }))}
                                    placeholder="entityId"
                                />
                            </label>

                            <label className="field">
                                {/*<div className="muted-text">userId</div>*/}
                                <input
                                    value={query.userId ?? ""}
                                    onChange={(e) => dispatch(setAuditQuery({ userId: e.target.value }))}
                                    placeholder="userId"
                                />
                            </label>

                            <label className="field">
                                {/*<div className="muted-text">role</div>*/}
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
                                {/*<div className="muted-text">startDate (ISO)</div>*/}
                                <input
                                    value={query.startDate ?? ""}
                                    onChange={(e) => dispatch(setAuditQuery({ startDate: e.target.value }))}
                                    placeholder="start date"
                                />
                            </label>

                            <label className="field">
                                {/*<div className="muted-text">endDate (ISO)</div>*/}
                                <input
                                    value={query.endDate ?? ""}
                                    onChange={(e) => dispatch(setAuditQuery({ endDate: e.target.value }))}
                                    placeholder="end date"
                                />
                            </label>

                            {/*<div style={{ display: "flex", gap: 8, alignItems: "flex-end", justifyContent: "flex-end" }}>*/}
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
                            {/*</div>*/}
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
                        // style={{
                        //     width: "100%",
                        //     display: "flex",
                        //     justifyContent: "flex-end",
                        //     alignItems: "center",
                        //     gap: 10,
                        // }}
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
