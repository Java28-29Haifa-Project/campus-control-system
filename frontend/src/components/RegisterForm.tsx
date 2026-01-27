
import { FaUser, FaLock} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import './../styles/forms.css';
import {useState, type FormEvent} from "react";
import {Link} from "react-router-dom";
import {Paths} from "../types/types.ts";
import {useAppDispatch, useAppSelector} from "../state/hooks.ts";
import {registerThunk} from "../state/slices/authSlice.ts";

const RegisterForm= () => {

    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const dispatch= useAppDispatch();
    const {isLoading, error} = useAppSelector(state => state.auth);

    const onSubmitRegister = async (e: FormEvent ) => {
        e.preventDefault();
        dispatch(registerThunk({name, email, password}));
    }

    return (
        <div className="auth-page">
                <div className='login-wrapper'>
                    <form onSubmit={onSubmitRegister}>
                        <h1>Register</h1>

                        <div className="input-box">
                            <input
                                type="name"
                                placeholder='Name'
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
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            />
                            <MdEmail className='icon'/>
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

                        {error && <div>{error}</div>}

                            <button type="submit" >
                                {isLoading? "Registering..." : "Register"}
                            </button>

                        <div className="register-link">
                                <Link to={Paths.HOME}>Back to login</Link>
                        </div>
                    </form>
                </div>
        // </div>
                );
                };

export default RegisterForm;
