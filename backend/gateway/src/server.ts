import express from 'express'
import {config} from './configurations/app-config.js';

import {requestRoutes} from './routes/request.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { incidentRoutes } from './routes/incident.routes.js';
import { monitoringRoutes } from './routes/monitoring.routes.js';
import { auditRoutes } from './routes/audit.routes.js';

import {errorHandler} from './errors/error-handler.js';

export const launchServer = () => {
    const app = express();

    app.listen(config.port, () => {
        console.log(`Server runs at http://localhost:${config.port}`);
    });

    //==================Middleware=================
    app.use(express.json());

    //===================Router====================
    app.get('/health', (req, res) => {
        res.status(200).send({'status':'ok'});
    });

    app.use('/health/lambdas', healthRoutes);

    app.use('/auth', authRoutes);
    app.use('/requests', requestRoutes);
    app.use('/incidents', incidentRoutes);
    app.use('/monitoring', monitoringRoutes);
    app.use('/audit', auditRoutes);

    app.use((req, res) => {
        res.status(404).send({error: 'Page not found'});
    })


    //==================ErrorHandler===============
    app.use(errorHandler);
}