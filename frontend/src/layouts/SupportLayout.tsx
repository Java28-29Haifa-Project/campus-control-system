import React, { useEffect, useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import {useAppDispatch, useAppSelector} from "../state/hooks.ts";
import {fetchTicketsThunk} from "../state/slices/ticketSlice.ts";
import {supportNavItems} from "../components/configurations/nav-config.ts";
import "../styles/sidebar.css";

const POLL_MS = 60_000;

const isMockTickets = import.meta.env.VITE_USE_MOCK_TICKETS === "true";

function formatLastSync(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString();
}

const SupportLayout: React.FC = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();

    const { ticketsSyncing, ticketsSyncError, ticketsLastSyncAt  } = useAppSelector((state) => state.ticket);

    const shouldPollTickets = useMemo(() => {
        return location.pathname.startsWith("/support");
    }, [location.pathname]);

    useEffect(() => {
        if (!shouldPollTickets) return;

        const tick = () => {
            if (document.visibilityState !== "visible") return;
            if (ticketsSyncing) return;
            dispatch(fetchTicketsThunk());
        };

        tick();

        const id = window.setInterval(tick, POLL_MS);
        return () => window.clearInterval(id);
    }, [dispatch, shouldPollTickets, ticketsSyncing]);

    const forceRefresh = () => {
        // if (ticketsSyncing) return;
        dispatch(fetchTicketsThunk());
    };

    return (
        <div className="layout">

            <aside className="navbar">
                {isMockTickets && <div className="muted-text">Mock tickets mode</div>}
                <Navbar items={supportNavItems} />


                <div className="sidebar-panel">
                    <div className="sidebar-panel-row">
                        <span className="muted-text">Tickets updated:</span>
                        <span className="muted-text">{formatLastSync(ticketsLastSyncAt)}</span>
                    </div>

                    <button
                        className="secondary-btn"
                        onClick={forceRefresh}
                        disabled={ticketsSyncing}
                        title="Force refresh tickets"
                    >
                        Refresh
                        {/*{ticketsSyncing ? "Updating..." : "Refresh"}*/}
                    </button>

                    {ticketsSyncError && <div className="sidebar-error">{ticketsSyncError}</div>}
                </div>
            </aside>

            <main className="content">
                <Outlet />
            </main>
        </div>
    );
};

export default SupportLayout;
