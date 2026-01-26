import {Outlet} from "react-router-dom";
import * as React from "react";
import Navbar from "../components/Navbar.tsx";
import Header from "../components/Header.tsx";
import {useAppSelector} from "../state/hooks.ts";
import {
    adminNavItem,
    engineerNavItems,
    supportNavItems,
    userNavItems
} from "../components/configurations/nav-config.ts";
import type {RouteType} from "../types/types.ts";

const RootLayout: React.FC = () => {

    const user = useAppSelector((state) => state.auth.user);

    let items: RouteType[] = [];

    if(user) {
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

    return (
        <div className="layout">
            <Header/>
            <Navbar items={items}/>
            <main className="content">
                <Outlet/>
            </main>
        </div>
    );
};

export default RootLayout;