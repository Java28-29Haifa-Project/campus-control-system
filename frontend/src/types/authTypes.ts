export type UserRole = "USER" | "SUPPORT" | "ENGINEER" | "ADMIN";
export type User = {
    userId: string;
    username?: string;
    email: string;
    role: UserRole;
};
export interface AdminUser {
    user_id: string;
    email: string;
    role: UserRole;
    created_at?: string;
    updated_at?: string;
}

export type LoginRequest = {
    email: string;
    password: string;
};

export type VerifyToken = {
    userId: string;
};

export type LoginData = {
    name: string;
    email: string;
    password: string;
}
