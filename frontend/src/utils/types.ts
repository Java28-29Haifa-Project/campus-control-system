export type RouteType = {
    path: Path,
    title: string
}
export const Paths = {
    HOME: '/',
    TICKET: '/ticket',
    INCIDENT: '/incident',
    PROFILE: '/profile',
    ALARM: '/alarm',
    HEALTH: '/health',
} as const;
export type Path = typeof Paths[keyof typeof Paths];
