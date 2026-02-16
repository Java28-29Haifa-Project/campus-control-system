import React, { useEffect, useCallback } from "react";
import './../../styles/forms.css';
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../state/hooks.ts";
import { clearCurrentTicket, fetchTicketByIdThunk } from "../../state/slices/ticketSlice.ts";
import ThemedLayout from "../../components/ThemedLayout";
import { usePolling } from "../../hooks/usePolling";
import { PollingInline } from "../../components/PollingInline";

const TicketDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();


    const {
        current,
        isLoadingCurrent,
        error,
        ticketsSyncing,
        ticketsLastSyncAt
    } = useAppSelector((state) => state.ticket);


    const refreshTicket = useCallback(() => {
        if (id) {
            dispatch(fetchTicketByIdThunk(id));
        }
    }, [dispatch, id]);


    usePolling({
        enabled: !!id && !error,
        intervalMs: 30000,
        isSyncing: ticketsSyncing,
        tick: refreshTicket
    });


    useEffect(() => {
        refreshTicket();
        return () => {
            dispatch(clearCurrentTicket());
        };
    }, [refreshTicket, dispatch]);



    if (!id) {
        return (
            <ThemedLayout imageName="Ticket">
                <div className="login-wrapper ticket-details-wrapper">
                    <p>Incorrect ticket id</p>
                    <div className="ticket-details-actions">
                        <button type="button" className="secondary-btn" onClick={() => navigate("/ticket")}>
                            ← Back to list
                        </button>
                    </div>
                </div>
            </ThemedLayout>
        );
    }

    if (isLoadingCurrent && !current) {
        return (
            <ThemedLayout imageName="Ticket">
                <div className="login-wrapper">Loading ticket...</div>
            </ThemedLayout>
        );
    }

    if (error) {
        return (
            <ThemedLayout imageName="Ticket">
                <div className="login-wrapper error-message">Error: {error}</div>
            </ThemedLayout>
        );
    }

    if (!current) {
        return (
            <ThemedLayout imageName="Ticket">
                <div className="login-wrapper">Ticket not found</div>
            </ThemedLayout>
        );
    }

    // --- ОТРИСОВКА (Твой дизайн) ---

    return (
        <ThemedLayout imageName="Ticket">
            <div className="login-wrapper ticket-details-wrapper" style={{ width: '100%', maxWidth: '800px' }}>

                {/* Хедер с кнопкой и статусом обновления */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <button
                        type="button"
                        className="secondary-btn back-btn"
                        onClick={() => navigate("/ticket")}
                    >
                        ← Back
                    </button>

                    {/* Индикатор обновления */}
                    <PollingInline
                        syncing={ticketsSyncing}
                        lastSyncAt={ticketsLastSyncAt}
                        onRefresh={refreshTicket}
                        newCount={0}
                    />
                </div>

                {/* Исправили current.id на current.requestId */}
                <h1 style={{ marginTop: 0 }}>Ticket #{current.requestId}</h1>

                <div className="ticket-details-meta">
                    <div className="ticket-details-row">
                        <span className="ticket-details-label">Subject</span>
                        <span className="ticket-details-value">
                            {current.subject}
                        </span>
                    </div>

                    <div className="ticket-details-row">
                        <span className="ticket-details-label">Category</span>
                        <span className="ticket-details-value">
                            {current.category}
                        </span>
                    </div>

                    <div className="ticket-details-row">
                        <span className="ticket-details-label">Priority</span>
                        <span className="ticket-details-value">
                            {current.userReportedPriority}
                        </span>
                    </div>

                    <div className="ticket-details-row">
                        <span className="ticket-details-label">Status</span>
                        <span className="ticket-details-value">
                            <span style={{
                                padding: "4px 8px",
                                background: "rgba(255,255,255,0.1)",
                                borderRadius: 4,
                                fontWeight: "bold",
                                fontSize: "0.9em"
                            }}>
                                {current.status.replace(/_/g, " ").toUpperCase()}
                            </span>
                        </span>
                    </div>

                    <div className="ticket-details-row">
                        <span className="ticket-details-label">Created at</span>
                        <span className="ticket-details-value">
                            {new Date(current.createdAt).toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="ticket-details-description" style={{ marginTop: 20 }}>
                    <span className="ticket-details-label" style={{ display: "block", marginBottom: 8 }}>
                        Description
                    </span>
                    <p style={{
                        background: "rgba(0,0,0,0.2)",
                        padding: 15,
                        borderRadius: 8,
                        lineHeight: 1.5
                    }}>
                        {current.description}
                    </p>
                </div>

            </div>
        </ThemedLayout>
    );
};

export default TicketDetailsPage;