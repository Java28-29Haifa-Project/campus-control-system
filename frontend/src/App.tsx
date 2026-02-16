import './App.css'
import {Routes, Route} from "react-router-dom";


import RootLayout from "./layouts/RootLayout.tsx";
import AuthLayout from "./layouts/AuthLayout.tsx";
import ProtectedRoute from "./layouts/ProtectedRoute.tsx";


import LoginForm from "./components/LoginForm.tsx";
import RegisterForm from "./components/RegisterForm.tsx";
import ThemeSettings from "./components/ThemeSettings";
import { ThemeProvider } from "./context/ThemeContext";


import ErrorPage from "./pages/servicePages/ErrorPage.tsx";
import AuthVerify from "./pages/servicePages/AuthVerify.tsx";
import Dashboard from "./pages/Dashboard.tsx";


import Ticket from "./pages/userPages/Ticket.tsx";
import TicketFormPage from "./pages/userPages/TicketFormPage.tsx";
import TicketDetailsPage from "./pages/userPages/TicketDetailsPage.tsx";
import ProfilePage from "./pages/userPages/ProfilePage.tsx";


import TicketSupport from "./pages/supportPages/TicketSupport.tsx";
import CreateIncident from "./pages/supportPages/CreateIncident.tsx";


import IncidentEngineer from "./pages/engineerPages/IncidentEngineer.tsx";
import Incident from "./pages/engineerPages/Incident.tsx";


import Alarm from "./pages/adminPages/Alarm.tsx";
import Logs from "./pages/adminPages/Logs.tsx";
import HealthPage from "./pages/servicePages/health/HealthPage.tsx";


import {Paths} from "./utils/types.ts";

function App() {
    return (
        <ThemeProvider>

            <ThemeSettings />

            <Routes>


                <Route path={Paths.HOME} element={<AuthLayout/>}>
                    <Route index element={<LoginForm/>}/>
                    <Route path="register" element={<RegisterForm/>}/>
                </Route>


                <Route element={
                    <>
                        <AuthVerify/>
                        <RootLayout/>
                    </>
                }>


                    <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'USER', 'SUPPORT', 'ENGINEER']} />}>
                        <Route path={Paths.DASHBOARD} element={<Dashboard/>}/>

                        <Route path={Paths.PROFILE} element={<ProfilePage/>}/>
                    </Route>


                    <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'USER']}/>}>
                        <Route path={Paths.TICKET} element={<Ticket/>}/>
                        <Route path={Paths.TICKET_NEW} element={<TicketFormPage/>}/>
                        <Route path={Paths.TICKET_DETAILS} element={<TicketDetailsPage/>}/>
                    </Route>


                    <Route element={<ProtectedRoute allowedRoles={['SUPPORT', 'ADMIN']} />}>
                        <Route path={Paths.TICKET_SUPPORT} element={<TicketSupport/>}/>
                        <Route path={Paths.INCIDENT_NEW} element={<CreateIncident/>}/>
                    </Route>


                    <Route element={<ProtectedRoute allowedRoles={['ENGINEER', 'ADMIN']} />}>
                        <Route path={Paths.INCIDENT} element={<Incident/>}/>
                        <Route path={Paths.INCIDENT_MY} element={<IncidentEngineer/>}/>
                        <Route path={Paths.ALARM} element={<Alarm/>}/>
                    </Route>


                    <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                        <Route path={Paths.LOGS} element={<Logs/>}/>
                        <Route path={Paths.HEALTH} element={<HealthPage/>}/>
                    </Route>

                </Route>


                <Route path='*' element={<ErrorPage/>}/>

            </Routes>
        </ThemeProvider>
    )
}

export default App

