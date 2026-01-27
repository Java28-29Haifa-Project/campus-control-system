import React, {useState} from "react";
import '../../../styles/forms.css';
import { useNavigate } from "react-router-dom";
import {TicketStatus} from "../../../types/ticketTypes.ts";
import {type MockTicket, mockTickets} from "../../../../mocks/ticketMocks.ts";

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

                <div className="ticket-form-actions">
                    <button type="button" onClick={handleCreateClick}
                            className="secondary-btn" >
                        Create Ticket
                    </button>
                    {/*<button*/}
                    {/*    type="button"*/}
                    {/*    className="secondary-btn"*/}
                    {/*    onClick={() => setFilterStatus("ALL")}*/}
                    {/*>*/}
                    {/*    Reset filter*/}
                    {/*</button>*/}
                </div>

                <div style={{ marginTop: 12, marginBottom: 16 }}>
                    <label
                        style={{
                            fontSize: 12,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: "rgba(255,255,255,0.7)",
                        }}
                    >
                        Filter by status
                    </label>
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
                    <p style={{ marginTop: 8 }}>No tickets yet</p>
                ) : (
                    <div style={{ maxHeight: 320, overflowY: "auto" }}>
                        <table
                            border={1}
                            cellPadding={8}
                            cellSpacing={0}
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                background: "rgba(0,0,0,0.35)",
                                color: "#fff",
                                fontSize: 14,
                            }}
                        >
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
    );
};

export default TicketListMocksPage;
