import React, { useState } from "react";
import {useAppSelector} from "../state/hooks.ts";
import type {RouteType} from "../types/types.ts";
import {
    adminNavItem,
    engineerNavItems,
    supportNavItems,
    userNavItems
} from "../components/configurations/nav-config.ts";
import Header from "../components/Header.tsx";
import Navbar from "../components/Navbar.tsx";
import {Outlet} from "react-router-dom";
import "../styles/sidebar.css";

const RootLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true); // 🔥 ВОТ ОН

    const user = useAppSelector((state) => state.auth.user);

    let items: RouteType[] = [];

    if (user) {
        switch (user.role) {
            case "USER":
                items = userNavItems;
                break;
            case "SUPPORT":
                items = supportNavItems;
                break;
            case "ENGINEER":
                items = engineerNavItems;
                break;
            case "ADMIN":
                items = adminNavItem;
                break;
            default:
                items = [];
        }
    }
    const isSupportZone = location.pathname.startsWith("/support") ;

    return (
        <div className={`layout ${sidebarOpen ? "" : "sidebar-overlay"}`}>
            <Header onToggleSidebar={() => setSidebarOpen(v => !v)} />

            {!isSupportZone && <Navbar items={items} />}

            <main className="content">
                <Outlet />
            </main>
        </div>
    );
};

export default RootLayout;
