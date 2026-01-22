
import { FaUser, FaLock } from "react-icons/fa";
import './../styles/forms.css';
import {type FormEvent, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../state/hooks.ts";
import {loginThunk} from "../state/slices/authSlice.ts";


const LoginForm= () => {

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const isLoading = useAppSelector(state => state.auth.isLoading);
    const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
    const authError = useAppSelector(state => state.auth.error);


    const onSubmitLogin = async (e: FormEvent) => {
        e.preventDefault();
        dispatch(loginThunk({email, password}));
    }

    useEffect(() => {
        if (isAuthenticated){
            navigate("/dashboard", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="auth-page">
                <div className='login-wrapper'>
                    <form onSubmit={onSubmitLogin}>
                        <h1>Login</h1>

                        <div className="input-box">
                            <input
                                type="Email"
                            placeholder='Email'
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            />
                            <FaUser className='icon'/>
                        </div>
                        <div className="input-box">
                            <input
                                type="password"
                                placeholder='Password'
                                required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            />
                            <FaLock className='icon'/>
                            </div>

                            {/*<div className="remember-forgot">*/}
                            {/*  <label><input type="checkbox"/>Remember me</label>*/}
                            {/*    <a href="#">Forgot password?</a>*/}
                            {/*</div>*/}

                            {authError && <div>{authError}</div>}

                            <button type="submit" disabled={isLoading}>
                            {isLoading ? "Logging in..." : "Login"}
                            </button>

                            {/*<div className="register-link">*/}
                            {/*    <p>Don't have an account?*/}
                            {/*    <a href="#">Register</a></p>*/}
                            {/*</div>*/}
                    </form>
                </div>
        // </div>
                );
                };

export default LoginForm;
