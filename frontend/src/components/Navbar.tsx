import * as React from "react";
import { useTheme } from "../context/ThemeContext";

export type NavItem = {
    id: string;
    title: string;
    iconDay?: string;
    iconNight?: string;
    component?: React.ReactNode;
}

type Props = {
    items: NavItem[];
    onScroll?: (id: string) => void;
    activeId?: string;
};

const Navbar: React.FC<Props> = ({ items, onScroll, activeId }) => {
    const { navPosition, navScale, isNavOpen, theme } = useTheme();

    const handleClick = (id: string) => {
        if (onScroll) onScroll(id);
    };

    return (
        <nav
            className={`navbar ${navPosition} ${isNavOpen ? "open" : "closed"}`}
            style={{
                '--nav-scale': navScale,
                transform: (navPosition === 'bottom' || navPosition === 'top')
                    ? `translateX(-50%) scale(${navScale})`
                    : `translateY(-50%) scale(${navScale})`
            } as React.CSSProperties}
        >
            <div className="navbar-items">
                {items.map(item => {
                    const currentIcon = theme === 'day' ? item.iconDay : item.iconNight;


                    const isNewTicket = item.id.includes('/new') || item.title === "NEW TICKET";

                    return (
                        <div
                            key={item.id}
                            className={`navbar-link ${activeId === item.id ? "active" : ""}`}
                            onClick={() => handleClick(item.id)}
                        >

                            <span className="nav-text">{item.title}</span>


                            {currentIcon && (
                                <img
                                    src={currentIcon}
                                    alt={item.title}
                                    className="mobile-icon"
                                    style={{

                                        transform: isNewTicket ? 'rotate(180deg)' : 'none',
                                        transition: 'transform 0.3s ease'
                                    }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </nav>
    )
}
export default Navbar;