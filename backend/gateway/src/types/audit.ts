export type AuditEvent = {
    eventType: string;
    actor: string;
    action: string;
    entityType: string;
    entityId: string;
    timestamp: string;
};