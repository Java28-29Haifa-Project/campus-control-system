import React, { type PropsWithChildren } from 'react';
import type {User} from "../../types/authTypes.ts";
import {useAppSelector} from "../../state/hooks.ts";
import {Paths} from "../../utils/types.ts";
import { Navigate, useLocation } from "react-router-dom";

type ProtectedRouteProps = PropsWithChildren & {
    allowedRoles?: User["role"][];
};

const ProtectedRoute:React.FC<ProtectedRouteProps> = ({allowedRoles, children}) => {

    const location = useLocation();

    const isVerified = useAppSelector(state => state.auth.isVerified);
    const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
    const user = useAppSelector(state => state.auth.user);

    if (isVerified === "loading") {
        return <div>Loading...</div>;
    }
    if(isVerified === "failed") {
        return <Navigate to={Paths.HOME} replace/>
    }

    if(!isAuthenticated || !user){
        return <Navigate to={Paths.HEALTH}
        state={{from:location}}
        replace/>
    }

    if(allowedRoles && !allowedRoles.includes(user.role)){
        return <Navigate to='/error' state={{ code:403 }} replace/>;
    }

    return children;
};

export default ProtectedRoute;