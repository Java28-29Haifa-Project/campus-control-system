import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import './../styles/forms.css';
import { type FormEvent, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../state/hooks.ts";
import { registerThunk } from "../state/slices/authSlice.ts";
import ThemedLayout from "./ThemedLayout";

const RegisterForm = () => {
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPass, setConfirmPass] = useState<string>('');

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { isLoading, isAuthenticated, error } = useAppSelector(state => state.auth);

    const onSubmitRegister = async (e: FormEvent) => {
        e.preventDefault();

        if(password !== confirmPass) {
            alert("Passwords do not match!");
            return;
        }


        dispatch(registerThunk({ name, email, password }));
    }


    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    return (

        <ThemedLayout imageName="Dorfic">

            <div className='login-wrapper'>
                <form onSubmit={onSubmitRegister}>
                    <h1>Register</h1>


                    <div className="input-box">
                        <input
                            type="text"
                            placeholder='Username'
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <FaUser className='icon'/>
                    </div>


                    <div className="input-box">
                        <input
                            type="email"
                            placeholder='Email'
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <FaEnvelope className='icon'/>
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


                    <div className="input-box">
                        <input
                            type="password"
                            placeholder='Confirm Password'
                            required
                            value={confirmPass}
                            onChange={(e) => setConfirmPass(e.target.value)}
                        />
                        <FaLock className='icon'/>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Creating Account..." : "Sign Up"}
                    </button>


                    <div style={{textAlign: 'center', marginTop: '15px', fontSize: '14px', opacity: 0.8}}>
                        <p>Already have an account? <Link to="/" style={{color: '#FF8A00', fontWeight: 'bold', textDecoration: 'none'}}>Login</Link></p>
                    </div>

                </form>
            </div>
        </ThemedLayout>
    );
};

export default RegisterForm;
