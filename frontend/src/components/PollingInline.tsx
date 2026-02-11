
import React from "react";

function formatLastSync(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleTimeString();
}

type Props = {
    newCount: number;
    syncing: boolean;
    lastSyncAt: string | null;
    onRefresh: () => void;
};

export const PollingInline: React.FC<Props> = ({
                                                   newCount,
                                                   syncing,
                                                    lastSyncAt,
                                                   onRefresh,
                                               }) => {
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                marginLeft: 16,
                fontSize: 20,
                fontWeight: 600,
            }}
        >

            {
                <p style={{ color: "#BF863C" }}>
          +{newCount} new
        </p>
            }

            <span className="muted-text">
        {formatLastSync(lastSyncAt)}
      </span>


            <button
                type="button"
                className="secondary-btn"
                disabled={syncing}
                onClick={onRefresh}
                style={{ padding: "4px 10px", fontSize: 13 }}
            >
        Refresh
      </button>
    </span>
    );
};
