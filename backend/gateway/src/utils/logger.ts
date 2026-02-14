type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    service: string;
    environment: string;
    [key: string]: any;
}

class Logger {
    private service: string;
    private environment: string;

    constructor() {
        this.service = process.env.SERVICE_NAME || 'express-gateway';
        this.environment = process.env.NODE_ENV || 'development';
    }

    private createLogEntry(level: LogLevel, message: string, metadata?: Record<string, any>): LogEntry {
        return {
            level,
            message,
            timestamp: new Date().toISOString(),
            service: this.service,
            environment: this.environment,
            ...metadata
        };
    }

    private write(logEntry: LogEntry) {
        if (this.environment === 'production') {
            console.log(JSON.stringify(logEntry));
        } else {
            const { level, message, timestamp, ...rest } = logEntry;
            const color = this.getColor(level);
            console.log(
                `${color}[${level.toUpperCase()}]${this.colors.reset} ${timestamp} - ${message}`,
                Object.keys(rest).length > 2 ? rest : ''
            );
        }
    }

    private getColor(level: LogLevel): string {
        switch (level) {
            case 'error': return this.colors.red;
            case 'warn': return this.colors.yellow;
            case 'info': return this.colors.green;
            case 'debug': return this.colors.blue;
            default: return this.colors.reset;
        }
    }

    private colors = {
        reset: '\x1b[0m',
        red: '\x1b[31m',
        yellow: '\x1b[33m',
        green: '\x1b[32m',
        blue: '\x1b[34m'
    };

    error(message: string, metadata?: Record<string, any>) {
        const logEntry = this.createLogEntry('error', message, metadata);
        this.write(logEntry);
    }

    warn(message: string, metadata?: Record<string, any>) {
        const logEntry = this.createLogEntry('warn', message, metadata);
        this.write(logEntry);
    }

    info(message: string, metadata?: Record<string, any>) {
        const logEntry = this.createLogEntry('info', message, metadata);
        this.write(logEntry);
    }

    debug(message: string, metadata?: Record<string, any>) {
        if (this.environment !== 'production') {
            const logEntry = this.createLogEntry('debug', message, metadata);
            this.write(logEntry);
        }
    }
}

const logger = new Logger();

export default logger;


import { Request, Response, NextFunction } from 'express';

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.path === '/health') {
        return next();
    }
    const startTime = Date.now();
    const requestId = (req as any).requestId;


    logger.info('Request started', {
        method: req.method,
        path: req.path,
        requestId,
        userId: (req as any).user?.userId,
        ip: req.ip
    });

    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

        logger[logLevel]('Request completed', {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration,
            requestId,
            userId: (req as any).user?.userId
        });
    });

    next();
}