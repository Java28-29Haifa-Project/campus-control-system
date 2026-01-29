import {useAppDispatch, useAppSelector} from "../state/hooks.ts";
import {logoutThunk} from "../state/slices/authSlice.ts";

const Header = () => {
    const auth = useAppSelector(state => state.auth.user);
    const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
    const dispatch = useAppDispatch();

    return (
        <header className="header">
            <div className="header-left">LOGO</div>
            <div className="header-center">Campus Control System</div>
            <div>
                {auth? <p>Hello, {auth.username}</p> : <p>Hello, guest</p>}
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