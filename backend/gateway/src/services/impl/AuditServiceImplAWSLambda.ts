// import { AuditService } from '../AuditService.js';
// import { AuditEvent } from '../../types/audit.js';
// import { IAuditLambdaService } from '../lambda-sdk/interfaces/IAuditLambdaService.js';
// import { auditLambdaServiceMock } from '../lambda-sdk/mocks/AuditLambdaServiceMock.js';
//
// class AuditServiceImplAWSLambda implements AuditService {
//     private lambdaService: IAuditLambdaService = auditLambdaServiceMock;
//
//     async sendAuditEvent(event: AuditEvent): Promise<{ success: boolean }> {
//         return await this.lambdaService.sendAuditEvent({
//             eventType: 'AUDIT_LOG',
//             actor: event.actor,
//             action: event.action,
//             entityType: event.entityType,
//             entityId: event.entityId,
//             timestamp: event.timestamp
//         });
//     }
// }
//
// export const auditServiceAWSLambda = new AuditServiceImplAWSLambda();