import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../state/hooks.ts";
import {fetchTicketsThunk, setFilterStatus} from "../../state/slices/ticketSlice.ts";
import type {TicketStatus} from "../../types/ticketTypes.ts";

const TicketListPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const {
        items,
        isLoadingList,
        error,
        filterStatus,
    } = useAppSelector((state) => state.ticket);

    useEffect(() => {
        dispatch(fetchTicketsThunk());
    }, [dispatch]);

    const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value as TicketStatus | "ALL";
        dispatch(setFilterStatus(value));
    };

    const filteredTickets = items.filter(ticket => {
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
        return <div>Загружаем тикеты...</div>;
    }

    if (error) {
        return <div>Ошибка при загрузке тикетов: {error}</div>;
    }

    return (
        <div style={{ padding: "24px" }}>
    <h1>Мои тикеты</h1>

    <div style={{ marginBottom: "16px", display: "flex", gap: "16px" }}>
    <button onClick={handleCreateClick}>Создать тикет</button>

    <div>
    <label>
        Фильтр по статусу:&nbsp;
    <select value={filterStatus} onChange={handleFilterChange}>
    <option value="ALL">Все</option>
        <option value="NEW">Новые</option>
        <option value="IN_PROGRESS">В работе</option>
    <option value="RESOLVED">Решённые</option>
        <option value="CLOSED">Закрытые</option>
        </select>
        </label>
        </div>
        </div>

    {filteredTickets.length === 0 ? (
        <p>Тикетов пока нет.</p>
    ) : (
        <table border={1} cellPadding={8} cellSpacing={0}>
        <thead>
            <tr>
                <th>Тема</th>
        <th>Описание</th>
        <th>Статус</th>
        <th>Дата создания</th>
    </tr>
    </thead>
    <tbody>
    {filteredTickets.map((ticket) => (
            <tr
                key={ticket.id}
        style={{ cursor: "pointer" }}
        onClick={() => handleRowClick(ticket.id)}
    >
        <td>{ticket.subject}</td>
        <td>{ticket.description.slice(0, 50)}...</td>
    <td>{ticket.status}</td>
    <td>{new Date(ticket.createdAt).toLocaleString()}</td>
    </tr>
    ))}
        </tbody>
        </table>
    )}
    </div>
);
};

export default TicketListPage;
