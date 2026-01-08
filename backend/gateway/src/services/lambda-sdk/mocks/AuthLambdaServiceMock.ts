import { IAuthLambdaService, LoginInput, VerifyTokenInput, AuthLambdaResponse } from '../interfaces/IAuthLambdaService.js';

export class AuthLambdaServiceMock implements IAuthLambdaService {
    private mockUsers: AuthLambdaResponse[] = [
        {
            userId: 'user0',
            username: 'name0',
            email: 'email0@test.org',
            role: 'USER'
        },
        {
            userId: 'admin0',
            username: 'admin_name',
            email: 'admin@test.org',
            role: 'ADMIN'
        },
        {
            userId: 'support0',
            username: 'support_name',
            email: 'support@test.org',
            role: 'SUPPORT'
        }
    ];

    async login(input: LoginInput): Promise<AuthLambdaResponse> {
        const user = this.mockUsers.find(u => u.email === input.email);
        if (user) {
            return user;
        }

        return this.mockUsers[0];
    }

    async verifyToken(input: VerifyTokenInput): Promise<AuthLambdaResponse> {

        const user = this.mockUsers.find(u => u.userId === input.userId);
        if (user) {
            return { ...user, valid: true };
        }

        return { ...this.mockUsers[0], valid: false };
    }

    async healthCheck(): Promise<{ service: string; status: string; timestamp: string }> {
        return {
            service: 'auth-lambda',
            status: 'ok',
            timestamp: new Date().toISOString()
        };
    }
}

export const authLambdaServiceMock = new AuthLambdaServiceMock();