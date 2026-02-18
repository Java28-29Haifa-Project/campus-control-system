import {SQSEvent} from "aws-lambda";
import {CloudWatchAlarmPayload} from "./interfaces";
import {LogLevel} from "../../backend/gateway/src/types/monitoring";
import {log, saveToDatabase, sendNotification} from "./helpers";
import {MongoClient} from "mongodb";
import {getServiceConfig} from "./secrets";
import {InvokeCommand, LambdaClient} from "@aws-sdk/client-lambda";

const INCIDENT_LAMBDA_NAME = process.env.INCIDENT_LAMBDA_NAME || 'arn:aws:lambda:us-east-1:757434564846:function:incident-service-lambda';

let cachedClient = null;

async function connectToDatabase() {
  const config = await getServiceConfig();

  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(config.mongodb_uri, {
    maxPoolSize: 5,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 5000,
  });

  await client.connect();
  cachedClient = client;
  return client;
}

const lambdaClient = new LambdaClient({});

export const handler = async (event: SQSEvent) => {
  let client: MongoClient | undefined;

  try {
    client = await connectToDatabase();
  } catch (error) {
    log(LogLevel.ERROR, "Failed to connect to database", {error: error.message});
    throw error;
  }
  const db = client.db("campus-control-db");
  const failures: { itemIdentifier: string } [] = [];

  for (const record of event.Records) {
    let alarm: CloudWatchAlarmPayload;
    try {
      const body = JSON.parse(record.body);
      alarm = body.Message ? JSON.parse(body.Message) : body;
      if (!alarm || !alarm.AlarmName) {
        throw new Error("Payload is empty or missing alarm name");
      }
    } catch (e) {
      log(LogLevel.ERROR, "Data Inconsistency: Invalid format", {
        error: e.message,
        messageId: record.messageId,
        raw: record.body
      });
      continue;
    }

    try {
      let incidentInfo: { number: string, priority: string } | undefined;

      if (alarm.NewStateValue === "ALARM") {

        try {
          const invokeParams = {
            FunctionName: INCIDENT_LAMBDA_NAME,
            Payload: JSON.stringify({
              action: "CREATE_INCIDENT",
              data: {
                ticketIds: [`nos-alarm-${alarm.AlarmName}`],
                impact: 'critical',
                urgency: 'high',
                category: 'system',
                description: `[NOS_AUTO] Alarm: ${alarm.AlarmName}. Reason: ${alarm.NewStateReason}`,
                createdBy: "NOS_SERVICE",
              }
            }),
          };

          const command = new InvokeCommand(invokeParams);
          const response = await lambdaClient.send(command);

          const responsePayload = JSON.parse(new TextDecoder().decode(response.Payload));

          if (responsePayload.statusCode === 201) {
            const incidentData = responsePayload.body;
            incidentInfo = {
              number: incidentData.incidentId,
              priority: String(incidentData.priority),
            };
            log(LogLevel.INFO, "Incident created successfully", {incidentId: incidentInfo.number});
          } else {
            const errorMsg = responsePayload.body?.error || "Unknown Incident Service Error";
            throw new Error(`Incident Service returned ${responsePayload.statusCode}: ${errorMsg}`);
          }

        } catch (e) {
          log(LogLevel.WARN,
            "Failed to create incident, but continuing with notification",
            {error: e.message, alarmName: alarm.AlarmName});
        }
      }

      if (alarm.NewStateValue === "ALARM" || alarm.NewStateValue === "OK") {
        const dbRes = await saveToDatabase(db, alarm, incidentInfo);

        if (dbRes.upsertedCount > 0) {
          await sendNotification(alarm, incidentInfo);
          log(LogLevel.INFO, "Notification processed successfully", {
            alarm: alarm.AlarmName,
            state: alarm.NewStateValue,
          });
        } else {
          log(LogLevel.INFO, "Duplicate alarm detected, skipping notification", {
            alarm: alarm.AlarmName,
            state: alarm.NewStateValue
          });
        }
      } else {
        await saveToDatabase(db, alarm, incidentInfo);
        log(LogLevel.INFO, "Alarm state change recorded (no notification sent)", {
          alarm: alarm.AlarmName,
          state: alarm.NewStateValue
        });
      }

    } catch (error) {
      log(LogLevel.ERROR, "NOS Processing Failed", {
        error: error.message,
        messageId: record.messageId,
        alarmName: alarm?.AlarmName
      });

      failures.push({
        itemIdentifier: record.messageId,
      });
    }
  }

  if (failures.length > 0) {
    log(LogLevel.WARN, "Batch completed with failures", {
      failedCount: failures.length,
      totalCount: event.Records.length
    });

    return {
      batchItemFailures: failures
    };
  }

  log(LogLevel.INFO, "Batch processed successfully", {
    processedCount: event.Records.length
  });

  return {batchItemFailures: []};
}