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

async function copyToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text);
    } catch {
        const el = document.createElement("textarea");
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
    }
}

const ROLE_OPTIONS: (AuditRole | "")[] = ["", "USER", "ADMIN", "SUPPORT", "ENGINEER"];

const CopyMiniBtn: React.FC<{ value?: string }> = ({ value }) => {
    if (!value) return null;
    return (
        <button
            className="secondary-btn"
            style={{ padding: "4px 8px", fontSize: 12 }}
            onClick={async (e) => {
                e.stopPropagation();
                await copyToClipboard(value);
            }}
            title="Copy"
            type="button"
        >
            Copy
        </button>
    );
};

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
            {
                header: "Time",
                accessorKey: "timestamp",
                cell: ({ getValue }) => {
                    const iso = String(getValue() ?? "");
                    return <span>{toHuman(iso)}</span>;
                },
                size: 190,
            },
            { header: "Role", accessorKey: "role", size: 110 },
            {
                header: "User",
                accessorKey: "userId",
                cell: ({ row }) => (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span>{row.original.userId ?? "—"}</span>
                        <CopyMiniBtn value={row.original.userId} />
                    </div>
                ),
                size: 200,
            },
            { header: "Entity", accessorKey: "entity", size: 120 },
            {
                header: "EntityId",
                accessorKey: "entityId",
                cell: ({ row }) => (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontFamily: "monospace" }}>{row.original.entityId ?? "—"}</span>
                        <CopyMiniBtn value={row.original.entityId} />
                    </div>
                ),
                size: 280,
            },
            { header: "Action", accessorKey: "action", size: 220 },
            {
                header: "Correlation",
                accessorKey: "correlationId",
                cell: ({ row }) => (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontFamily: "monospace" }}>{row.original.correlationId ?? "—"}</span>
                        <CopyMiniBtn value={row.original.correlationId} />
                    </div>
                ),
                size: 300,
            },
            {
                header: "Metadata",
                accessorKey: "metadata",
                cell: ({ row }) => <JsonPreview obj={row.original.metadata} />,
                size: 380,
            },
        ];
    }, []);

    return (
        <div
            className="page audit-page"
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                minHeight: "calc(100vh - var(--header-h, 60px))",
                paddingBottom: 16,
            }}
        >

            <div
                className="page-header"
                style={{
                    position: "relative",
                    zIndex: 2,
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    justifyContent: "space-between",
                    flex: "0 0 auto",
                }}
            >
                <div>
                    <h2 style={{ margin: 0 }}>Audit</h2>
                    <div className="muted-text">
                        {pagination
                            ? `Total: ${pagination.totalCount} • Page ${pagination.page}/${pagination.totalPages}`
                            : "—"}
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        justifyContent: "flex-end",
                    }}
                >
                    <button className="secondary-btn" type="button" onClick={() => quickRole("SUPPORT")}>
                        SUPPORT
                    </button>
                    <button className="secondary-btn" type="button" onClick={() => quickRole("ENGINEER")}>
                        ENGINEER
                    </button>
                    <button className="secondary-btn" type="button" onClick={() => quickRole("USER")}>
                        USER
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
            </div>


            <div
                className="card"
                style={{
                    position: "relative",
                    zIndex: 2,
                    padding: 12,
                    flex: "0 0 auto",
                }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(6, minmax(140px, 1fr))",
                        gap: 10,
                    }}
                >
                    <label className="field">
                        <div className="muted-text">entityId</div>
                        <input
                            value={query.entityId ?? ""}
                            onChange={(e) => dispatch(setAuditQuery({ entityId: e.target.value }))}
                            placeholder="request/incident id"
                        />
                    </label>

                    <label className="field">
                        <div className="muted-text">userId</div>
                        <input
                            value={query.userId ?? ""}
                            onChange={(e) => dispatch(setAuditQuery({ userId: e.target.value }))}
                            placeholder="support_001"
                        />
                    </label>

                    <label className="field">
                        <div className="muted-text">role</div>
                        <select
                            value={query.role ?? ""}
                            onChange={(e) => dispatch(setAuditQuery({ role: e.target.value as any }))}
                        >
                            {ROLE_OPTIONS.map((r) => (
                                <option key={r || "ALL"} value={r}>
                                    {r || "ALL"}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="field">
                        <div className="muted-text">startDate (ISO)</div>
                        <input
                            value={query.startDate ?? ""}
                            onChange={(e) => dispatch(setAuditQuery({ startDate: e.target.value }))}
                            placeholder="2026-02-12T00:00:00.000Z"
                        />
                    </label>

                    <label className="field">
                        <div className="muted-text">endDate (ISO)</div>
                        <input
                            value={query.endDate ?? ""}
                            onChange={(e) => dispatch(setAuditQuery({ endDate: e.target.value }))}
                            placeholder="2026-02-12T23:59:59.999Z"
                        />
                    </label>

                    <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                        <button className="primary-btn" type="button" onClick={runSearch} disabled={isLoading}>
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

                {error && <div style={{ marginTop: 10, color: "salmon" }}>{error}</div>}
            </div>


            <div
                className="audit-table-wrap"
                style={{
                    flex: "1 1 auto",
                    minHeight: 0,
                    overflow: "auto",
                    position: "relative",
                    zIndex: 0,
                }}
            >
                <TableTanStack<AuditLog> data={logs} columns={columns} title="Audit Logs" />
            </div>


            <div
                style={{
                    position: "relative",
                    zIndex: 2,
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    justifyContent: "flex-end",
                    flex: "0 0 auto",
                }}
            >
                <button
                    className="secondary-btn"
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
                    className="secondary-btn"
                    type="button"
                    onClick={goNext}
                    disabled={isLoading || !pagination || (query.page ?? 1) >= (pagination?.totalPages ?? 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );

};

export default Audit;
