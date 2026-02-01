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
                <button
                    type="button"
                    className="secondary-btn back-btn"
                    onClick={() => navigate("/ticket")}
                >
                    ← Back to list
                </button>

                <h1 style={{"fontFamily": "inherit"}}>Ticket #{current.requestId}</h1>

                <div className="ticket-details-meta">
                    <div className="ticket-details-row">
                        <span className="ticket-details-label">Subject</span>
                        <p className="ticket-details-value">
                            {current.subject}
                        </p>
                    </div>

                    <div className="ticket-details-row">
                        <span className="ticket-details-label">Category</span>
                        <p className="ticket-details-value">
                            {current.category}
                        </p>
                    </div>

                    <div className="ticket-details-row">
                        <span className="ticket-details-label">Priority</span>
                        <p className="ticket-details-value">
                            {current.userReportedPriority}
                        </p>
                    </div>

                    <div className="ticket-details-row">
                        <span className="ticket-details-label">Status</span>
                        <p className="ticket-details-value">
                            {current.status}
                        </p>
                    </div>

                    <div className="ticket-details-row">
                        <span className="ticket-details-label">Created at</span>
                        <p className="ticket-details-value">
                            {new Date(
                                current.createdAt
                            ).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="ticket-details-row">
                    <span className="ticket-details-label">
                        Description
                    </span>
                    <p>{current.description}</p>
                </div>


            </div>
        </div>
    );
};

export default TicketDetailsPage;