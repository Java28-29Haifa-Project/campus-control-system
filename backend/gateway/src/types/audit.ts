export type EntityType = 'Request' | 'Incident' | 'System';
export type PerformedByType = 'USER' | 'SYSTEM';
export type UserRole = 'USER' | 'SUPPORT' | 'ENGINEER' | 'ADMIN' | 'SYSTEM';

export interface PerformedBy {
    type: PerformedByType;
    role: UserRole;
    id: string | null;
}

export interface AuditEvent {
    entity: EntityType;
    entityId: string;
    action: string;
    performedBy: PerformedBy;
    timestamp: string;
    details: Record<string, any>;
    correlationId: string;
}

// Helper to create audit events
export function createAuditEvent(
    entity: EntityType,
    entityId: string,
    action: string,
    userId: string | null,
    userRole: UserRole,
    details: Record<string, any>,
    correlationId?: string
): AuditEvent {
    return {
        entity,
        entityId,
        action,
        performedBy: {
            type: userId ? 'USER' : 'SYSTEM',
            role: userRole,
            id: userId
        },
        timestamp: new Date().toISOString(),
        details,
        correlationId: correlationId || generateCorrelationId()
    };
}

function generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}