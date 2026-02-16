import {useAppDispatch, useAppSelector} from "../state/hooks.ts";
import {logoutThunk} from "../state/slices/authSlice.ts";
import { useTheme } from "../context/ThemeContext";
import dorficDay from "../assets/images/DorficDay.png";
import dorficNight from "../assets/images/DorficNight.png";
import confetti from 'canvas-confetti';

const Header = () => {
    const auth = useAppSelector(state => state.auth.user);
    const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
    const dispatch = useAppDispatch();

    const { theme } = useTheme();
    const currentLogo = theme === 'day' ? dorficDay : dorficNight;

    const fireConfetti = () => {
        confetti({
            particleCount: 40,
            spread: 45,
            startVelocity: 30,
            origin: { x: 0.08, y: 0.15 },
            colors: ['#FFB800', '#FF8A00', '#ffffff'],
            shapes: ['square', 'circle'],
            gravity: 1.5,
            scalar: 0.8,
            ticks: 200,
            disableForReducedMotion: true
        });
    };

    return (
        <header className="header">
            <div className="header-left">
                <img
                    src={currentLogo}
                    alt="Dorfic Logo"
                    className="header-logo-img"
                    onClick={fireConfetti}
                />
            </div>

            <div className="header-user-panel">
                <div style={{
                    opacity: 0.9,
                    fontSize: '15px',
                    fontWeight: 'bold',
                    letterSpacing: '0.5px',
                    textAlign: 'right',
                    whiteSpace: 'nowrap'
                }}>

                    {auth ? <span>Hello, {auth.username || auth.email}!</span> : <span>Guest</span>}
                </div>

                {isAuthenticated && (
                    <button
                        onClick={() => dispatch(logoutThunk())}
                        className="juicy-btn"
                    >
                        Logout
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;