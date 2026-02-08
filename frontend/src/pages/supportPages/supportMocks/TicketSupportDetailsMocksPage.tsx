import {useNavigate} from "react-router-dom";
import "../../../styles/tables.css"
import React, {useState} from "react";
import {TicketStatus, type Ticket} from "../../../types/ticketTypes.ts";


type Props = {
    ticket: Ticket;
};

const TicketSupportDetailsMocksPage: React.FC<Props> = ({ticket}) => {
    const navigate = useNavigate();

    const [status, setStatus] = useState<TicketStatus | "">("");

    if (!ticket) {
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

    return (
        <div className="auth-page">
            <div className="support-form-page details">
                <h1>Create incident</h1>

                <div className="mini-details">
                    <div><b>Ticket ID:</b> {ticket.requestId}</div>
                    <div><b>Subject:</b> {ticket.subject}</div>
                    <div><b>Priority:</b> {ticket.userReportedPriority}</div>
                    <div><b>Category:</b> {ticket.category}</div>
                    <div><b>Description:</b> {ticket.description}</div>

                    {ticket.status === TicketStatus.InService ?
                        <div><b>Status:</b> {ticket.status}
                            <div className="ticket-form-actions">
                                <button
                                    className="secondary-btn back-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/support/incident/new/${ticket.requestId}`);
                                    }}
                                >
                                    Create Incident
                                </button>
                            </div>
                        </div> :

                        <div><b>Status:</b>
                            <div className="select-box">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as TicketStatus)}
                                    required
                                >
                                    <option value="" disabled>
                                        Select status
                                    </option>
                                    <option value={TicketStatus.New} disabled>New</option>
                                    <option value={TicketStatus.Done} disabled>Done</option>
                                    <option value={TicketStatus.InService}>In Service</option>
                                    <option value={TicketStatus.Rejected}>Rejected</option>
                                </select>
                            </div>
                            <div className="ticket-form-actions">
                                <button
                                    className="secondary-btn back-btn"
                                    type="submit"
                                >
                                    Change Status
                                </button>
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

export default TicketSupportDetailsMocksPage;
