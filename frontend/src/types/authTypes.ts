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

export type LoginData = {
    username: string;
    email: string;
    password: string;
}
