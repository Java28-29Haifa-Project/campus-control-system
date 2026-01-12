export interface AuditEventInput {
    eventType: 'AUDIT_LOG';
    actor: string;
    action: string;
    entityType: string;
    entityId: string;
    timestamp: string;
}

export interface IAuditLambdaService {
    sendAuditEvent(input: AuditEventInput): Promise<{ success: boolean }>;
    healthCheck(): Promise<{ service: string; status: string; timestamp: string }>;
}