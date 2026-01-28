import { User, LoginRequest, VerifyTokenRequest, RegisterRequest } from '../types/auth.js';

export interface AuthService {
    login(request: LoginRequest): Promise<User>;
    verifyToken(request: VerifyTokenRequest): Promise<User & { valid: boolean }>;
    registerUser(request: RegisterRequest):  Promise<User>;
}