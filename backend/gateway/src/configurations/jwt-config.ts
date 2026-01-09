export const jwtConfig = {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || 'default-access-secret',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'default-refresh-secret',
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
};
