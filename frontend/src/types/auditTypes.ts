export type AuditRole = "USER" | "ADMIN" | "SUPPORT" | "ENGINEER";

export type AuditLog = {
    _id: string;
    correlationId?: string;
    action: string;
    entity?: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
    role?: AuditRole;
    timestamp: string;
    userId?: string;
};

export type AuditPagination = {
    totalCount: number;
    totalPages: number;
    limit: number;
    page: number;
};

export type AuditResponse = {
    logs: AuditLog[];
    pagination: AuditPagination;
};

export type AuditQuery = {
    entityId?: string;
    userId?: string;
    role?: AuditRole | "";
    startDate?: string;
    endDate?: string;
    page?: number;
};
