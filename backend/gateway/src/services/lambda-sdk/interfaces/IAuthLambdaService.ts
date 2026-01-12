export interface LoginInput {
    action: 'LOGIN';
    email: string;
    password: string;
}

export interface VerifyTokenInput {
    action: 'VERIFY_TOKEN';
    userId: string;
}

export interface AuthLambdaResponse {
    userId: string;
    username: string;
    email: string;
    role: string;
    valid?: boolean;
}

export interface IAuthLambdaService {
    login(input: LoginInput): Promise<AuthLambdaResponse>;
    verifyToken(input: VerifyTokenInput): Promise<AuthLambdaResponse>;
    healthCheck(): Promise<{ service: string; status: string; timestamp: string }>;
}