import { NavLink } from "react-router-dom";
import type { RouteType } from "../utils/types";
import * as React from "react";

type Props = {
    items: RouteType[];
};

const Navbar: React.FC<Props> = ({ items }) => {
    return (
        <nav className="navbar">
            <ul>
                {items.map((item) => (
                    <li key={item.path}>
                        <NavLink to={item.path}>
                            {item.title}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Navbar;
