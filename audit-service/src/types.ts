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

export interface ReaderEvent {
  userId?: string;
  role?: string;
  entityId?: string;
  startDate?: string; // ISO формат
  endDate?: string; // ISO формат
  page?: number | string;
}