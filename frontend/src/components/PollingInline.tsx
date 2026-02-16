import React, {useEffect, useState} from "react";

function formatLastSync(iso: string | null) {
    if (!iso) return {time: "—", ago: ""};

    const date = new Date(iso);
    const now = Date.now();

    const diffSec = Math.floor((now - date.getTime()) / 1000);

    const ago =
        diffSec < 60
            ? `${diffSec} sec ago`
            : diffSec < 3600
                ? `${Math.floor(diffSec / 60)} min ago`
                : `${Math.floor(diffSec / 3600)} h ago`;

    return {
        time: date.toLocaleTimeString(),
        ago,
    };
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

    const [, force] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            force((v) => v + 1);
        }, 1000);

        return () => clearInterval(id);
    }, []);

    const {time, ago} = formatLastSync(lastSyncAt);
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
      {!!newCount && (
          <p style={{color: "#BF863C", margin: 0}}>
              +{newCount} new
          </p>
      )}
            <span className="sidebar-panel-row">
        <span className="muted-text">Updated at:</span>

        <span
            className="muted-text"
            style={{
                display: "flex",
                flexDirection: "column",
                lineHeight: 1.1,
            }}
        >
          <span>{time}</span>
            {ago && (
                <span style={{fontSize: 11, opacity: 0.7}}>
              ({ago})
            </span>
            )}
        </span>
      </span>

      <button
          type="button"
          className="secondary-btn"
          disabled={syncing}
          onClick={onRefresh}
          style={{padding: "4px 10px", fontSize: 13}}
      >
        Refresh
      </button>
    </span>
    );
};
