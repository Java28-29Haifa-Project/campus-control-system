import {Paths, type RouteType} from "../../utils/types.ts";


export const userNavItems:RouteType[] = [
    {path: Paths.DASHBOARD, title: "HOME"},
    {path: Paths.TICKET, title: "TICKET"},
    {path: Paths.TICKET_NEW, title: "NEW TICKET"},
    {path: Paths.PROFILE, title: "PROFILE"},
];


export const supportNavItems:RouteType[] = [
    {path: Paths.DASHBOARD, title: "HOME"},
    {path: Paths.TICKET_SUPPORT, title: "TICKET"},
    {path: Paths.INCIDENT_NEW, title: "INCIDENT"},
];


export const engineerNavItems:RouteType[] = [
    {path: Paths.DASHBOARD, title: "HOME"},
    {path: Paths.INCIDENT, title: "INCIDENT"},
    {path: Paths.INCIDENT_MY, title: "MY TASKS"},
];


export const adminNavItem: RouteType[] = [
    {path: Paths.DASHBOARD, title: "HOME"},
    {path: Paths.TICKET_SUPPORT, title: "TICKET"},
    {path: Paths.INCIDENT, title: "INCIDENT"},
    {path: Paths.ALARM, title: "ALARMS"},
    {path: Paths.HEALTH, title: "HEALTH"},
    {path: Paths.LOGS, title: "LOGS"},
];