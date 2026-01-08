export interface GetLogsInput {
    action: 'GET_LOGS';
    level?: string;
    startDate?: string;
}

export interface GetAlarmsInput {
    action: 'GET_ALARMS';
    status?: string;
    severity?: string;
}

export interface LogLambdaResponse {
    logId: string;
    timestamp: string;
    level: string;
    service: string;
    message: string;
    stackTrace?: string;
}

export interface AlarmLambdaResponse {
    alarmId: string;
    alarmName: string;
    severity: string;
    status: string;
    message: string;
    microservice: string;
    triggerTime: string;
    notificationsSent: string[];
}

export interface IMonitoringLambdaService {
    getLogs(input: GetLogsInput): Promise<LogLambdaResponse[]>;
    getAlarms(input: GetAlarmsInput): Promise<AlarmLambdaResponse[]>;
    healthCheck(): Promise<{ service: string; status: string; timestamp: string }>;
}