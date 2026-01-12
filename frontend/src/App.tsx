import './App.css'
import {Routes, Route, useNavigate, useLocation} from "react-router-dom";
import {useEffect, useState} from "react";
import Home from "./pages/Home.tsx";
import Ticket from "./pages/Ticket.tsx";
import Incident from "./pages/Incident.tsx";
import Profile from "./pages/Profile.tsx";
import Alarm from "./pages/servicePages/Alarm.tsx";
import HealthPage from "./pages/servicePages/HealthPage.tsx";
import RootLayout from "./layouts/RootLayout.tsx";
import ErrorPage from "./pages/servicePages/ErrorPage.tsx";
import {navItem} from "./components/configurations/nav-config.ts";

function App() {
    const location = useLocation();
    const navigate = useNavigate();


    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    useEffect(() => {
        if(location.pathname === '/error')
            navigate('/');
    }, []);

    return (
        <div>
            <Routes>

                <Route path={'/'} element={
                    <RootLayout
                        items={navItem}
                        isDarkMode={isDarkMode}
                        onToggleTheme={toggleTheme}
                    />
                }>
                    <Route index element={<Home isDarkMode={isDarkMode}/>}/>
                    <Route path='ticket' element={<Ticket/>}/>
                    <Route path='incident' element={<Incident/>}/>
                    <Route path='profile' element={<Profile/>}/>
                    <Route path='alarm' element={<Alarm/>}/>
                    <Route path='health' element={<HealthPage/>}/>
                </Route>

                <Route path='*' element={<ErrorPage/>}/>
            </Routes>
        </div>
    )
}

export default App

