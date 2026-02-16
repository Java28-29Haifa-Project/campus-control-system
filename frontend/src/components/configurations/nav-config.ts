import {Paths, type RouteType} from "../../types/types.ts";


export const userNavItems:RouteType[] = [
    {path: Paths.DASHBOARD, title: "Dashboard"},
    {path: Paths.TICKET, title: "Tickets"},
    {path: Paths.TICKET_NEW, title: "Create ticket"},
    // {path: Paths.TICKET_DETAILS, title: "Ticket details"},
];
export const supportNavItems:RouteType[] = [
    {path: Paths.DASHBOARD_SUPPORT, title: "Dashboard"},
    {path: Paths.TICKET_SUPPORT, title: "All tickets"},
];
export const engineerNavItems:RouteType[] = [
    {path: Paths.DASHBOARD, title: "Dashboard"},
    {path: Paths.INCIDENT, title: "All incidents"},
    // {path: Paths.INCIDENT_MY, title: "My incidents"},
];

export const adminNavItem: RouteType[] = [
    {path: Paths.DASHBOARD, title: "Dashboard"},
    {path: Paths.TICKET_ADMIN, title: "All tickets"},
    {path: Paths.INCIDENT_ADMIN, title: "All incidents"},
    {path: Paths.ALARM, title: "Alarm"},
    {path: Paths.LOGS, title: "Logs"},
    {path: Paths.HEALTH, title: "Health"},
]