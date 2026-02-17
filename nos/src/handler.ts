import {SQSEvent} from "aws-lambda";
import {v4 as uuidv4} from 'uuid';
import {CloudWatchAlarmPayload} from "./interfaces";
import {LogLevel} from "../../backend/gateway/src/types/monitoring";
import {log, saveToDatabase, sendNotification} from "./helpers";
import {MongoClient} from "mongodb";
import {createSystemIncidentPlaceholder} from "./createSystemIncidentPlaceholder";
import {getServiceConfig} from "./secrets";

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
          // ToDo переделать в соответствии методом incidentService
          const incidentId = uuidv4();
          const description = `[NOS_AUTO] Alarm: ${alarm.AlarmName}. Reason: ${alarm.NewStateReason}`;
          const newIncident = await createSystemIncidentPlaceholder(incidentId,
            [`ticket-nos-${incidentId}`], description);

          incidentInfo = {
            number: newIncident.incidentNumber,
            priority: newIncident.priority
          };
          log(LogLevel.INFO, "Incident created successfully", {incidentNumber: incidentInfo.number});
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