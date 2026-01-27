import type {LoginRequest, User} from "../src/types/authTypes";

export const mockUser: User = {
    userId: 'user_001',
    username: 'john_user',
    email: 'user@test.org',
    role: 'USER',
};
export const mockLoginUser: LoginRequest = {
    email:'user@test.org',
    password:'password123',
}