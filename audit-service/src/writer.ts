import { SQSEvent } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { AuditEvent } from './types';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event: SQSEvent) => {
  const tableName = process.env.TABLE_NAME;

  for (const record of event.Records) {
    try {
      const payload = JSON.parse(record.body);
      const auditLog: AuditEvent = {
        ...payload,
        logType: 'AUDIT',
        timestamp: payload.timestamp || new Date().toISOString(),
      };

      await docClient.send(new PutCommand({
        TableName: tableName,
        Item: auditLog,
      }));

      console.log(`Log saved. CorrelationId: ${auditLog.correlationId}`);
    } catch (error) {
      console.error('Failed to process record:', record.messageId, error);
      throw error;
    }
  }
}