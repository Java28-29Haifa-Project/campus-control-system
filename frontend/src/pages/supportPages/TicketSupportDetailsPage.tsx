import React, {useCallback, useEffect} from "react";
import { useNavigate, useParams } from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../state/hooks.ts";
import {clearCurrentTicket, fetchTicketByIdThunk, updateTicketThunk} from "../../state/slices/ticketSlice.ts";
import {type Ticket, TicketStatus} from "../../types/ticketTypes.ts";

const STATUS_OPTIONS: TicketStatus[] = [
    TicketStatus.New,
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
    useEffect(() => {
        if (!id) return;
        dispatch(fetchTicketByIdThunk(id));

        return () => {
            dispatch(clearCurrentTicket());
        };
    }, [dispatch, id]);

    const handleStatusChangeDetails = useCallback(
        async (ticket: Ticket, newStatus: TicketStatus) => {
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
    }, [dispatch]);

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
    const isDisabled = current.status === TicketStatus.New;

    return (
        <div className="auth-page">
            <div className="support-form-page details">
                <h1>Create incident</h1>

                <div className="mini-details">
                    <div><b>Ticket ID:</b> {current.requestId}</div>
                    <div><b>Subject:</b> {current.subject}</div>
                    <div><b>Priority:</b> {current.userReportedPriority}</div>
                    <div><b>Category:</b> {current.category}</div>
                    <div><b>Description:</b> {current.description}</div>

                    {current.status === TicketStatus.InService ?
                        <div><b>Status:</b> {current.status}
                            <div className="ticket-form-actions">
                                <button
                                    className="secondary-btn back-btn"
                                    onClick={() => {
                                        navigate(`/incident/new`, {state: {current}});
                                    }}
                                >
                                    Create Incident
                                </button>
                            </div>
                        </div> :

                        <div><b>Status:</b>
                            <div className="select-box">
                                <select
                                    className="table-select"
                                    value={current.status}
                                    disabled={isDisabled}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => {
                                        const nextStatus = e.target.value as TicketStatus;

                                        if (nextStatus === current.status) return;
                                        handleStatusChangeDetails(current, nextStatus);
                                    }}
                                >
                                    {STATUS_OPTIONS.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    }
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
