import {Paths, type RouteType} from "../../utils/types.ts";


import HomeDay from '../../assets/images/mobileNav/HomeMobileDay.png';
import HomeNight from '../../assets/images/mobileNav/HomeMobileNight.png';

import TicketDay from '../../assets/images/mobileNav/TicketMobileDay.png';
import TicketNight from '../../assets/images/mobileNav/TicketMobileNight.png';

import IncidentDay from '../../assets/images/mobileNav/IncidentMobileDay.png';
import IncidentNight from '../../assets/images/mobileNav/IncidentMobileNight.png';

import AlarmDay from '../../assets/images/mobileNav/AlarmMobileDay.png';
import AlarmNight from '../../assets/images/mobileNav/AlarmMobileNight.png';

import HealthDay from '../../assets/images/mobileNav/HealthMobileDay.png';
import HealthNight from '../../assets/images/mobileNav/HealthMobileNight.png';

import LogsDay from '../../assets/images/mobileNav/LogsMobileDay.png';
import LogsNight from '../../assets/images/mobileNav/LogsMobileNight.png';




export const userNavItems: RouteType[] = [
    {
        path: Paths.DASHBOARD,
        title: "HOME",
        iconDay: HomeDay,
        iconNight: HomeNight
    },
    {
        path: Paths.TICKET,
        title: "TICKET",
        iconDay: TicketDay,
        iconNight: TicketNight
    },
    {
        path: Paths.TICKET_NEW,
        title: "NEW TICKET",

        iconDay: TicketDay,
        iconNight: TicketNight
    },
    {
        path: Paths.PROFILE,
        title: "PROFILE",

        iconDay: LogsDay,
        iconNight: LogsNight
    },
];

export const supportNavItems: RouteType[] = [
    { path: Paths.DASHBOARD, title: "HOME", iconDay: HomeDay, iconNight: HomeNight },
    { path: Paths.TICKET_SUPPORT, title: "TICKETS", iconDay: TicketDay, iconNight: TicketNight },
    { path: Paths.INCIDENT_NEW, title: "INCIDENT", iconDay: IncidentDay, iconNight: IncidentNight },
];

export const engineerNavItems: RouteType[] = [
    { path: Paths.DASHBOARD, title: "HOME", iconDay: HomeDay, iconNight: HomeNight },
    { path: Paths.INCIDENT, title: "INCIDENTS", iconDay: IncidentDay, iconNight: IncidentNight },
    { path: Paths.INCIDENT_MY, title: "MY TASKS", iconDay: IncidentDay, iconNight: IncidentNight },
];

export const adminNavItem: RouteType[] = [
    { path: Paths.DASHBOARD, title: "HOME", iconDay: HomeDay, iconNight: HomeNight },
    { path: Paths.TICKET_SUPPORT, title: "TICKETS", iconDay: TicketDay, iconNight: TicketNight },
    { path: Paths.INCIDENT, title: "INCIDENTS", iconDay: IncidentDay, iconNight: IncidentNight },
    { path: Paths.ALARM, title: "ALARMS", iconDay: AlarmDay, iconNight: AlarmNight },
    { path: Paths.HEALTH, title: "HEALTH", iconDay: HealthDay, iconNight: HealthNight },
    { path: Paths.LOGS, title: "LOGS", iconDay: LogsDay, iconNight: LogsNight },
];