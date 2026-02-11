import { randomUUID } from 'crypto';

export type EntityType = 'Request' | 'Incident' | 'System';
export type Role = 'USER' | 'SUPPORT' | 'ENGINEER' | 'ADMIN' | 'SYSTEM';

export interface AuditEvent {
    entity: EntityType;
    entityId: string;
    role: Role;
    userId: string | null;
    action: string;
    timestamp: string;
    metadata: Record<string, any>;
    correlationId: string; // uuid
}

export function createAuditEvent(
    entity: EntityType,
    entityId: string,
    action: string,
    userId: string | null,
    role: Role,
    metadata: Record<string, any> = {},
    correlationId?: string
): AuditEvent {
    return {
        entity,
        entityId,
        role,
        userId,
        action,
        timestamp: new Date().toISOString(),
        metadata,
        correlationId: correlationId || randomUUID()
    };
}

export const IncidentActions = {
    CREATED: 'incident_created',
    ASSIGNED: 'incident_assigned',
    STATUS_CHANGED: 'incident_status_changed',
    PRIORITY_RAISED: 'incident_priority_raised',
    COMMENT_ADDED: 'incident_comment_added'
} as const;

export const RequestActions = {
    CREATED: 'request_created',
    STATUS_CHANGED: 'request_status_changed',
    UPDATED: 'request_updated'
} as const;