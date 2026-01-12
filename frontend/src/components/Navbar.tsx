
import { NavLink } from "react-router-dom";
import type { RouteType } from "../utils/types";
import * as React from "react";

import panelDay from "../assets/images/panel.png";

import panelNight from "../assets/images/panelNight.png";

import btnHome from "../assets/images/buttonHome.png";

import btnTicket from "../assets/images/buttonTicket.png";

import btnIncident from "../assets/images/buttonIncident.png";

import btnProfile from "../assets/images/buttonProfile.png";

import btnAlarm from "../assets/images/buttonAlarm.png";

import btnHealth from "../assets/images/buttonHealth.png";

type Props = {
    items: RouteType[];
    isDarkMode: boolean;
    onPlayClick: () => void;
};

const Navbar: React.FC<Props> = ({ items, isDarkMode, onPlayClick }) => {

    const currentPanel = isDarkMode ? panelNight : panelDay;

    const getButtonImage = (title: string) => {
        switch (title.toLowerCase()) {
            case 'home': return btnHome;
            case 'ticket': return btnTicket;
            case 'incident': return btnIncident;
            case 'profile': return btnProfile;
            case 'alarm': return btnAlarm;
            case 'health': return btnHealth;
            default: return btnHome;
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-panel" style={{ backgroundImage: `url(${currentPanel})` }}>
                <ul className="navbar-list">
                    {items.map((item) => (
                        <li key={item.path} className={`nav-item item-${item.title.toLowerCase()}`}>
                            <NavLink
                                to={item.path}
                                onClick={onPlayClick}
                                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                                style={{ backgroundImage: `url(${getButtonImage(item.title)})` }}
                            >
                                <span className="sr-only">{item.title}</span>
                                <div className="led-light"></div>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
