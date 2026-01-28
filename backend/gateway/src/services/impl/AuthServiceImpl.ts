import { AuthService } from '../AuthService.js';
import { User, LoginRequest, VerifyTokenRequest, RegisterRequest } from '../../types/auth.js';
import { IAuthLambdaService } from '../lambda-sdk/interfaces/IAuthLambdaService.js';
import { authLambdaServiceMock } from '../lambda-sdk/mocks/AuthLambdaServiceMock.js';

import { userRepository } from '../repositories/UserRepositoryDB.js';
import { HttpError } from '../errors/http-error.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';


class AuthServiceImpl implements AuthService {
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

    async registerUser(request: RegisterRequest): Promise<User> {
        const { name, email, password } = request;

        const existing = await userRepository.findByEmail(email);
        if (existing) throw new HttpError(409, 'Email already registered');

        const user = await userRepository.createUser(name, email, password);
        return user;
    }

}

export const authServiceAWSLambda = new AuthServiceImpl();