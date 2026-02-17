import {SQSBatchResponse, SQSEvent} from 'aws-lambda';
import {MongoClient} from "mongodb";
import {AuditEvent} from "./types";

let cachedClient: MongoClient | null = null;

async function connectToDatabase() {

  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(process.env.MONGODB_URI!, {
    maxPoolSize: 5,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 5000,
  });

  await client.connect();
  cachedClient = client;
  return client;
}


export const handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
  let client: MongoClient | undefined;

  try {
    client = await connectToDatabase();
  } catch (error) {
    console.error("Database connection error", error);
    throw error;
  }

  const db = client.db("campus-control-db");
  const failures: { itemIdentifier: string }[] = [];

  for (const record of event.Records) {
    try {
      const payload: AuditEvent = JSON.parse(record.body);

      if (!payload || !payload.correlationId || !payload.entityId || !payload.action) {
        throw new Error("Payload is empty or correlationId, entityId or action are missing");
      }

      const timestamp = payload.timestamp ? new Date(payload.timestamp) : new Date();
      const auditLogItem = {...payload, timestamp};

      const result = await db.collection("audit").updateOne(
        {correlationId: payload.correlationId},
        {$setOnInsert: auditLogItem},
        {upsert: true},
      );
      console.log(`Log saved. CorrelationId: ${auditLogItem.correlationId}`);
    } catch (error) {
      console.error(`Failed record ${record.messageId}:`, error);

      failures.push({
        itemIdentifier: record.messageId
      });
    }
  }

  return {
    batchItemFailures: failures,
  }
}