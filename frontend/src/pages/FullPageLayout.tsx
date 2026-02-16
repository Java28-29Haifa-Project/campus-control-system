import React, { useState } from 'react';
import Navbar from "../components/Navbar";

import Dashboard from "./Dashboard";
import TicketListPage from "./userPages/TicketListPage";
import Incident from "./engineerPages/Incident";
import Alarm from "./adminPages/Alarm";
import HealthPage from "./servicePages/health/HealthPage";
import Logs from "./adminPages/Logs";


import HomeDay from '../assets/images/mobileNav/HomeMobileDay.png';
import HomeNight from '../assets/images/mobileNav/HomeMobileNight.png';
import TicketDay from '../assets/images/mobileNav/TicketMobileDay.png';
import TicketNight from '../assets/images/mobileNav/TicketMobileNight.png';
import IncidentDay from '../assets/images/mobileNav/IncidentMobileDay.png';
import IncidentNight from '../assets/images/mobileNav/IncidentMobileNight.png';
import AlarmDay from '../assets/images/mobileNav/AlarmMobileDay.png';
import AlarmNight from '../assets/images/mobileNav/AlarmMobileNight.png';
import HealthDay from '../assets/images/mobileNav/HealthMobileDay.png';
import HealthNight from '../assets/images/mobileNav/HealthMobileNight.png';
import LogsDay from '../assets/images/mobileNav/LogsMobileDay.png';
import LogsNight from '../assets/images/mobileNav/LogsMobileNight.png';

const sections = [
    {
        id: 'home',
        component: <Dashboard />,
        title: 'HOME',
        iconDay: HomeDay, iconNight: HomeNight
    },
    {
        id: 'ticket',
        component: <TicketListPage />,
        title: 'TICKET',
        iconDay: TicketDay, iconNight: TicketNight
    },
    {
        id: 'incident',
        component: <Incident />,
        title: 'INCIDENT',
        iconDay: IncidentDay, iconNight: IncidentNight
    },
    {
        id: 'alarm',
        component: <Alarm />,
        title: 'ALARMS',
        iconDay: AlarmDay, iconNight: AlarmNight
    },
    {
        id: 'health',
        component: <HealthPage />,
        title: 'HEALTH',
        iconDay: HealthDay, iconNight: HealthNight
    },
    {
        id: 'logs',
        component: <Logs />,
        title: 'LOGS',
        iconDay: LogsDay, iconNight: LogsNight
    },
];

const FullPageLayout = () => {
    const [activeSectionId, setActiveSectionId] = useState('home');
    const activeSection = sections.find(s => s.id === activeSectionId);

    return (
        <div style={{ height: '100%', width: '100%', overflow: 'hidden', position: 'relative' }}>

            <Navbar
                items={sections}
                onScroll={(id) => setActiveSectionId(id)}
                activeId={activeSectionId}
            />



            <div style={{ width: '100%', height: '100%', animation: 'fadeIn 0.3s ease-out' }} key={activeSectionId}>
                {activeSection?.component}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default FullPageLayout;