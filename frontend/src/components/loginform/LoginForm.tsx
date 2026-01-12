
import { FaUser, FaLock } from "react-icons/fa";
import './loginForm.css';
import * as React from "react";

import frameDay from "../../assets/images/panelLogin.png";
import frameNight from "../../assets/images/panelLoginNight.png";

type Props = {
    isDarkMode: boolean;
    onPlayClick: () => void;
};

const LoginForm: React.FC<Props> = ({ isDarkMode, onPlayClick }) => {

    const currentFrame = isDarkMode ? frameNight : frameDay;

    return (
        <div className='wrapper'>
            <img src={currentFrame} alt="" className="frame-bg" />

            <form action="">
                <h1>Login</h1>
                <div className="input-box">
                    <input
                        type="text"
                        placeholder='Username'
                        required
                        onClick={onPlayClick}
                    />
                    <FaUser className='icon' />
                </div>
                <div className="input-box">
                    <input
                        type="password"
                        placeholder='Password'
                        required
                        onClick={onPlayClick}
                    />
                    <FaLock className='icon'/>
                </div>
                <div className="remember-forgot">
                    <label>
                        <input type="checkbox" onClick={onPlayClick}/>
                        Remember me
                    </label>
                    <a href="#" onClick={onPlayClick}>Forgot password?</a>
                </div>

                <button type="submit" onClick={onPlayClick}>Login</button>

                <div className="register-link">
                    <p>Don't have an account?
                        <a href="#" onClick={onPlayClick}>Register</a></p>
                </div>
            </form>
        </div>
    );
};

export default LoginForm;
