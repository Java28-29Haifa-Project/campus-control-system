import './App.css'
import {Routes, Route} from "react-router-dom";
import {useState} from "react";
import Home from "./pages/Home.tsx";
import Ticket from "./pages/Ticket.tsx";
import Incident from "./pages/Incident.tsx";
import Profile from "./pages/Profile.tsx";
import Alarm from "./pages/servicePages/Alarm.tsx";
import HealthPage from "./pages/servicePages/HealthPage.tsx";
import RootLayout from "./layouts/RootLayout.tsx";
import ErrorPage from "./pages/servicePages/ErrorPage.tsx";
import {navItem} from "./components/configurations/nav-config.ts";
import AuthVerify from "./pages/servicePages/AuthVerify.tsx";
import {Paths} from "./utils/types.ts";
import ProtectedRoute from "./pages/servicePages/ProtectedRoute.tsx";

function App() {

    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    return (
        <div>
            <AuthVerify />
            <Routes>

                <Route path={Paths.HOME} element={
                    <RootLayout
                        items={navItem}
                        isDarkMode={isDarkMode}
                        onToggleTheme={toggleTheme}
                    />
                }>
                    <Route index element={<Home isDarkMode={isDarkMode}/>}/>
                    <Route path={Paths.HEALTH} element={<HealthPage/>}/>

                    <Route path={Paths.PROFILE} element={
                        <ProtectedRoute>
                            <Profile/>
                        </ProtectedRoute>
                    }/>
                    <Route path={Paths.TICKET} element={
                        <ProtectedRoute allowedRoles={['ADMIN','USER']}>
                            <Ticket/>
                        </ProtectedRoute>
                    }/>
                    <Route path={Paths.INCIDENT} element={
                        <ProtectedRoute allowedRoles={["SUPPORT", "ENGINEER", "ADMIN"]}>
                            <Incident/>
                        </ProtectedRoute>
                    }/>
                    <Route path={Paths.ALARM} element={
                        <ProtectedRoute allowedRoles={["ENGINEER", "ADMIN"]}>
                            <Alarm/>
                        </ProtectedRoute>
                    }/>

                </Route>

                <Route path='*' element={<ErrorPage />}/>
            </Routes>
        </div>
    )
}

export default App

