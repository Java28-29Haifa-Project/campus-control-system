import React, {useEffect} from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/tables.css";
import {useAppDispatch, useAppSelector} from "../../state/hooks.ts";
import {fetchTicketsThunk, setFilterStatus} from "../../state/slices/ticketSlice.ts";
import {TicketStatus} from "../../types/ticketTypes.ts";

const TicketListPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { items, isLoadingList, error, filterStatus } = useAppSelector((state) => state.ticket);

    useEffect(() => {
        dispatch(fetchTicketsThunk());
    }, [dispatch]);

    const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value as TicketStatus;
        dispatch(setFilterStatus(value));
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

    if (isLoadingList) {
        return <div>Loading tickets...</div>;
    }

    if (error) {
        return <div>Error loading: {error}</div>;
    }

    return (
        <div className="auth-page">
            <div className="ticket-table-wrapper">
                <h2>My tickets</h2>

                <button type="button" onClick={handleCreateClick} className="secondary-btn">
                    Create Ticket
                </button>

                    <div className="ticket-list-table-container">
                        <table className="ticket-list-table">
                            <thead>
                            <tr>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th className="ticket-list-filter">
                                    <select className="ticket-list-filter-label" value={filterStatus} onChange={handleFilterChange}>
                                        <option value="ALL" >All</option>
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
                            {filteredTickets.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="ticket-list-empty">
                                            No tickets with this status
                                        </td>
                                    </tr>
                                ) :
                                (filteredTickets.map((ticket) => (
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
                            )))}
                            </tbody>
                        </table>
                    </div>
            </div>
        </div>

    );
};

export default TicketListPage;
