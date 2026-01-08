import { IMonitoringLambdaService, GetLogsInput, GetAlarmsInput, LogLambdaResponse, AlarmLambdaResponse } from '../interfaces/IMonitoringLambdaService.js';

export class MonitoringLambdaServiceMock implements IMonitoringLambdaService {
    private logs: LogLambdaResponse[] = [
        {
            logId: 'log0',
            timestamp: '2025-01-01T14:00:00Z',
            level: 'ERROR',
            service: 'incident-service',
            message: 'Lambda timeout',
            stackTrace: 'trace0'
        },
        {
            logId: 'log1',
            timestamp: '2025-01-01T15:30:00Z',
            level: 'WARN',
            service: 'auth-service',
            message: 'High memory usage detected'
        },
        {
            logId: 'log2',
            timestamp: '2025-01-02T09:00:00Z',
            level: 'INFO',
            service: 'request-service',
            message: 'Request processed successfully'
        }
    ];

    private alarms: AlarmLambdaResponse[] = [
        {
            alarmId: 'alarm0',
            alarmName: 'HighErrorRate',
            severity: 'HIGH',
            status: 'ACTIVE',
            message: 'Error rate exceeded threshold',
            microservice: 'incident-service',
            triggerTime: '2025-01-01T14:00:00Z',
            notificationsSent: ['email', 'sms']
        },
        {
            alarmId: 'alarm1',
            alarmName: 'LowDiskSpace',
            severity: 'MEDIUM',
            status: 'RESOLVED',
            message: 'Disk space below 20%',
            microservice: 'request-service',
            triggerTime: '2025-01-01T10:00:00Z',
            notificationsSent: ['email']
        }
    ];

    async getLogs(input: GetLogsInput): Promise<LogLambdaResponse[]> {
        let filtered = [...this.logs];

        if (input.level) {
            filtered = filtered.filter(l => l.level === input.level);
        }

        if (input.startDate) {
            filtered = filtered.filter(l => l.timestamp >= input.startDate!);
        }

        return filtered;
    }

    async getAlarms(input: GetAlarmsInput): Promise<AlarmLambdaResponse[]> {
        let filtered = [...this.alarms];

        if (input.status) {
            filtered = filtered.filter(a => a.status === input.status);
        }

        if (input.severity) {
            filtered = filtered.filter(a => a.severity === input.severity);
        }

        return filtered;
    }

    async healthCheck(): Promise<{ service: string; status: string; timestamp: string }> {
        return {
            service: 'monitoring-lambda',
            status: 'ok',
            timestamp: new Date().toISOString()
        };
    }
}

export const monitoringLambdaServiceMock = new MonitoringLambdaServiceMock();