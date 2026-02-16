import { Outlet, useLocation, useNavigate } from "react-router-dom";
import type { RouteType } from "../utils/types.ts";
import * as React from "react";
import Navbar, { type NavItem } from "../components/Navbar.tsx";
import Header from "../components/Header.tsx";
import { useAppSelector } from "../state/hooks.ts";
import {
    adminNavItem,
    engineerNavItems,
    supportNavItems,
    userNavItems
} from "../components/configurations/nav-config.ts";

const RootLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.auth.user);


    const role = user?.role || "USER";

    let rawItems: RouteType[] = [];

    switch (role) {
        case "USER":
            rawItems = userNavItems;
            break;
        case "SUPPORT":
            rawItems = supportNavItems;
            break;
        case "ENGINEER":
            rawItems = engineerNavItems;
            break;
        case "ADMIN":
            rawItems = adminNavItem;
            break;
        default:
            rawItems = userNavItems;
    }


    const navbarItems: NavItem[] = rawItems.map(item => ({
        id: item.path,
        title: item.title,
        iconDay: item.iconDay,
        iconNight: item.iconNight
    }));


    const showNavbar = true;


    const handleNavClick = (id: string) => {
        navigate(id);
    }

    return (
        <div className="layout">
            <Header />

            {showNavbar && (
                <Navbar
                    items={navbarItems}
                    activeId={location.pathname}
                    onScroll={handleNavClick}
                />
            )}

            <main className="content">
                <Outlet />
            </main>
        </div>
    );
};

export default RootLayout;