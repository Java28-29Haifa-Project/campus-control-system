import type {LoginRequest, User, VerifyToken} from "../types/authTypes.ts";
import {request} from "./client.ts";

export function login(loginData: LoginRequest): Promise<User> {
    return request<User>("/auth/login", {
        method: "POST",
        body: loginData,
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