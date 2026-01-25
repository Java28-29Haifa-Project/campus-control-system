/**
 * Enhanced Error Handler Middleware
 *
 * Central error handling for the Express application.
 * - Maps errors to appropriate HTTP responses
 * - Logs errors with context
 * - Never exposes stack traces in production
 * - Handles both operational and programming errors
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, isOperationalError, mapDatabaseError, mapLambdaError } from './AppError.js';
import Logger from '../utils/logger.js';

/**
 * Development vs Production error responses
 */
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Error response interface
 */
interface ErrorResponse {
    error: string;
    message: string;
    statusCode: number;
    timestamp: string;
    path?: string;
    correlationId?: string;
    stack?: string;
    context?: Record<string, any>;
}

/**
 * Main error handler middleware
 */
export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Default error values
    let statusCode = 500;
    let message = 'Internal server error';
    let context: Record<string, any> | undefined;

    // Handle AppError instances
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        context = err.context;

        // Log based on severity
        if (statusCode >= 500) {
            Logger.error(`[Error] ${message}`, {
                statusCode,
                path: req.path,
                method: req.method,
                userId: req.user?.userId,
                context,
                stack: err.stack
            });
        } else if (statusCode >= 400) {
            Logger.warn(`[Error] ${message}`, {
                statusCode,
                path: req.path,
                method: req.method,
                userId: req.user?.userId,
                context
            });
        }
    }
    // Handle database errors
    else if (err.name === 'QueryFailedError' || (err as any).code) {
        const dbError = mapDatabaseError(err);
        statusCode = dbError.statusCode;
        message = dbError.message;
        context = dbError.context;

        Logger.error('[Database Error]', {
            message,
            statusCode,
            path: req.path,
            context,
            originalError: err.message
        });
    }
    // Handle JWT errors
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid authentication token';

        Logger.warn('[Auth Error] Invalid token', {
            path: req.path,
            error: err.message
        });
    }
    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Authentication token expired';

        Logger.warn('[Auth Error] Token expired', {
            path: req.path,
            userId: req.user?.userId
        });
    }
    // Handle validation errors (from express-validator or similar)
    else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message || 'Validation failed';

        Logger.warn('[Validation Error]', {
            message,
            path: req.path,
            body: req.body
        });
    }
    // Handle generic errors
    else {
        // Log unexpected errors with full details
        Logger.error('[Unexpected Error]', {
            message: err.message,
            name: err.name,
            path: req.path,
            method: req.method,
            userId: req.user?.userId,
            stack: err.stack
        });

        // Check if error should be operational
        if (isOperationalError(err)) {
            message = err.message;
        } else {
            // Don't expose internal error messages in production
            message = isProduction ? 'Internal server error' : err.message;
        }
    }

    // Build error response
    const errorResponse: ErrorResponse = {
        error: getErrorType(statusCode),
        message,
        statusCode,
        timestamp: new Date().toISOString(),
        path: req.path,
        correlationId: (req as any).correlationId
    };

    // Add stack trace in development only
    if (!isProduction && err.stack) {
        errorResponse.stack = err.stack;
    }

    // Add context in development only
    if (!isProduction && context) {
        errorResponse.context = context;
    }

    // Send error response
    res.status(statusCode).json(errorResponse);
};

/**
 * Get error type name from status code
 */
function getErrorType(statusCode: number): string {
    switch (statusCode) {
        case 400:
            return 'Bad Request';
        case 401:
            return 'Unauthorized';
        case 403:
            return 'Forbidden';
        case 404:
            return 'Not Found';
        case 409:
            return 'Conflict';
        case 422:
            return 'Unprocessable Entity';
        case 429:
            return 'Too Many Requests';
        case 500:
            return 'Internal Server Error';
        case 502:
            return 'Bad Gateway';
        case 503:
            return 'Service Unavailable';
        case 504:
            return 'Gateway Timeout';
        default:
            return 'Error';
    }
}

/**
 * Handle unhandled promise rejections
 */
export const handleUnhandledRejection = () => {
    process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
        Logger.error('[Unhandled Rejection]', {
            reason: reason?.message || reason,
            stack: reason?.stack
        });

        // Don't crash the server, but log it
        // In production, you might want to exit and let the process manager restart
        if (isProduction) {
            Logger.error('[Critical] Unhandled rejection detected, consider restarting');
            // Optionally: process.exit(1);
        }
    });
};

/**
 * Handle uncaught exceptions
 */
export const handleUncaughtException = () => {
    process.on('uncaughtException', (error: Error) => {
        Logger.error('[Uncaught Exception]', {
            message: error.message,
            stack: error.stack
        });

        // In production, gracefully shutdown
        if (isProduction) {
            Logger.error('[Critical] Uncaught exception, shutting down gracefully');
            process.exit(1);
        }
    });
};

/**
 * 404 Not Found handler (should be registered as last route)
 */
export const notFoundHandler = (req: Request, res: Response) => {
    Logger.warn('[Not Found]', {
        path: req.path,
        method: req.method,
        query: req.query
    });

    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        statusCode: 404,
        timestamp: new Date().toISOString(),
        path: req.path
    });
};