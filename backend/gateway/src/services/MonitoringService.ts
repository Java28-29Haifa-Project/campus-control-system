import { LogEntry, Alarm, LogLevel, AlarmStatus, AlarmSeverity } from '../types/monitoring.js';

export interface MonitoringService {
    getLogs(level?: LogLevel, startDate?: string): Promise<LogEntry[]>;
    getAlarms(status?: AlarmStatus, severity?: AlarmSeverity): Promise<Alarm[]>;
}