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

export type VerifyToken = {
    userId: string;
};

