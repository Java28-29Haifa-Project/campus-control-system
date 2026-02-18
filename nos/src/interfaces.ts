export interface CloudWatchAlarmPayload {
  AlarmName: string;
  NewStateValue: 'OK' | 'ALARM' | 'INSUFFICIENT_DATA';
  NewStateReason: string;
  StateChangeTime: string;
  Region: string;
  OldStateValue?: string;
}