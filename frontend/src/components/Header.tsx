import {useAppDispatch, useAppSelector} from "../state/hooks.ts";
import {logoutThunk} from "../state/slices/authSlice.ts";
import React from "react";

type HeaderProps = {
    onToggleSidebar: () => void;
};

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
    const auth = useAppSelector(state => state.auth.user);
    const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
    const dispatch = useAppDispatch();

    return (
        <header className="header">
            <button onClick={onToggleSidebar} className="burger-btn">☰</button>
            <div className="header-left">LOGO</div>
            <div className="header-center">Campus Control System</div>
            <div>
                {auth? <p>Hello, {auth.userId}</p> : <p>Hello, guest</p>}
            </div>
            <div className="header-right">
                {isAuthenticated && <button onClick={() => {
                    dispatch(logoutThunk());
                }} className="logout-btn">Logout</button> }
            </div>
        </header>

    );
};

export default Header;