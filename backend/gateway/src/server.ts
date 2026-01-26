import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './configurations/app-config.js';

import { requestRoutes } from './routes/request.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { incidentRoutes } from './routes/incident.routes.js';
import { monitoringRoutes } from './routes/monitoring.routes.js';
import { auditRoutes } from './routes/audit.routes.js';

import { authMiddleware } from './middleware/auth.middleware.js';
import { requireRole } from './middleware/role.middleware.js';
import {
    authRateLimiter,
    readRateLimiter,
    writeRateLimiter,
    generalRateLimiter
} from './middleware/rate-limit.middleware.js';
import { sanitizeRequest } from './middleware/validation.middleware.js';

import {
    errorHandler,
    notFoundHandler,
    handleUnhandledRejection,
    handleUncaughtException
} from './errors/error-handler.js';

import Logger, { requestLoggerMiddleware } from './utils/logger.js';

export const launchServer = () => {
    const app = express();

    // ==================== Global Error Handlers ====================
    handleUnhandledRejection();
    handleUncaughtException();

    // ==================== Security Middleware ====================

    app.use(helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false
    }));

    app.use(cors({
        origin: process.env.FRONTEND_URL || 'https://main.d2q14890n6r4m7.amplifyapp.com',
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Correlation-ID'],
        exposedHeaders: ['Set-Cookie']
    }));

    // ==================== Body Parsing ====================
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    app.use(cookieParser());

    // ==================== Request Sanitization ====================
    app.use(sanitizeRequest);

    // ==================== Logging ====================
    app.use(requestLoggerMiddleware);

    // ==================== Health Check (No Auth, No Rate Limit) ====================
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'express-gateway',
            environment: process.env.NODE_ENV || 'development'
        });
    });

    // Health checks for Lambda services
    app.use('/health/lambdas', generalRateLimiter, healthRoutes);

    // ==================== Authentication Routes ====================
    // Apply strict rate limiting to auth endpoints
    app.use('/auth', authRateLimiter, authRoutes);

    // ==================== Protected Routes ====================

    // Requests/Tickets routes
    // - GET requests: read rate limiter
    // - POST/PATCH requests: write rate limiter
    app.use('/requests',
        authMiddleware, // Require authentication
        (req, res, next) => {
            if (req.method === 'GET') {
                return readRateLimiter(req, res, next);
            } else {
                return writeRateLimiter(req, res, next);
            }
        },
        requestRoutes
    );

    // Incidents routes (SUPPORT, ENGINEER, ADMIN only)
    app.use('/incidents',
        authMiddleware,
        requireRole('SUPPORT', 'ENGINEER', 'ADMIN'),
        (req, res, next) => {
            if (req.method === 'GET') {
                return readRateLimiter(req, res, next);
            } else {
                return writeRateLimiter(req, res, next);
            }
        },
        incidentRoutes
    );

    // Monitoring routes (ADMIN only)
    app.use('/monitoring',
        authMiddleware,
        requireRole('ADMIN'),
        readRateLimiter, // Monitoring is read-only
        monitoringRoutes
    );

    // Audit routes (ADMIN only)
    app.use('/audit',
        authMiddleware,
        requireRole('ADMIN'),
        writeRateLimiter, // Audit is write-only (sending events)
        auditRoutes
    );

    // ==================== 404 Handler ====================
    app.use(notFoundHandler);

    // ==================== Error Handler (Must be last) ====================
    app.use(errorHandler);

    // ==================== Start Server ====================
    const server = app.listen(config.port, '0.0.0.0', () => {
        Logger.info('Server started successfully', {
            port: config.port,
            environment: process.env.NODE_ENV || 'development',
            nodeVersion: process.version
        });
    });

    // ==================== Graceful Shutdown ====================
    const gracefulShutdown = (signal: string) => {
        Logger.info(`${signal} received, starting graceful shutdown`);

        server.close(() => {
            Logger.info('HTTP server closed');

            // Close database connections
            // Close Redis connections
            // etc.

            Logger.info('Graceful shutdown completed');
            process.exit(0);
        });

        // Force shutdown after 10 seconds
        setTimeout(() => {
            Logger.error('Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return app;
};