import type {AuditQuery, AuditResponse} from "../types/auditTypes.ts";
import {request} from "./client.ts";


function buildQuery(params: Record<string, string | number | undefined>) {
    let query = "";

    for (const key in params) {
        const value = params[key];

        if (value === undefined || value === "") continue;

        if (query === "") query += "?";
         else query += "&";

        query += `${key}=${encodeURIComponent(value)}`;
    }
    return query;
}


export async function getAuditLogsApi(auditQuery: AuditQuery): Promise<AuditResponse> {
    const query = buildQuery({
        entityId: auditQuery.entityId,
        userId: auditQuery.userId,
        role: auditQuery.role || undefined,
        startDate: auditQuery.startDate,
        endDate: auditQuery.endDate,
        page: auditQuery.page ?? 1,
    });

    return request<AuditResponse>(`/audit/logs${query}`);
}
