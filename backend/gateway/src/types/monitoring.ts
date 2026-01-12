export enum LogLevel {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    DEBUG = 'DEBUG'
}

export enum AlarmStatus {
    Active = 'ACTIVE',
    Resolved = 'RESOLVED'
}

export enum AlarmSeverity {
    Low = 'LOW',
    Medium = 'MEDIUM',
    High = 'HIGH',
    Critical = 'CRITICAL'
}

export type LogEntry = {
    logId: string;
    timestamp: string;
    level: LogLevel;
    service: string;
    message: string;
    stackTrace?: string;
};

export type Alarm = {
    alarmId: string;
    alarmName: string;
    severity: AlarmSeverity;
    status: AlarmStatus;
    message: string;
    microservice: string;
    triggerTime: string;
    notificationsSent: string[];
};