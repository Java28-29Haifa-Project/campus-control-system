import {AlarmSeverity, LogLevel} from "../../backend/gateway/src/types/monitoring";
import {Db} from "mongodb";
import {CloudWatchAlarmPayload} from "./interfaces";
import {getTemplate} from "./template";
import {SendEmailCommand, SESClient} from "@aws-sdk/client-ses";
import {getServiceConfig} from "./secrets";

const SERVICE_NAME = "nos-service";
const sesClient = new SESClient({region: "us-east-1"});

export const determineSeverity = (alarmName: string): AlarmSeverity => {
  const upperName = (alarmName || "").toUpperCase();

  if (upperName.indexOf("CRITICAL") !== -1) return AlarmSeverity.Critical;

  if (
    upperName.indexOf("HIGH") !== -1 ||
    upperName.indexOf("ERROR") !== -1 ||
    upperName.indexOf("FAIL") !== -1
  ) {
    return AlarmSeverity.High;
  }

  if (
    upperName.indexOf("MEDIUM") !== -1 ||
    upperName.indexOf("WARN") !== -1
  ) {
    return AlarmSeverity.Medium;
  }

  return AlarmSeverity.Low;
};

export const log = (level: LogLevel, message: string, context?: any) => {
  const logPayload = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    service: SERVICE_NAME,
    message,
    context
  });

  if (level === LogLevel.ERROR) console.error(logPayload);
  else if (level === LogLevel.WARN) console.warn(logPayload);
  else console.log(logPayload);
};

export async function saveToDatabase(db: Db, alarm: CloudWatchAlarmPayload, incidentInfo: any) {
  const uniqueKey = `${alarm.AlarmName}::${alarm.StateChangeTime}`;
  const result = await db.collection("alarms").updateOne(
    {uniqueKey},
    {
      $setOnInsert: {
        uniqueKey,
        alarmName: alarm.AlarmName,
        state: alarm.NewStateValue,
        stateChangeTime: alarm.StateChangeTime,
        timestamp: new Date(),
        raw: alarm,
        incidentInfo: incidentInfo || null,
      },
      $set: {
        notificationSent: true,
        notificationSentAt: new Date(),
        lastProcessedAt: new Date()
      }
    },
    {upsert: true}
  );

  return result;
}

export async function sendNotification(alarm: CloudWatchAlarmPayload, incidentInfo: any) {
  const config = await getServiceConfig();

  const { subject, body } = getTemplate(alarm.AlarmName, alarm.NewStateReason, alarm.NewStateValue, incidentInfo);
  const command = new SendEmailCommand({
    Destination: { ToAddresses: [config.admin_email] },
    Message: {
      Body: { Text: { Data: body } },
      Subject: { Data: subject },
    },
    Source: config.source_email,
  });
  return sesClient.send(command);
}