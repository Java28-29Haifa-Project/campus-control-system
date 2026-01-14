
import { FaUser, FaLock } from "react-icons/fa";
import './loginForm.css';
import {type FormEvent, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import * as React from "react";

import frameDay from "../../assets/images/panelLogin.png";
import frameNight from "../../assets/images/panelLoginNight.png";
import {useAppDispatch, useAppSelector} from "../../state/hooks.ts";
import {loginThunk} from "../../state/slices/authSlice.ts";

type Props = {
    isDarkMode: boolean;
    onPlayClick: () => void;
};

const LoginForm: React.FC<Props> = ({ isDarkMode, onPlayClick }) => {

    const currentFrame = isDarkMode ? frameNight : frameDay;

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
            navigate("/ticket", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    return (
                <div className='wrapper'>
                    <img src={currentFrame} alt="" className="frame-bg"/>
                    <form onSubmit={onSubmitLogin}>
                        <h1>Login</h1>

                        <div className="input-box">
                            <input
                                type="Email"
                            placeholder='Email'
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onClick={onPlayClick}
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
                            onClick={onPlayClick}
                            />
                            <FaLock className='icon'/>
                            </div>

                            {/*<div className="remember-forgot">*/}
                            {/*  <label><input type="checkbox"/>Remember me</label>*/}
                            {/*    <a href="#">Forgot password?</a>*/}
                            {/*</div>*/}

                            {authError && <div>{authError}</div>}

                            <button type="submit" onClick={onPlayClick} disabled={isLoading}>
                            {isLoading ? "Logging in..." : "Login"}
                            </button>

                            {/*<div className="register-link">*/}
                            {/*    <p>Don't have an account?*/}
                            {/*    <a href="#">Register</a></p>*/}
                            {/*</div>*/}
                    </form>
                </div>
                );
                };

export default LoginForm;
