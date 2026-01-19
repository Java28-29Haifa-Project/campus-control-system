
import { NavLink } from "react-router-dom";
import type { RouteType } from "../utils/types";
import * as React from "react";

type Props = {
    items: RouteType[];
};
const Navbar: React.FC<Props> = ({ items }) => {

    return (
        <nav className="navbar">
            {items.map(item => (
                <NavLink
                    key={item.path}
                    className="navbar-link"
                    to={item.path}
                >
                    {item.title}
                </NavLink>
            ))}
        </nav>
    )
}
export default Navbar;