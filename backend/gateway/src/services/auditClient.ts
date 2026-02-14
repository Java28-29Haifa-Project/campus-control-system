import { SQSClient, SendMessageCommand, SendMessageCommandInput } from '@aws-sdk/client-sqs';
import { AuditEvent } from '../types/audit.js';
import Logger from '../utils/logger.js';

class AuditClient {
    private sqsClient: SQSClient;
    private queueUrl: string;
    private enabled: boolean;

    constructor() {
        this.enabled = process.env.AUDIT_ENABLED === 'true';
        this.queueUrl = process.env.AUDIT_QUEUE_URL || '';

        if (this.enabled && !this.queueUrl) {
            Logger.warn('Audit is enabled but AUDIT_QUEUE_URL is not set. Disabling audit.');
            this.enabled = false;
        }

        this.sqsClient = new SQSClient({
            region: process.env.AWS_REGION || 'us-east-1'
        });

        if (this.enabled) {
            Logger.info('Audit client initialized', { queueUrl: this.queueUrl });
        } else {
            Logger.info('Audit client disabled');
        }
    }

    async sendEvent(event: AuditEvent): Promise<void> {
        if (!this.enabled) {
            Logger.debug('Audit disabled, skipping event', {
                action: event.action,
                correlationId: event.correlationId
            });
            return;
        }

        try {
            const messageBody = JSON.stringify(event);

            const params: SendMessageCommandInput = {
                QueueUrl: this.queueUrl,
                MessageBody: messageBody,
                MessageAttributes: {
                    entity: {
                        DataType: 'String',
                        StringValue: event.entity
                    },
                    action: {
                        DataType: 'String',
                        StringValue: event.action
                    },
                    role: {
                        DataType: 'String',
                        StringValue: event.role
                    },
                    correlationId: {
                        DataType: 'String',
                        StringValue: event.correlationId
                    }
                }
            };

            const command = new SendMessageCommand(params);
            const response = await this.sqsClient.send(command);

            Logger.info('Audit event sent to SQS', {
                entity: event.entity,
                entityId: event.entityId,
                action: event.action,
                role: event.role,
                userId: event.userId,
                correlationId: event.correlationId,
                messageId: response.MessageId
            });
        } catch (error: any) {
            Logger.error('Failed to send audit event to SQS', {
                error: error.message,
                stack: error.stack,
                entity: event.entity,
                entityId: event.entityId,
                action: event.action,
                correlationId: event.correlationId
            });
        }
    }

    async sendEvents(events: AuditEvent[]): Promise<void> {
        if (!this.enabled || events.length === 0) {
            return;
        }

        Logger.debug('Sending batch of audit events', { count: events.length });

        await Promise.all(events.map(event => this.sendEvent(event)));
    }
}

export const auditClient = new AuditClient();