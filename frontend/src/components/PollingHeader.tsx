
import React from "react";

type Props = {
    label: string;
    syncing: boolean;
    error: string | null;
    newCount: number;
    onRefresh: () => void;
    className?: string;
};

export const PollingHeader: React.FC<Props> = ({
                                                   label,
                                                   syncing,
                                                   error,
                                                   newCount,
                                                   onRefresh,
                                                   className,
                                               }) => {
    const hasNew = newCount > 0;

    return (
        <div className={className ?? ""} style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                <span style={{ fontWeight: 600 }}>{label}</span>

                <span className="muted-text">
          {syncing ? "Checking…" : hasNew ? `+${newCount} new` : "No new"}
        </span>

                {error && <span className="sidebar-error">{error}</span>}
            </div>

            <button
                type="button"
                className="secondary-btn"
                onClick={onRefresh}
                disabled={syncing}
                title={`Force refresh ${label.toLowerCase()}`}
            >
                {syncing ? "Updating…" : "Refresh"}
            </button>
        </div>
    );
};
