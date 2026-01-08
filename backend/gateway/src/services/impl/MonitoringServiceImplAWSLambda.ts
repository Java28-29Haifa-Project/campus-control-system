import { MonitoringService } from '../MonitoringService.js';
import { LogEntry, Alarm, LogLevel, AlarmStatus, AlarmSeverity } from '../../types/monitoring.js';
import { IMonitoringLambdaService } from '../lambda-sdk/interfaces/IMonitoringLambdaService.js';
import { monitoringLambdaServiceMock } from '../lambda-sdk/mocks/MonitoringLambdaServiceMock.js';

class MonitoringServiceImplAWSLambda implements MonitoringService {
    private lambdaService: IMonitoringLambdaService = monitoringLambdaServiceMock;

    async getLogs(level?: LogLevel, startDate?: string): Promise<LogEntry[]> {
        const lambdaResponse = await this.lambdaService.getLogs({
            action: 'GET_LOGS',
            level: level,
            startDate: startDate
        });

        return lambdaResponse.map(r => ({
            logId: r.logId,
            timestamp: r.timestamp,
            level: r.level as any,
            service: r.service,
            message: r.message,
            stackTrace: r.stackTrace
        }));
    }

    async getAlarms(status?: AlarmStatus, severity?: AlarmSeverity): Promise<Alarm[]> {
        const lambdaResponse = await this.lambdaService.getAlarms({
            action: 'GET_ALARMS',
            status: status,
            severity: severity
        });

        return lambdaResponse.map(r => ({
            alarmId: r.alarmId,
            alarmName: r.alarmName,
            severity: r.severity as any,
            status: r.status as any,
            message: r.message,
            microservice: r.microservice,
            triggerTime: r.triggerTime,
            notificationsSent: r.notificationsSent
        }));
    }
}

export const monitoringServiceAWSLambda = new MonitoringServiceImplAWSLambda();