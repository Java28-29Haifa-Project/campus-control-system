import React from "react";
import './../../styles/forms.css';
import { useParams, useNavigate } from "react-router-dom";

const TicketDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    // const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // const { current, isLoadingCurrent, error } = useAppSelector(
    //     (state) => state.ticket
    // );

    // useEffect(() => {
    //     if (id) {
    //         dispatch(fetchTicketByIdThunk(id));
    //     }
    //
    //     return () => {
    //         dispatch(clearCurrentTicket());
    //     };
    // }, [dispatch, id]);

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
    //mock -remove later
    const mockTicket = {
        id,
        subject: "Problem with internet",
        description:
            "Internet connection is unstable in room 305. It drops every 5–10 minutes and interrupts online classes.",
        status: "OPEN",
        priority: "LOW",
        category: "ELECTRICAL",
        createdAt: "2026-01-22T10:25:00Z"
    };


    // if (isLoadingCurrent) {
    //     return <div>Loading ticket...</div>;
    // }
    //
    // if (error) {
    //     return <div>Error: {error}</div>;
    // }
    //
    // if (!current) {
    //     return <div>Ticket not found</div>;
    // }

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

                <h1>Ticket #{mockTicket.id}</h1>

                <div className="ticket-details-meta">
                    <div className="ticket-details-row">
                        <span className="ticket-details-label">Subject</span>
                        <span className="ticket-details-value">
                            {mockTicket.subject}
                        </span>
                    </div>

                    <div className="ticket-details-row">
                        <span className="ticket-details-label">Category</span>
                        <span className="ticket-details-value">
                            {mockTicket.category}
                        </span>
                    </div>

                    <div className="ticket-details-row">
                        <span className="ticket-details-label">Priority</span>
                        <span className="ticket-details-value">
                            {mockTicket.priority}
                        </span>
                    </div>

                    <div className="ticket-details-row">
                        <span className="ticket-details-label">Status</span>
                        <span className="ticket-details-value">
                            {mockTicket.status}
                        </span>
                    </div>

                    <div className="ticket-details-row">
                        <span className="ticket-details-label">Created at</span>
                        <span className="ticket-details-value">
                            {new Date(
                                mockTicket.createdAt
                            ).toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="ticket-details-description">
                    <span className="ticket-details-label">
                        Description
                    </span>
                    <p>{mockTicket.description}</p>
                </div>


            </div>
        </div>
    );
};

export default TicketDetailsPage;