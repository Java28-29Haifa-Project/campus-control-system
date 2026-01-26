export type RouteType = {
    path: Path,
    title: string
}
export const Paths = {
    HOME: '/',
    TICKET: '/ticket',
    TICKET_NEW: '/ticket/new',
    TICKET_DETAILS: "/ticket/:id",
    TICKET_SUPPORT: '/support/ticket',
    INCIDENT: '/incident',
    INCIDENT_NEW: '/incident/new',
    INCIDENT_MY: '/incident/my',
    PROFILE: '/profile',
    DASHBOARD: '/dashboard',
    ALARM: '/alarm',
    LOGS: '/logs',
    HEALTH: '/health',
} as const;
export type Path = typeof Paths[keyof typeof Paths];


