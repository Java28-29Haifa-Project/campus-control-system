import {useAppDispatch, useAppSelector} from "../../state/hooks.ts";
import {useEffect} from "react";
import {verifyTokenThunk} from "../../state/slices/authSlice.ts";
import { useNavigate } from "react-router-dom";

const AuthVerify = () => {

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isVerified, error }= useAppSelector(state => state.auth);

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