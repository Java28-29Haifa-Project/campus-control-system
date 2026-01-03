import express from 'express'
import {config} from "./configurations/app-config.js";
import {requestRoutes} from "./routes/request.routes.js";

import {errorHandler} from "./errors/error-handler.js";

export const launchServer = () => {
    const app = express();

    app.listen(config.port, () => {
        console.log(`Server runs at http://localhost:${config.port}`);
    });

    //==================Middleware=================
    app.use(express.json());

    //===================Router====================
    app.get('/health', (req, res) => {
        res.status(200).send({"status":"ok"});
    });
    app.use('/requests', requestRoutes);
    app.use((req, res) => {
        res.status(404).send("Page not found");
    })

    //==================ErrorHandler===============
    app.use(errorHandler);
}