import React from "react";

function formatLastSync(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleTimeString();
}

type Props = {
    newCount?: number;
    syncing: boolean;
    lastSyncAt: string | null;
    onRefresh: () => void;
};

export const PollingInline: React.FC<Props> = ({
                                                   newCount = 0,
                                                   syncing,
                                                   lastSyncAt,
                                                   onRefresh,
                                               }) => {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "auto" }}>

            {newCount > 0 && (
                <span style={{ color: "#e6ad3e", fontWeight: "bold", fontSize: "0.9rem" }}>
                    +{newCount} new
                </span>
            )}


            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: "1.2" }}>
                <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>Last sync:</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                    {formatLastSync(lastSyncAt)}
                </span>
            </div>


            <button
                type="button"
                onClick={onRefresh}
                disabled={syncing}
                style={{
                    cursor: syncing ? "not-allowed" : "pointer",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    border: "1px solid rgba(128,128,128, 0.5)",
                    background: "transparent",
                    color: "inherit",
                    opacity: syncing ? 0.5 : 1
                }}
            >
                {syncing ? "Syncing..." : "Refresh"}
            </button>
        </div>
    );
};