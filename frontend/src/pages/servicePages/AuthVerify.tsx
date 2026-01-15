import {useAppDispatch, useAppSelector} from "../../state/hooks.ts";
import {useEffect} from "react";
import {verifyTokenThunk} from "../../state/slices/authSlice.ts";

const AuthVerify = () => {

    const dispatch = useAppDispatch();
    const isVerified = useAppSelector(state => state.auth.isVerified);
    useEffect(() => {
        if(isVerified === "idle")
            dispatch(verifyTokenThunk())
    }, [dispatch, isVerified]);

    if (isVerified === "loading") {
        return <div>Loading...</div>;
    }
    return null;
};

export default AuthVerify;