export type User = {
    userId: string;
    username?: string;
    email: string;
    role: 'USER' | 'ADMIN' | 'SUPPORT' | 'ENGINEER';
};

export type LoginRequest = {
    email: string;
    password: string;
};

export type VerifyTokenRequest = {
    userId: string;
};

export type VerifyTokenResponse = {
    valid: boolean;
    userId: string;
    username: string;
    email: string;
    role: 'USER' | 'ADMIN' | 'SUPPORT' | 'ENGINEER';
}
