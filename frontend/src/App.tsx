import './App.css'
import {Routes, Route} from "react-router-dom";
import RootLayout from "./layouts/RootLayout.tsx";
import ErrorPage from "./pages/servicePages/ErrorPage.tsx";
import AuthLayout from "./layouts/AuthLayout.tsx";
import HealthPage from "./pages/servicePages/health/HealthPage.tsx";
import IncidentDetails from "./pages/engineerPages/IncidentDetails.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import LoginForm from "./components/LoginForm.tsx";
import {Paths} from "./types/types.ts";
import ProtectedRoute from "./layouts/ProtectedRoute.tsx";
import TicketFormPage from "./pages/userPages/TicketFormPage.tsx";
import RegisterForm from "./components/RegisterForm.tsx";
import IncidentTable from "./pages/engineerPages/IncidentsTable.tsx";
import TicketAdminTable from "./pages/adminPages/TicketAdminTable.tsx";
import IncidentAdminTable from "./pages/adminPages/IncidentAdminTable.tsx";
import Audit from "./pages/adminPages/Audit.tsx";
import UserAdminTable from "./pages/adminPages/UserAdminTable.tsx";
import AuthVerify from "./components/AuthVerify.tsx";
import TicketSupportDetailsPage from "./pages/supportPages/TicketSupportDetailsPage.tsx";
import CreateFormIncident from "./pages/supportPages/CreateFormIncident.tsx";
import TicketListPage from "./pages/userPages/TicketListPage.tsx";
import TicketDetailsPage from "./pages/userPages/TicketDetailsPage.tsx";
import TicketSupportTable from "./pages/supportPages/TicketSupportTable.tsx";

function App() {

    return (
        <Routes>
            <Route path={Paths.HOME} element={<AuthLayout/>}>
                <Route index element={<LoginForm/>}/>
                <Route path={Paths.REGISTER} element={<RegisterForm/>}/>
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
                        <Route path={Paths.TICKET} element={<TicketListPage/>}/>
                        <Route path={Paths.TICKET_NEW} element={<TicketFormPage/>}/>
                        <Route path={Paths.TICKET_DETAILS} element={<TicketDetailsPage/>}/>
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['SUPPORT', 'ADMIN']} />}>
                        <Route path={Paths.DASHBOARD_SUPPORT} element={<Dashboard/>}/>
                        <Route path={Paths.TICKET_SUPPORT} element={<TicketSupportTable />}/>
                        <Route path={Paths.INCIDENT_SUPPORT_NEW} element={<CreateFormIncident/>}/>
                        <Route path={Paths.TICKET_SUPPORT_DETAILS} element={<TicketSupportDetailsPage/>}/>
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['ENGINEER', 'ADMIN']} />}>
                    <Route path={Paths.INCIDENT} element={<IncidentTable/>}/>
                    <Route path={Paths.INCIDENT_DETAILS} element={<IncidentDetails/>}/>
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                    <Route path={Paths.USER_ADMIN} element={<UserAdminTable/>}/>
                    <Route path={Paths.TICKET_ADMIN} element={<TicketAdminTable/>}/>
                    <Route path={Paths.INCIDENT_ADMIN} element={<IncidentAdminTable/>}/>
                    <Route path={Paths.AUDIT} element={<Audit/>}/>
                    <Route path={Paths.HEALTH} element={<HealthPage/>}/>
                </Route>


            </Route>

            <Route path='*' element={<ErrorPage/>}/>
        </Routes>
    )
}

export default App

