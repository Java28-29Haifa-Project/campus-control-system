/**
 * Structured Logger with CloudWatch Integration
 *
 * Provides consistent logging across the application with:
 * - Multiple log levels (error, warn, info, debug)
 * - Context enrichment (userId, requestId, correlationId)
 * - CloudWatch transport for centralized logging
 * - JSON format for easy parsing
 */

import winston from 'winston';
import CloudWatchTransport from 'winston-cloudwatch';

// Determine log level from environment
const logLevel = process.env.LOG_LEVEL || 'info';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Custom log format with timestamp and context
 */
const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

/**
 * Console format for development (more readable)
 */
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0) {
            msg += ` ${JSON.stringify(meta)}`;
        }
        return msg;
    })
);

/**
 * Create Winston logger instance
 */
const logger = winston.createLogger({
    level: logLevel,
    format: logFormat,
    defaultMeta: {
        service: 'express-gateway',
        environment: process.env.NODE_ENV || 'development'
    },
    transports: [
        // Console transport (always enabled)
        new winston.transports.Console({
            format: isProduction ? logFormat : consoleFormat
        })
    ],
    // Don't exit on handled exceptions
    exitOnError: false
});

/**
 * Add CloudWatch transport in production
 */
if (isProduction && process.env.CLOUDWATCH_LOG_GROUP) {
    try {
        const cloudwatchConfig = {
            logGroupName: process.env.CLOUDWATCH_LOG_GROUP || '/aws/express-gateway',
            logStreamName: process.env.CLOUDWATCH_LOG_STREAM || `${process.env.NODE_ENV}-${new Date().toISOString().split('T')[0]}`,
            awsRegion: process.env.AWS_REGION || 'us-east-1',
            messageFormatter: ({ level, message, ...meta }: any) => {
                return JSON.stringify({
                    level,
                    message,
                    ...meta,
                    timestamp: new Date().toISOString()
                });
            }
        };

        logger.add(new CloudWatchTransport(cloudwatchConfig));
        logger.info('[Logger] CloudWatch transport enabled', {
            logGroup: cloudwatchConfig.logGroupName,
            logStream: cloudwatchConfig.logStreamName
        });
    } catch (error) {
        logger.error('[Logger] Failed to initialize CloudWatch transport', { error });
    }
}

/**
 * Helper function to create child logger with context
 */
export function createLogger(context: Record<string, any>) {
    return logger.child(context);
}

/**
 * Request logger middleware
 * Adds request context to all logs within a request
 */
export function requestLoggerMiddleware(req: any, res: any, next: any) {
    // Generate correlation ID for request tracking
    const correlationId = req.headers['x-correlation-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Attach logger to request object
    req.logger = createLogger({
        correlationId,
        method: req.method,
        path: req.path,
        userId: req.user?.userId,
        userRole: req.user?.role,
        ip: req.ip
    });

    // Log incoming request
    req.logger.info('Incoming request', {
        query: req.query,
        body: req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' ? req.body : undefined
    });

    // Log response when it's sent
    const originalSend = res.send;
    res.send = function (data: any) {
        req.logger.info('Outgoing response', {
            statusCode: res.statusCode,
            contentLength: res.get('content-length')
        });
        originalSend.call(this, data);
    };

    next();
}

/**
 * Enhanced logger with convenience methods
 */
export const Logger = {
    /**
     * Log error with stack trace
     */
    error: (message: string, meta?: Record<string, any>) => {
        logger.error(message, meta);
    },

    /**
     * Log warning
     */
    warn: (message: string, meta?: Record<string, any>) => {
        logger.warn(message, meta);
    },

    /**
     * Log info message
     */
    info: (message: string, meta?: Record<string, any>) => {
        logger.info(message, meta);
    },

    /**
     * Log debug message (only in development or when LOG_LEVEL=debug)
     */
    debug: (message: string, meta?: Record<string, any>) => {
        logger.debug(message, meta);
    },

    /**
     * Log database query
     */
    query: (query: string, params?: any[], meta?: Record<string, any>) => {
        logger.debug('[DB] Query executed', {
            query,
            params,
            ...meta
        });
    },

    /**
     * Log Lambda invocation
     */
    lambda: (functionName: string, payload: any, meta?: Record<string, any>) => {
        logger.info('[Lambda] Invoking function', {
            functionName,
            payload,
            ...meta
        });
    },

    /**
     * Log Lambda response
     */
    lambdaResponse: (functionName: string, response: any, meta?: Record<string, any>) => {
        logger.info('[Lambda] Function response', {
            functionName,
            statusCode: response.StatusCode,
            ...meta
        });
    },

    /**
     * Log authentication event
     */
    auth: (event: string, meta?: Record<string, any>) => {
        logger.info(`[Auth] ${event}`, meta);
    },

    /**
     * Log security event
     */
    security: (event: string, meta?: Record<string, any>) => {
        logger.warn(`[Security] ${event}`, meta);
    },

    /**
     * Create child logger with additional context
     */
    child: (context: Record<string, any>) => {
        return createLogger(context);
    }
};

export default Logger;