import React, {useCallback, useEffect, useMemo} from "react";
import { useNavigate, useParams } from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../state/hooks.ts";
import {clearCurrentTicket, fetchTicketByIdThunk, updateTicketThunk} from "../../state/slices/ticketSlice.ts";
import {type Ticket, TicketStatus} from "../../types/ticketTypes.ts";

const STATUS_OPTIONS: TicketStatus[] = [
    TicketStatus.InService,
    TicketStatus.Rejected,
];

const TicketSupportDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { current, isLoadingCurrent, error } = useAppSelector(
        (state) => state.ticket
    );

    const { incidentByTicketId } = useAppSelector((state) => state.incident);

    useEffect(() => {
        if (!id) return;
        dispatch(fetchTicketByIdThunk(id));

        return () => {
            dispatch(clearCurrentTicket());
        };
    }, [dispatch, id]);

    const incidentIdForTicket = useMemo(() => {
        if (!current) return undefined;
        return current.incidentId ?? incidentByTicketId[current.requestId];
    }, [current, incidentByTicketId]);

    const isLockedByIncident = Boolean(incidentIdForTicket);

    const handleStatusChangeDetails = useCallback(
        async (ticket: Ticket, newStatus: TicketStatus) => {

            if (ticket.incidentId ?? incidentByTicketId[ticket.requestId]) return;

            if (ticket.status !== TicketStatus.New) return;
            if (
                newStatus !== TicketStatus.InService &&
                newStatus !== TicketStatus.Rejected
            ) return;

        try {
            await dispatch(
                updateTicketThunk({
                    id: ticket.requestId,
                    updates: { status: newStatus },
                })
            ).unwrap();
        } catch (e) {
            console.error("Update status failed", e);
        }
    }, [dispatch, incidentByTicketId]);

    if (!id) {
        return (
            <div className="auth-page">
                <div className="login-wrapper ticket-details-wrapper">
                    <p>Incorrect ticket id</p>
                    <div className="ticket-details-actions">
                        <button
                            type="button"
                            className="secondary-btn"
                            onClick={() => navigate("/support/ticket")}
                        >
                            ← Back to list
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoadingCurrent) {
        return <div>Loading ticket...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!current) {
        return (
            <div className="support-table-page">
                <p>Ticket not found</p>
                <div className="ticket-details-actions">
                    <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => navigate("/support/ticket")}
                    >
                        ← Back to list
                    </button>
                </div>
            </div>
        );
    }
    const canChangeStatus = current.status === TicketStatus.New && !isLockedByIncident;

    const canCreateIncident = current.status === TicketStatus.InService && !isLockedByIncident;

    return (
        <div className="auth-page">
            <div className="support-form-page details">
                <h1>Ticket details</h1>

                <div className="mini-details">
                    <div><b>Ticket ID:</b> {current.requestId}</div>
                    <div><b>Subject:</b> {current.subject}</div>
                    <div><b>Priority:</b> {current.userReportedPriority}</div>
                    <div><b>Category:</b> {current.category}</div>
                    <div><b>Description:</b> {current.description}</div>

                    <div>
                        <b>Incident:</b>{" "}
                        {incidentIdForTicket ? (
                            <span>{incidentIdForTicket}</span>
                        ) : (
                            <span>—</span>
                        )}
                    </div>

                    <div>
                        <b>Status:</b>{" "}
                        {canChangeStatus ? (
                            <div className="select-box">
                                <select
                                    className="table-select"
                                    value={current.status}
                                    onChange={(e) => {
                                        const nextStatus = e.target.value as TicketStatus;

                                        if (nextStatus === current.status) return;

                                        void handleStatusChangeDetails(current, nextStatus);
                                    }}
                                >
                                    <option value={TicketStatus.New} disabled>
                                        {TicketStatus.New}
                                    </option>
                                    {STATUS_OPTIONS.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <span>{current.status}</span>
                        )}
                    </div>

                    {incidentIdForTicket ? (
                        <div className="ticket-form-actions">
                            <span className="muted-text">Incident already created</span>
                        </div>
                    ) : canCreateIncident ? (
                        <div className="ticket-form-actions">
                            <button
                                className="secondary-btn back-btn"
                                onClick={() => navigate(`/support/incident/new/${current.requestId}`)}
                            >
                                Create Incident
                            </button>
                        </div>
                    ) : null}

                    <div className="ticket-form-actions">
                        <button
                            type="button"
                            className="secondary-btn back-btn"
                            onClick={() => navigate("/support/ticket")}
                        >
                            ← Back to list
                        </button>
                    </div>

                </div>
            </div>
        </div>

    );
};

export default TicketSupportDetailsPage;
