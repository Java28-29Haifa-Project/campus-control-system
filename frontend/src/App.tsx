import './App.css'
import Home from "./pages/Home.tsx";
import {Routes, Route, useNavigate, useLocation} from "react-router-dom";
import Ticket from "./pages/Ticket.tsx";
import Incident from "./pages/Incident.tsx";
import Profile from "./pages/Profile.tsx";
import Alarm from "./pages/servicePages/Alarm.tsx";
import HealthPage from "./pages/servicePages/HealthPage.tsx";
import RootLayout from "./layouts/RootLayout.tsx";
import ErrorPage from "./pages/servicePages/ErrorPage.tsx";
import {useEffect} from "react";
import {navItem} from "./components/configurations/nav-config.ts";

function App() {

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if(location.pathname === '/error')
            navigate('/');
    }, [])


    return (
        <div>
            <div >
                <Routes>
                    <Route path={'/'} element={<RootLayout items={navItem}/>}>
                        <Route index element={<Home/>}/>
                        <Route path='ticket' element={<Ticket/>}/>
                        <Route path='incident' element={<Incident/>}/>
                        <Route path='profile' element={<Profile/>}/>
                        <Route path='alarm' element={<Alarm/>}/>
                        <Route path='health' element={<HealthPage/>}/>
                    </Route>

                    <Route path='*' element={<ErrorPage/>}/>
                </Routes>
            </div>
        </div>
    )
}

export default App
