import './App.css'
import {Routes, Route} from "react-router-dom";
import RootLayout from "./layouts/RootLayout.tsx";
import ErrorPage from "./pages/servicePages/ErrorPage.tsx";
import {Paths} from "./utils/types.ts";
import ProtectedRoute from "./pages/servicePages/ProtectedRoute.tsx";
import AuthLayout from "./layouts/AuthLayout.tsx";
import LoginForm from "./components/loginform/LoginForm.tsx";
import AuthVerify from "./pages/servicePages/AuthVerify.tsx";
import HealthPage from "./pages/servicePages/health/HealthPage.tsx";
import Ticket from "./pages/userPages/Ticket.tsx";
import TicketSupport from "./pages/supportPages/TicketSupport.tsx";
import CreateIncident from "./pages/supportPages/CreateIncident.tsx";
import CreateTicket from "./pages/userPages/TicketNew.tsx";
import IncidentEngineer from "./pages/engineerPages/IncidentEngineer.tsx";
import Incident from "./pages/engineerPages/Incident.tsx";
import Alarm from "./pages/adminPages/Alarm.tsx";
import Logs from "./pages/adminPages/Logs.tsx";
import Dashboard from "./pages/Dashboard.tsx";

function App() {

    return (
        <Routes>
            <Route path={Paths.HOME} element={<AuthLayout/>}>
                <Route index element={<LoginForm/>}/>
            </Route>

            <Route element={
                <>
                    <AuthVerify/>
                    <RootLayout/>
                </>
            }>
                <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'USER', 'SUPPORT', 'ENGINEER']} />}>
                    <Route path={Paths.DASHBOARD} element={<Dashboard/>}/>
                </Route>

                <Route element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'USER']}/>}>
                        <Route path={Paths.TICKET} element={<Ticket/>}/>
                        <Route path={Paths.TICKET_NEW} element={<CreateTicket/>}/>
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
    )
}

export default App

