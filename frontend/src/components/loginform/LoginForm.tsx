
import { FaUser, FaLock } from "react-icons/fa";
import './loginForm.css';
import {type FormEvent, useState} from "react";
import {login} from "../../api/authApi.ts";
import {useNavigate} from "react-router-dom";
import * as React from "react";

import frameDay from "../../assets/images/panelLogin.png";
import frameNight from "../../assets/images/panelLoginNight.png";
import ApiError, {LOGIN_ERROR_MESSAGES} from "../../utils/ApiError.ts";

type Props = {
    isDarkMode: boolean;
    onPlayClick: () => void;
};

const LoginForm: React.FC<Props> = ({ isDarkMode, onPlayClick }) => {

    const currentFrame = isDarkMode ? frameNight : frameDay;

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);


    const navigate = useNavigate();

    const onSubmitLogin = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await login({email, password});
            console.log("Login success");
            navigate("/ticket");
        } catch (err) {
            console.log("Login error", err);

            if( err instanceof ApiError) {
                const messageFromCode = LOGIN_ERROR_MESSAGES[err.code];
                if (messageFromCode) {
                    setError(messageFromCode);
                    return;
                }
                if(err.status === 401) {
                    setError(LOGIN_ERROR_MESSAGES.UNAUTHORIZED);
                }
                else if(err.status >= 500) {
                    setError(LOGIN_ERROR_MESSAGES.SERVER_ERROR);
                }
                else
                    setError("Unexpected error");
            }

        } finally {
            setLoading(false);
        }
    }


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

                            {error && <div>{error}</div>}

                            <button type="submit" onClick={onPlayClick} disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
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
