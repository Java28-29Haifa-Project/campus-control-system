import type {LoginRequest, User, VerifyTokenRequest, VerifyTokenResponse} from "../types/authTypes.ts";
import {request} from "./client.ts";

export function login(loginData: LoginRequest): Promise<User> {
    return request<User>("/auth/login", {
        method: "POST",
        body: loginData,
    });
};

export function verify(loginData: VerifyTokenRequest): Promise<VerifyTokenResponse> {
    return request<VerifyTokenResponse>("/auth/verify", {
        method: "POST",
        body: loginData,
    })
}