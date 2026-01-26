import React, {useEffect} from "react";

import { useNavigate } from "react-router-dom";

import {useAppDispatch, useAppSelector} from "../../state/hooks.ts";

import {fetchTicketsThunk, setFilterStatus} from "../../state/slices/ticketSlice.ts";

import type { TicketStatus } from "../../types/ticketTypes.ts";

import ThemedLayout from "../../components/ThemedLayout";

const TicketListPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { items, isLoadingList, error, filterStatus, } = useAppSelector((state) => state.ticket);

    useEffect(() => {
        dispatch(fetchTicketsThunk());
    }, [dispatch]);

    const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value as TicketStatus | "ALL";
        dispatch(setFilterStatus(value));
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

    if (isLoadingList) {
        return (
            <ThemedLayout imageName="Ticket">
                <div>Loading tickets...</div>
            </ThemedLayout>
        );
    }

    if (error) {
        return (
            <ThemedLayout imageName="Ticket">
                <div>Error loading: {error}</div>
            </ThemedLayout>
        );
    }

    return (
        <ThemedLayout imageName="Ticket">

            <div style={{ width: "100%", textAlign: "center" }}>

                <h1 style={{ marginTop: 0 }}>My tickets</h1>


                <div className="ticket-form-actions" style={{ justifyContent: 'center', marginBottom: '20px' }}>
                    <button type="button" onClick={handleCreateClick}
                            className="secondary-btn" >
                        Create Ticket
                    </button>
                </div>


                <div style={{ marginTop: 12, marginBottom: 16 }}>
                    <label
                        style={{
                            fontSize: 12,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            opacity: 0.7,
                            display: "block",
                            marginBottom: "5px"
                        }}
                    >
                        Filter by status
                    </label>
                    <div className="select-box" style={{ maxWidth: "200px", margin: "0 auto" }}>
                        <select value={filterStatus} onChange={handleFilterChange}>
                            <option value="ALL">All</option>
                            <option value="NEW">New</option>
                            <option value="IN_PROGRESS">In service</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="Done">Done</option>
                        </select>
                    </div>
                </div>


                {filteredTickets.length === 0 ? (
                    <p style={{ marginTop: 8 }}>No tickets yet</p>
                ) : (
                    <div style={{ maxHeight: 320, overflowY: "auto", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)" }}>
                        <table
                            cellPadding={12}
                            cellSpacing={0}
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",

                                background: "rgba(0,0,0,0.1)",
                                color: "inherit",
                                fontSize: 14,
                            }}
                        >
                            <thead>
                            <tr style={{ background: "rgba(0,0,0,0.2)" }}>

                                <th style={{ textAlign: "left" }}>Title</th>

                                <th style={{ textAlign: "left" }}>Description</th>

                                <th>Status</th>

                                <th>Date</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredTickets.map((ticket) => (
                                <tr
                                    key={ticket.id}
                                    style={{
                                        cursor: "pointer",
                                        borderBottom: "1px solid rgba(255,255,255,0.1)"
                                    }}
                                    onClick={() => handleRowClick(ticket.id)}
                                >
                                    <td style={{ textAlign: "left" }}>{ticket.subject}</td>
                                    <td style={{ textAlign: "left" }}>
                                        {ticket.description.length > 30
                                            ? `${ticket.description.slice(0, 30)}...`
                                            : ticket.description}
                                    </td>
                                    <td>{ticket.status}</td>
                                    <td>
                                        {new Date(ticket.createdAt).toLocaleString(undefined, {
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
        </ThemedLayout>
    );
};

export default TicketListPage;
