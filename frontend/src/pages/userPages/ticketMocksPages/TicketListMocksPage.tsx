import React, { useState } from "react";
import '../../../styles/tables.css';
import { useNavigate } from "react-router-dom";
import { TicketStatus } from "../../../types/ticketTypes.ts";
import { type MockTicket, mockTickets } from "../../../mocks/ticketMocks.ts";
import ThemedLayout from "../../../components/ThemedLayout";

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

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'NEW': return 'status-new';
            case 'IN_SERVICE': return 'status-in-service';
            case 'DONE': return 'status-done';
            case 'REJECTED': return 'status-rejected';
            default: return '';
        }
    };

    return (

        <ThemedLayout imageName="Ticket" isFullWidth={true}>

            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '30px',
                padding: '30px',
                boxShadow: '0 15px 40px rgba(0, 0, 0, 0.1)',


                width: '100%',
                minHeight: '80vh',

                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                margin: '0 auto'
            }}>

                <h1 className="ticket-title" style={{ marginTop: 0, marginBottom: 30 }}>My tickets</h1>


                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    marginBottom: '20px',
                    alignItems: 'center',
                    padding: '0 20px'
                }}>
                    <button type="button" onClick={handleCreateClick} className="create-btn">
                        + New Ticket
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 'bold', color: '#555' }}>Filter:</span>
                        <select
                            value={filterStatus}
                            onChange={handleFilterChange}
                            className="filter-select"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value={TicketStatus.New}>New</option>
                            <option value={TicketStatus.InService}>In service</option>
                            <option value={TicketStatus.Rejected}>Rejected</option>
                            <option value={TicketStatus.Done}>Done</option>
                        </select>
                    </div>
                </div>

                {filteredTickets.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', width: '100%' }}>
                        <h3>No tickets found!</h3>
                        <p>Try changing the filter or create a new one!</p>
                    </div>
                ) : (
                    <div style={{ width: '100%', overflowX: 'auto', borderRadius: '20px' }}>
                        <table className="ticket-list-table" style={{ width: '100%', minWidth: '800px' }}>
                            <thead>
                            <tr>
                                <th style={{ width: '20%' }}>Subject</th>
                                <th style={{ width: '35%' }}>Description</th>
                                <th style={{ width: '15%' }}>Category</th>
                                <th style={{ width: '15%' }}>Status</th>
                                <th style={{ width: '15%', textAlign: 'center' }}>Date</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredTickets.map((ticket) => (
                                <tr
                                    key={ticket.requestId}
                                    onClick={() => handleRowClick(ticket.requestId)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td style={{ fontWeight: 'bold', padding: '20px' }}>{ticket.subject}</td>

                                    <td className="desc-cell" style={{
                                        maxWidth: '300px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        padding: '20px'
                                    }}>
                                        {ticket.description}
                                    </td>

                                    <td style={{ padding: '20px' }}>{ticket.category}</td>

                                    <td style={{ padding: '20px' }}>
                                            <span className={`status-badge ${getStatusClass(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                    </td>

                                    <td style={{ padding: '20px', textAlign: 'center' }}>
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </ThemedLayout>
    );
};

export default TicketListMocksPage;