export const jwtConfig = {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'fallback-dev-secret-access',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'fallback-dev-secret-refresh',
    accessTokenExpiry: process.env.JWT_ACCESS_TTL || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_TTL || '7d'
};