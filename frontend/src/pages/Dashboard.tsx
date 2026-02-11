import { Link } from "react-router-dom";
import {useAppSelector} from "../state/hooks.ts";
import {Paths} from "../types/types.ts";


const Dashboard = () => {
    const user = useAppSelector(state => state.auth.user);

    if (!user) {
        return null;
    }

    return (
        <div style={{ padding: "24px" }}>
            <h1>Welcome, {user.username}!</h1>

            {user.role === "USER" && (
                <>
                    <p>You can manage your tickets here:</p>
                    <ul>
                        <li><Link to={Paths.TICKET}>My Tickets</Link></li>
                        <li><Link to={Paths.TICKET_NEW}>Create Ticket</Link></li>
                    </ul>
                </>
            )}

            {user.role === "SUPPORT" && (
                <>
                    <p>You can work with support tickets here:</p>
                    <ul>
                        <li><Link to={Paths.TICKET_SUPPORT}>Support Tickets</Link></li>
                    </ul>
                </>
            )}

            {user.role === "ENGINEER" && (
                <>
                    <p>You can work with incidents here:</p>
                    <ul>
                        <li><Link to={Paths.INCIDENT}>All Incidents</Link></li>
                        {/*<li><Link to={Paths.INCIDENT_MY}>My Incidents</Link></li>*/}
                    </ul>
                </>
            )}

            {user.role === "ADMIN" && (
                <>
                    <p>Admin area:</p>
                    <ul>
                        <li><Link to={Paths.TICKET_SUPPORT}>Support Tickets</Link></li>
                        <li><Link to={Paths.INCIDENT}>Incidents</Link></li>
                        <li><Link to={Paths.LOGS}>Logs</Link></li>
                        <li><Link to={Paths.ALARM}>Alarms</Link></li>
                        <li><Link to={Paths.HEALTH}>Health</Link></li>
                    </ul>
                </>
            )}
        </div>
    );
};


export default Dashboard;