import { FaUser, FaLock } from "react-icons/fa";
import './../styles/forms.css';
import {type FormEvent, useEffect, useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../state/hooks.ts";
import {loginThunk} from "../state/slices/authSlice.ts";
import ThemedLayout from "./ThemedLayout";

const LoginForm = () => {

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

        <ThemedLayout imageName="Dorfic">
            <div className='login-wrapper'>
                <form onSubmit={onSubmitLogin}>
                    <h1>Login</h1>

                    <div className="input-box">
                        <input
                            type="email"
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

                    {authError && <div className="error-message">{authError}</div>}

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Login"}
                    </button>


                    <div style={{textAlign: 'center', marginTop: '20px', fontSize: '14px', opacity: 0.8}}>
                        <p>Don't have an account? <Link to="/register" style={{color: '#FF8A00', fontWeight: 'bold', textDecoration: 'none'}}>Register</Link></p>
                    </div>

                </form>
            </div>
        </ThemedLayout>
    );
};

export default LoginForm;
