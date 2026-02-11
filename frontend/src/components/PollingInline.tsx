
import React from "react";

type Props = {
    newCount: number;
    syncing: boolean;
    onRefresh: () => void;
};

export const PollingInline: React.FC<Props> = ({
                                                   newCount,
                                                   syncing,
                                                   onRefresh,
                                               }) => {
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                marginLeft: 16,
                fontSize: 14,
                fontWeight: 400,
            }}
        >

            {newCount > 0 && (
                <span style={{ color: "#BF863C" }}>
          +{newCount} new
        </span>
            )}


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
