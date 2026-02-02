import React, {useState} from "react";
import '../../../styles/listTickets.css';
import { useNavigate } from "react-router-dom";
import {TicketStatus} from "../../../types/ticketTypes.ts";
import {type MockTicket, mockTickets} from "../../../mocks/ticketMocks.ts";

const TicketListMocksPage: React.FC = () => {
    const navigate = useNavigate();

    const [filterStatus, setFilterStatus] = useState<TicketStatus | "ALL">("ALL");
    const [items] = useState<MockTicket[]>(mockTickets);

    const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value as TicketStatus | "ALL";
        setFilterStatus(value);
    };

    const filteredTickets = items.filter((ticket) => {
        if (filterStatus === "ALL") return true;
        return ticket.status === filterStatus;
    });

    const handleRowClick = (id: string) => {
        navigate(`/ticket/${id}`);
    };

    const handleCreateClick = () => {
        navigate("/ticket/new");
    };

    return (
        <div className="auth-page">
            <div className="ticket-table-wrapper">
                <h1>My tickets</h1>

                <div className="ticket-list-toolbar">
                    <button type="button" onClick={handleCreateClick} className="secondary-btn">
                        Create Ticket
                    </button>

            <div className="ticket-list-filter">
                <label className="ticket-list-filter-label">Filter by status</label>

                <div className="select-box">
                    <select value={filterStatus} onChange={handleFilterChange}>
                            <option value="ALL">All</option>
                            <option value={TicketStatus.New}>New</option>
                            <option value={TicketStatus.InService}>In service</option>
                            <option value={TicketStatus.Rejected}>Rejected</option>
                            <option value={TicketStatus.Done}>Done</option>
                        </select>
                    </div>
                </div>

            {filteredTickets.length === 0 ? (
                <p className="ticket-list-empty">No tickets yet</p>
            ) : (
                <div className="ticket-list-table-container">
                    <table className="ticket-list-table">
                            <thead>
                            <tr>
                                <th style={{ textAlign: "left" }}>Title</th>
                                <th style={{ textAlign: "left" }}>Description</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredTickets.map((ticket) => (
                                <tr
                                    key={ticket.requestId}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleRowClick(ticket.requestId)}
                                >
                                    <td>{ticket.subject}</td>
                                    <td>{ticket.description}</td>
                                    <td>{ticket.category}</td>
                                    <td>{ticket.status}</td>
                                    <td>
                                        {new Date(ticket.createdAt).toLocaleString(undefined, {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            </div>
            </div>
    );
};

export default TicketListMocksPage;
