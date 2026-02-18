import { request } from "./client";
import type {AdminUser, UserRole} from "../types/authTypes.ts";

export const getAllUsersApi = async (): Promise<AdminUser[]> => {
    return request<AdminUser[]>("/admin/users");
};

export const getUserByIdApi = async (id: string): Promise<AdminUser> => {
    return request<AdminUser>(`/admin/users/${id}`);
};

export const changeUserRoleApi = async (
    id: string,
    role: UserRole
): Promise<AdminUser> => {
    return request<AdminUser>(`/admin/users/${id}/role`, {
        method: "PATCH",
        body: { role },
    });
};
