import { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
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
    } else if (message.includes('Lambda') || message.includes('Function not found')) {
        statusCode = 503;
        message = 'Service temporarily unavailable';
    }

    console.error(`[ERROR] ${statusCode} - ${message}`);

    res.status(statusCode).json({
        error: message,
        statusCode,
        timestamp: new Date().toISOString(),
        path: req.path
    });
};

export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({
        error: 'Not found',
        statusCode: 404,
        path: req.path
    });
};

export const handleUnhandledRejection = () => {
    process.on('unhandledRejection', (reason: any) => {
        console.error('[Unhandled Rejection]', reason);
    });
};

export const handleUncaughtException = () => {
    process.on('uncaughtException', (error: Error) => {
        console.error('[Uncaught Exception]', error);
    });
};