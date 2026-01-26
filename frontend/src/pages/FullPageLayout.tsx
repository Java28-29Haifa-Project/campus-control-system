import React, { useEffect, useState } from 'react';
import Navbar from "../components/Navbar";


import Dashboard from "./Dashboard";

import TicketListPage from "./userPages/TicketListPage";

import Incident from "./engineerPages/Incident";

import Alarm from "./adminPages/Alarm";

import HealthPage from "./servicePages/health/HealthPage";

import Logs from "./adminPages/Logs";

const sections = [
    { id: 'home', component: <Dashboard />, title: 'HOME' },
    { id: 'ticket', component: <TicketListPage />, title: 'TICKET' },
    { id: 'incident', component: <Incident />, title: 'INCIDENT' },
    { id: 'alarm', component: <Alarm />, title: 'ALARMS' },
    { id: 'health', component: <HealthPage />, title: 'HEALTH' },
    { id: 'logs', component: <Logs />, title: 'LOGS' },
];

const FullPageLayout = () => {
    const [activeSection, setActiveSection] = useState('home');

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { threshold: 0.5 }
        );

        sections.forEach((section) => {
            const element = document.getElementById(section.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (

        <div style={{ height: '100%', width: '100%' }}>

            <Navbar
                items={sections.map(s => ({ path: s.id, title: s.title }))}
                onScroll={scrollToSection}
                activeId={activeSection}
            />

            <div className="scroll-container">
                {sections.map((section) => (
                    <section
                        key={section.id}
                        id={section.id}
                        className="scroll-section"
                    >
                        <div style={{ width: '100%', height: '100%' }}>
                            {section.component}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
};

export default FullPageLayout;