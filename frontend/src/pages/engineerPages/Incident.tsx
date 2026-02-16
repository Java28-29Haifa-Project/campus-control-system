import React, { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../state/hooks.ts";
import { getIncidentsThunk } from "../../state/slices/incidentSlice.ts";
import { type Incident } from "../../types/incidentTypes.ts";
import ThemedLayout from "../../components/ThemedLayout";
import { usePolling } from "../../hooks/usePolling.ts";
import { PollingInline } from "../../components/PollingInline.tsx";

const IncidentPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const { incidents, incidentsSyncing, incidentsLastSyncAt, incidentsNewCount } = useAppSelector((s) => s.incident);

    const refresh = useCallback(() => {
        dispatch(getIncidentsThunk({ source: "poll" }));
    }, [dispatch]);

    usePolling({
        enabled: location.pathname.startsWith("/incident"),
        intervalMs: 60000,
        isSyncing: incidentsSyncing,
        tick: refresh,
    });

    return (
        <ThemedLayout imageName="Incident" isWide={true}>
            <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>

                    <button onClick={() => navigate("/support/tickets")} className="dorfic-btn">
                        ← Back to tickets
                    </button>

                    <h1 style={{ margin: 0 }}>Incidents</h1>

                    <PollingInline
                        newCount={incidentsNewCount}
                        syncing={incidentsSyncing}
                        lastSyncAt={incidentsLastSyncAt}
                        onRefresh={refresh}
                    />
                </div>

                <div style={{ maxHeight: "70vh", overflowY: "auto", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}>
                    <table cellPadding={12} style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                        <tr style={{ background: "rgba(0,0,0,0.2)", textAlign: "left" }}>
                            <th>ID</th>
                            <th>Description</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {incidents.map((inc) => (
                            <tr key={inc.incidentId} style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                                <td>{inc.incidentId.slice(-6)}</td>
                                <td>{inc.description}</td>
                                <td>{inc.status.toUpperCase()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </ThemedLayout>
    );
};

export default IncidentPage;