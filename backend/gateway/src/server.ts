import express from 'express'
import cookieParser from 'cookie-parser';
import cors from 'cors';
import {config} from './configurations/app-config.js';

import {requestRoutes} from './routes/request.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { incidentRoutes } from './routes/incident.routes.js';
import { monitoringRoutes } from './routes/monitoring.routes.js';
import { auditRoutes } from './routes/audit.routes.js';

import {errorHandler} from './errors/error-handler.js';
import { authMiddleware } from './middleware/auth.middleware.js';
import { requireRole } from './middleware/role.middleware.js';

export const launchServer = () => {
    const app = express();
    app.listen(config.port, '0.0.0.0', () => {
        console.log(`Server runs on port ${config.port}`);
    });


    //==================Middleware=================
    app.use(cors({
        origin: process.env.FRONTEND_URL || 'https://main.d2q14890n6r4m7.amplifyapp.com/',
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
        exposedHeaders: ['Set-Cookie']
    }));

    app.use(express.json());
    app.use(cookieParser());

    //===================Router====================
    app.get('/health', (req, res) => {
        res.status(200).send({'status':'ok'});
    });

    app.use('/health/lambdas', healthRoutes);
    app.use('/auth', authRoutes);

    app.use('/requests', authMiddleware, requestRoutes);
    app.use('/incidents', authMiddleware, requireRole('SUPPORT', 'ENGINEER', 'ADMIN'), incidentRoutes);
    app.use('/monitoring', authMiddleware, requireRole('ADMIN'), monitoringRoutes);
    app.use('/audit', authMiddleware, requireRole('ADMIN'), auditRoutes);

    app.use((req, res) => {
        res.status(404).send({error: 'Page not found'});
    })


    //==================ErrorHandler===============
    app.use(errorHandler);
}