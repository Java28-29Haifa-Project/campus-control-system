import React from 'react';
import { Navigate, Outlet, useLocation } from "react-router-dom";
import {useAppSelector} from "../state/hooks.ts";
import type {User} from "../types/authTypes.ts";
import {Paths} from "../types/types.ts";

type ProtectedRouteProps = {
    allowedRoles?: User["role"][];
};

const ProtectedRoute:React.FC<ProtectedRouteProps> = ({allowedRoles}) => {

    const location = useLocation();

    const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
    const user = useAppSelector(state => state.auth.user);

        if (!isAuthenticated || !user) {
            return <Navigate to={Paths.HOME}
                             state={{from: location}}
                             replace/>
        }

        if (allowedRoles && !allowedRoles.includes(user.role)) {
            return <Navigate to='/error' state={{code: 403}} replace/>;
        }

        return <Outlet/>;

};

export default ProtectedRoute;