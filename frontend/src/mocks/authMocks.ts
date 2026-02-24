import type {LoginRequest, User} from "../types/authTypes.ts";

export const mockUser: User = {
    userId: 'user_001',
    username: 'john_user',
    email: 'user@test.org',
    role: 'ADMIN',
};
export const mockLoginUser: LoginRequest = {
    email:'user@test.org',
    password:'password123',
}