import { Outlet } from "react-router-dom";


const AuthLayout = () => {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
            }}
        >
            <Outlet />
        </div>
    );
};

export default AuthLayout;