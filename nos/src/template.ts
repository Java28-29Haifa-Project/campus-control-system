import {AlarmSeverity} from "../../backend/gateway/src/types/monitoring";
import {determineSeverity} from "./helpers";

const ICONS = {
  [AlarmSeverity.Critical]: "🚨",
  [AlarmSeverity.High]:     "❌",
  [AlarmSeverity.Medium]:   "⚠️",
  [AlarmSeverity.Low]:      "ℹ️",
  RESOLVED:                "✅"
};

export const getTemplate = (alarmName: string,
                            reason: string,
                            state: string,
                            incident?: {number: string, priority: string},
) => {
  const isResolved = state === "OK";
  let severity = determineSeverity(alarmName);
  const icon = isResolved ? ICONS.RESOLVED : ICONS[severity];
  const statusText = isResolved ? "RESOLVED" : severity;
  const subject = `${icon} [${statusText}] ${alarmName}`;

  const bodyHeader = isResolved ? "SYSTEM RECOVERY" : "SYSTEM INCIDENT";
  const bodyStatus = isResolved ? "RESOLVED" : state.toUpperCase();

  const body = `
  ${bodyHeader}
  ----------------
  Alarm: ${alarmName}
  Status: ${bodyStatus}
  ${isResolved ? "" : 
    `Severity: ${severity}\n`}${incident ? 
    `Incident: ${incident.number}\nPriority: ${incident.priority}\n` : ""}Details: ${reason}
  Time: ${new Date().toISOString()}
  Service: Notification Service`;
  return {subject, body};
}