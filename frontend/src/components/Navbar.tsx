import * as React from "react";
import { useState } from "react";


type NavItem = {
    path: string;
    title: string;
}

type Props = {
    items: NavItem[];
    onScroll?: (id: string) => void;
    activeId?: string;
};

const Navbar: React.FC<Props> = ({ items, onScroll, activeId }) => {
    const [isOpen, setIsOpen] = useState(true);

    const handleClick = (id: string) => {
        if (onScroll) {
            onScroll(id);
        }
    };

    return (
        <nav className={`navbar ${isOpen ? "" : "closed"}`}>
            <button
                className="navbar-toggle"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? ">" : "<"}
            </button>

            <div className="navbar-items">
                {items.map(item => (
                    <div
                        key={item.path}

                        className={`navbar-link ${activeId === item.path ? "active" : ""}`}
                        onClick={() => handleClick(item.path)}
                        style={{ cursor: 'pointer' }}
                    >
                        {item.title}
                    </div>
                ))}
            </div>
        </nav>
    )
}
export default Navbar;