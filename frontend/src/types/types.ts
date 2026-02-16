export type RouteType = {
    path: Path,
    title: string
}
export const Paths = {
    HOME: '/',
    REGISTER: '/register',
    TICKET: '/ticket',
    TICKET_NEW: '/ticket/new',
    TICKET_DETAILS: "/ticket/:id",
    DASHBOARD_SUPPORT: '/support/dashboard',
    TICKET_SUPPORT: '/support/ticket',
    TICKET_SUPPORT_DETAILS: '/support/ticket/:id',
    INCIDENT_SUPPORT_NEW: '/support/incident/new/:ticketId',
    INCIDENT: '/incident',
    INCIDENT_DETAILS: '/incident/:id',
    INCIDENT_NEW: '/incident/new/:ticketId',
    // INCIDENT_MY: '/incident/my',
    TICKET_ADMIN: '/admin/ticket',
    INCIDENT_ADMIN: '/admin/incident',
    PROFILE: '/profile',
    DASHBOARD: '/dashboard',
    ALARM: '/alarm',
    LOGS: '/logs',
    HEALTH: '/health',
} as const;
export type Path = typeof Paths[keyof typeof Paths];


