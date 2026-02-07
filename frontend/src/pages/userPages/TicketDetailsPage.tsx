import React, { useEffect } from "react";
import './../../styles/forms.css';
import { useParams, useNavigate } from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../state/hooks.ts";
import {clearCurrentTicket, fetchTicketByIdThunk} from "../../state/slices/ticketSlice.ts";

const TicketDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { current, isLoadingCurrent, error } = useAppSelector(
        (state) => state.ticket
    );

    useEffect(() => {
        if (id) {
            dispatch(fetchTicketByIdThunk(id));
        }

        return () => {
            dispatch(clearCurrentTicket());
        };
    }, [dispatch, id]);

    if (!id) {
        return (
            <div className="auth-page">
                <div className="login-wrapper ticket-details-wrapper">
                    <p>Incorrect ticket id</p>
                    <div className="ticket-details-actions">
                        <button
                            type="button"
                            className="secondary-btn"
                            onClick={() => navigate("/ticket")}
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
        return <div>Ticket not found</div>;
    }

    return (
        <div className="auth-page">
            <div className="login-wrapper ticket-details-wrapper">
                <h1>Ticket details</h1>
                <button
                    type="button"
                    className="secondary-btn back-btn"
                    onClick={() => navigate("/ticket")}
                >
                    ← Back to list
                </button>

                <h1 style={{"fontFamily": "inherit"}}>Ticket #{current.requestId}</h1>

                <div className="ticket-details-meta">
                    <div><b>Ticket ID:</b> {current.requestId}</div>
                    <div><b>Subject:</b> {current.subject}</div>
                    <div><b>Priority:</b> {current.userReportedPriority}</div>
                    <div><b>Category:</b> {current.category}</div>
                    <div><b>Status:</b> {current.status}</div>
                    <div><b>Description:</b> {current.description}</div>
                    <div><b>Created at:</b> {new Date(current.createdAt).toLocaleString()}</div>

                </div>

            </div>
        </div>
    );
};

export default TicketDetailsPage;