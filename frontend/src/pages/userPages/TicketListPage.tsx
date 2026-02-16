import React, { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../state/hooks.ts";
import { fetchTicketsThunk } from "../../state/slices/ticketSlice.ts";
import ThemedLayout from "../../components/ThemedLayout";
import { usePolling } from "../../hooks/usePolling";
import { PollingInline } from "../../components/PollingInline";

const TicketListPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { items, ticketsSyncing, ticketsLastSyncAt, error } = useAppSelector((state) => state.ticket);

    const refresh = useCallback(() => dispatch(fetchTicketsThunk()), [dispatch]);

    useEffect(() => { refresh(); }, [refresh]);

    usePolling({ enabled: !error, intervalMs: 15000, isSyncing: ticketsSyncing, tick: refresh });

    return (
        <ThemedLayout imageName="Ticket" isWide={true}>
            <div style={{ width: "100%" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h1 style={{ margin: 0 }}>My Tickets</h1>

                    <PollingInline syncing={ticketsSyncing} lastSyncAt={ticketsLastSyncAt} onRefresh={refresh} />
                </div>

                <div style={{ maxHeight: 500, overflowY: "auto", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}>
                    <table cellPadding={12} style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                        <tr style={{ background: "rgba(0,0,0,0.2)", textAlign: "left" }}>
                            <th>Subject</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'center' }}>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.map((ticket) => (
                            <tr key={ticket.requestId} style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                                <td>{ticket.subject}</td>
                                <td>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            background: 'rgba(255,255,255,0.1)',
                                            fontSize: '12px',
                                            textTransform: 'uppercase'
                                        }}>
                                            {ticket.status}
                                        </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>

                                    <button
                                        onClick={() => navigate(`/ticket/${ticket.requestId}`)}
                                        className="dorfic-btn"
                                        style={{ padding: '6px 16px', fontSize: '11px' }}
                                    >
                                        Open
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {items.length === 0 && (
                        <div style={{ padding: 40, textAlign: 'center', opacity: 0.5 }}>You have no tickets yet.</div>
                    )}
                </div>
            </div>
        </ThemedLayout>
    );
};

export default TicketListPage;