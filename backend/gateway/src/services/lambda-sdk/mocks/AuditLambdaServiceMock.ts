import { IAuditLambdaService, AuditEventInput } from '../interfaces/IAuditLambdaService.js';

export class AuditLambdaServiceMock implements IAuditLambdaService {
    private events: AuditEventInput[] = [];

    async sendAuditEvent(input: AuditEventInput): Promise<{ success: boolean }> {

        this.events.push(input);
        console.log(`[AUDIT] ${input.actor} performed ${input.action} on ${input.entityType}:${input.entityId}`);

        return { success: true };
    }

    async healthCheck(): Promise<{ service: string; status: string; timestamp: string }> {
        return {
            service: 'audit-lambda',
            status: 'ok',
            timestamp: new Date().toISOString()
        };
    }
}

export const auditLambdaServiceMock = new AuditLambdaServiceMock();