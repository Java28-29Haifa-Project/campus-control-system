import type {LoginData, LoginRequest, User, VerifyToken} from "../types/authTypes.ts";
import {request} from "./client.ts";

export function login(data: LoginRequest): Promise<User> {
    return request<User>("/auth/login", {
        method: "POST",
        body: data,
    });
};

export function getCurrentUser(): Promise<User> {
    return request<User>("/auth/me", {
        method: "GET",
    })
}

export function refreshToken(): Promise<VerifyToken> {
    return request<VerifyToken>("/auth/refresh", {
        method: "POST",
    })
}

export function register(loginData: LoginData): Promise<User> {
    return request<User>("/auth/register", {
        method: "POST",
        body: loginData,
    })
}