export type EntityType = 'Request' | 'Incident' | 'System';
export type PerformedByType = 'USER' | 'SYSTEM';
export type UserRole = 'USER' | 'SUPPORT' | 'ENGINEER' | 'ADMIN' | 'SYSTEM';

export interface PerformedBy {
  type: PerformedByType;
  role: UserRole;
  id: string | null;
}

export interface AuditEvent {
  logType: string;
  entity: EntityType;
  entityId: string;
  action: string;
  performedBy: PerformedBy;
  timestamp: string;
  details: Record<string, any>;
  correlationId: string;
}