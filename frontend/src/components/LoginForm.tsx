import {FaLock} from "react-icons/fa";
import {MdEmail} from "react-icons/md";
import './../styles/forms.css';
import {type FormEvent, useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../state/hooks.ts";
import {loginThunk} from "../state/slices/authSlice.ts";
import {Paths} from "../types/types.ts";
import {validateLogin} from "../utils/validation.ts";


const LoginForm = () => {

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorValidation, setErrorValidation] = useState<string | null>(null);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const isLoading = useAppSelector(state => state.auth.isLoading);
    const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
    const authError = useAppSelector(state => state.auth.error);


    const onSubmitLogin = async (e: FormEvent) => {
        e.preventDefault();

        const errorMsg = validateLogin({email, password});
        if (errorMsg) {
            setErrorValidation(errorMsg);
            return;
        }
        setErrorValidation(null)

        dispatch(loginThunk({email, password}));
    }

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard", {replace: true});
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="auth-page">
            <div className='login-wrapper'>
                <form onSubmit={onSubmitLogin} noValidate>
                    <h1>Login</h1>

                    <div className="input-box">
                        <input
                            type="email"
                            autoComplete="email"
                            required
                            placeholder='Email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <MdEmail className='icon'/>
                    </div>
                    <div className="input-box">
                        <input
                            type="password"
                            autoComplete="current-password"
                            placeholder='Password'
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <FaLock className='icon'/>
                    </div>

                    {errorValidation &&
                        <div className="error-message">
                            {errorValidation}
                        </div>
                    }

                    {authError && <div className="error-message">{authError}</div>}

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Login"}
                    </button>

                    {!isAuthenticated && <div className="register-link">
                        <p>Don't have an account?

                            <Link to={Paths.REGISTER}>Register</Link></p>
                    </div>}

                </form>
            </div>
        </div>
    );
};

export default LoginForm;
