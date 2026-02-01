import { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError.js';
import Logger from '../utils/logger.js';
import { randomUUID } from 'crypto';

export class ValidationError extends AppError {
    constructor(message: string, public details?: any) {
        super(message, 400);
    }
}

export class ServiceUnavailableError extends AppError {
    constructor(message: string = 'Service temporarily unavailable', public retryAfter: number = 60) {
        super(message, 503);
    }
}

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
    (req as any).requestId = randomUUID();
    res.setHeader('X-Request-ID', (req as any).requestId);
    next();
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const requestId = (req as any).requestId || randomUUID();
    let statusCode = 500;
    let message = err.message || 'Internal server error';

    if (err instanceof AppError) {
        statusCode = err.statusCode;
    } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Invalid or expired token';
    } else if (err.name === 'ValidationError') {
        statusCode = 400;
    } else if (message.includes('Invalid credentials') || message.includes('Authentication required')) {
        statusCode = 401;
    } else if (message.includes('Access denied') || message.includes('Forbidden')) {
        statusCode = 403;
    } else if (message.includes('Not found')) {
        statusCode = 404;
    } else if (message.includes('Lambda') || message.includes('Function not found') ||
        message.includes('timeout') || message.includes('timed out')) {
        statusCode = 503;
        message = 'Service temporarily unavailable';
    }

    const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    Logger[logLevel]('Request error', {
        error: message,
        statusCode,
        path: req.path,
        method: req.method,
        requestId,
        userId: (req as any).user?.userId,
        stack: err.stack
    });

    const response: any = {
        error: message,
        statusCode,
        timestamp: new Date().toISOString(),
        path: req.path,
        requestId
    };

    if (err instanceof ValidationError && err.details) {
        response.details = err.details;
    }

    if (err instanceof ServiceUnavailableError) {
        response.retryAfter = err.retryAfter;
        res.setHeader('Retry-After', err.retryAfter.toString());
    }

    res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response) => {
    const requestId = (req as any).requestId || randomUUID();

    Logger.warn('Route not found', {
        path: req.path,
        method: req.method,
        requestId
    });

    res.status(404).json({
        error: 'Route not found',
        statusCode: 404,
        timestamp: new Date().toISOString(),
        path: req.path,
        requestId
    });
};

export const handleUnhandledRejection = () => {
    process.on('unhandledRejection', (reason: any) => {
        Logger.error('Unhandled Rejection', {
            reason: reason?.message || reason,
            stack: reason?.stack
        });
    });
};

export const handleUncaughtException = () => {
    process.on('uncaughtException', (error: Error) => {
        Logger.error('Uncaught Exception', {
            error: error.message,
            stack: error.stack
        });
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    });
};

export const mapLambdaError = (error: any): AppError => {
    const msg = error.message || 'Lambda execution failed';
    if (msg.includes('timeout') || msg.includes('timed out')) {
        return new ServiceUnavailableError('Service temporarily unavailable', 30);
    }
    if (msg.includes('throttl') || msg.includes('rate limit')) {
        return new ServiceUnavailableError('Too many requests', 60);
    }
    if (msg.includes('not found')) {
        return new AppError(msg, 404);
    }
    return new AppError('Internal server error', 500);
};

export const mapDatabaseError = (error: any): AppError => {
    const msg = error.message || 'Database error';
    if (msg.includes('connect') || msg.includes('ECONNREFUSED') || msg.includes('timeout')) {
        return new ServiceUnavailableError('Database temporarily unavailable', 30);
    }
    if (msg.includes('unique') || msg.includes('duplicate')) {
        return new ValidationError('Resource already exists');
    }
    if (msg.includes('foreign key')) {
        return new ValidationError('Referenced resource not found');
    }
    return new AppError('Database error', 500);
};