import { AuthService } from '../AuthService.js';
import { User, LoginRequest, VerifyTokenRequest } from '../../types/auth.js';
import { IAuthLambdaService } from '../lambda-sdk/interfaces/IAuthLambdaService.js';
import { authLambdaServiceMock } from '../lambda-sdk/mocks/AuthLambdaServiceMock.js';

class AuthServiceImplAWSLambda implements AuthService {
    private lambdaService: IAuthLambdaService = authLambdaServiceMock;

    async login(request: LoginRequest): Promise<User> {
        const lambdaResponse = await this.lambdaService.login({
            action: 'LOGIN',
            email: request.email,
            password: request.password
        });

        return {
            userId: lambdaResponse.userId,
            username: lambdaResponse.username,
            email: lambdaResponse.email,
            role: lambdaResponse.role as any
        };
    }

    async verifyToken(request: VerifyTokenRequest): Promise<User & { valid: boolean }> {
        const lambdaResponse = await this.lambdaService.verifyToken({
            action: 'VERIFY_TOKEN',
            userId: request.userId
        });

        return {
            userId: lambdaResponse.userId,
            username: lambdaResponse.username,
            email: lambdaResponse.email,
            role: lambdaResponse.role as any,
            valid: lambdaResponse.valid || false
        };
    }
}

export const authServiceAWSLambda = new AuthServiceImplAWSLambda();