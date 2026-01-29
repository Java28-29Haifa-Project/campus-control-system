
import { FaUser, FaLock} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import './../styles/forms.css';
import {useState, type FormEvent, useEffect} from "react";
import {Link, useNavigate} from "react-router-dom";
import {Paths} from "../types/types.ts";
import {useAppDispatch, useAppSelector} from "../state/hooks.ts";
import {loginThunk, registerThunk} from "../state/slices/authSlice.ts";
import {validateLogin, validateName} from "../utils/validation.ts";

const RegisterForm= () => {

    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorValidate, setErrorValidate] = useState<string | null>(null);

    const navigate = useNavigate();

    const dispatch= useAppDispatch();
    const {isLoading, error, isAuthenticated} = useAppSelector(state => state.auth);

    const onSubmitRegister = async (e: FormEvent ) => {
        e.preventDefault();

        const msgName = validateName(name);
        const msgError = validateLogin({email, password});
        if(msgName){
            setErrorValidate(msgName);
            return;
        }
        if(msgError){
            setErrorValidate(msgError);
            return;
        }
        setErrorValidate(null);

        try{
            await dispatch(registerThunk({name, email, password})).unwrap();
            await dispatch(loginThunk({email, password})).unwrap();
        } catch (e) {
            console.log(e);
        }
    }
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard", {replace: true});
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="auth-page">
                <div className='login-wrapper'>
                    <form onSubmit={onSubmitRegister} noValidate>
                        <h1>Register</h1>

                        <div className="input-box">
                            <input
                                type="name"
                                placeholder='Name'
                                autoComplete="name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <FaUser className='icon'/>
                        </div>

                        <div className="input-box">
                            <input
                                type="Email"
                            placeholder='Email'
                                autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            />
                            <MdEmail className='icon'/>
                        </div>
                        <div className="input-box">
                            <input
                                type="password"
                                autoComplete="new-password"
                                placeholder='Password'
                                required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            />
                            <FaLock className='icon'/>
                            </div>

                        {errorValidate && <div className="error-message">{errorValidate}</div> }

                        {error && <div className="error-message">{error}</div>}

                            <button type="submit" >
                                {isLoading? "Registering..." : "Register"}
                            </button>

                        <div className="register-link">
                                <Link to={Paths.HOME}>Back to login</Link>
                        </div>
                    </form>
                </div>
        </div>
                );
                };

export default RegisterForm;
