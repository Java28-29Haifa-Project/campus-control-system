import { AuditEvent } from '../types/audit.js';

export interface AuditService {
    sendAuditEvent(event: AuditEvent): Promise<{ success: boolean }>;
}