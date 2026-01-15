import {useAppDispatch, useAppSelector} from "../state/hooks.ts";
import {logout} from "../state/slices/authSlice.ts";

const Ticket = () => {

    const auth = useAppSelector(state => state.auth.user);
    const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
    const dispatch = useAppDispatch();

    return (
        <div className="wrapper">
            <h1>Ticket page</h1>
            {auth? <p>Hello {auth.email}</p> : <p>Hello guest</p>}
            {isAuthenticated && <button onClick={() => {
                dispatch(logout());
            }} >Logout</button> }

        </div>
    );
};

export default Ticket;