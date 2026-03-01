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
    handleUncaughtException, requestIdMiddleware
} from './errors/error-handler.js';

import Logger, { requestLoggerMiddleware } from './utils/logger.js';
import {adminRoutes} from "./routes/admin.routes.js";

import swaggerUI from 'swagger-ui-express';
import { swaggerSpec } from './configurations/swagger.js';

export const launchServer = () => {
    const app = express();

    // ==================== Global Error Handlers ====================
    handleUnhandledRejection();
    handleUncaughtException();




    app.use(requestIdMiddleware);

    // ==================== Bot Filter ====================
    app.use((req, res, next) => {
        const path = req.path.toLowerCase();

        const blockExact = [
            '/',
            '/favicon.ico',
            '/heapdump',
            '/server-status'
        ];

        if (blockExact.includes(path)) {
            return res.status(204).end();
        }

        if (
            path.startsWith('/actuator') ||
            path.startsWith('/wp') ||
            path.startsWith('/php') ||
            path.startsWith('/.git') ||
            path.startsWith('/vendor')
        ) {
            return res.status(204).end();
        }

        const badPatterns = [
            'phpunit',
            'eval-stdin',
            '.env',
            'jmx-console',
            'boaform'
        ];

        if (badPatterns.some(p => path.includes(p))) {
            return res.status(204).end();
        }

        next();
    });

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

    // ==================== Swagger API Documentation ====================
    app.use('/api-docs', swaggerUI.serve);

    app.get('/api-docs', swaggerUI.setup(swaggerSpec, {
        customCss: `
            .swagger-ui .topbar { display: none; }
            .swagger-ui .info { margin: 40px 0; }
            .swagger-ui .info .title { font-size: 2.5em; color: #1f2937; }
        `,
        customSiteTitle: 'Express Gateway API Docs'
    }));

    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    // ==================== Health Check (No Auth, No Rate Limit) ====================
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'express-gateway',
            environment: process.env.NODE_ENV || 'development'
        });
    });

    app.use('/health/lambdas', generalRateLimiter, healthRoutes);

    // ==================== Authentication Routes ====================
    app.use('/auth', authRateLimiter, authRoutes);

    // ==================== Protected Routes ====================

    app.use('/requests',
        authMiddleware,
        (req, res, next) => {
            if (req.method === 'GET') {
                return readRateLimiter(req, res, next);
            } else {
                return writeRateLimiter(req, res, next);
            }
        },
        requestRoutes
    );

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

    // app.use('/monitoring',
    //     authMiddleware,
    //     requireRole('ADMIN'),
    //     readRateLimiter, // Monitoring is read-only
    //     monitoringRoutes
    // );

    app.use('/audit',
        authMiddleware,
        requireRole('ADMIN'),
        readRateLimiter,
        auditRoutes
    );

    app.use('/admin',
        authMiddleware,
        requireRole('ADMIN'),
        readRateLimiter,
        adminRoutes
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

            Logger.info('Graceful shutdown completed');
            process.exit(0);
        });

        setTimeout(() => {
            Logger.error('Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return app;
};