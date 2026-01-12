export interface AccessTokenPayload {
    userId: string;
    username: string;
    email: string;
    role: string;
    type: 'access';
}

export interface RefreshTokenPayload {
    userId: string;
    tokenId: string;
    type: 'refresh';
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}