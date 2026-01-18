import {useAppDispatch, useAppSelector} from "../../state/hooks.ts";
import {useEffect} from "react";
import {verifyTokenThunk} from "../../state/slices/authSlice.ts";
import { useNavigate } from "react-router-dom";

const AuthVerify = () => {

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const isVerified = useAppSelector(state => state.auth.isVerified);
    const error = useAppSelector(state => state.auth.error);

    useEffect(() => {
            dispatch(verifyTokenThunk())
    }, [dispatch]);

    useEffect(() => {
        if(isVerified === "failed" && error) {
            navigate("/", {replace: true});
        }
    }, [isVerified, error, navigate]);

    if (isVerified === "loading") {
        return <div>Loading...</div>;
    }
    return null;
};

export default AuthVerify;