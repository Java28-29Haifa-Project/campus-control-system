import React, {useState} from "react";
import '../../../styles/listTickets.css';
import { useNavigate } from "react-router-dom";
import {TicketStatus, type Ticket} from "../../../types/ticketTypes.ts";
import {mockTickets} from "../../../mocks/ticketMocks.ts";

const TicketListMocksPage: React.FC = () => {
    const navigate = useNavigate();

    const [filterStatus, setFilterStatus] = useState<TicketStatus | "ALL">("ALL");
    const [items] = useState<Ticket[]>(mockTickets);

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
                <h2>My tickets</h2>

                    <button type="button" onClick={handleCreateClick} className="secondary-btn">
                        Create Ticket
                    </button>


            {filteredTickets.length === 0 ? (
                <p className="ticket-list-empty">No tickets yet</p>
            ) : (
                <div className="ticket-list-table-container">
                    <table className="ticket-list-table">
                            <thead>
                            <tr>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th className="ticket-list-filter">
                                        <select className="ticket-list-filter-label" value={filterStatus} onChange={handleFilterChange}>
                                    <option value="ALL" >Status</option>
                                    <option value={TicketStatus.New}>New</option>
                                    <option value={TicketStatus.InService}>In service</option>
                                    <option value={TicketStatus.Rejected}>Rejected</option>
                                    <option value={TicketStatus.Done}>Done</option>
                                </select>
                                    <div/>
                                        <div/>
                                    </th>
                                <th>Date</th>
                                <th>Open</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredTickets.map((ticket) => (
                                <tr
                                    key={ticket.requestId}
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
                                    <td>
                                        <button className="secondary-btn" style={{ cursor: "pointer" }}
                                            onClick={() => handleRowClick(ticket.requestId)}
                                        >
                                            Open
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            </div>

    );
};

export default TicketListMocksPage;
