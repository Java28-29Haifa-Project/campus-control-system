import express from 'express'
import {config} from "./configurations/appConfig.js";

import {errorHandler} from "./errorHandler/errorHandler.js";

export const launchServer = () => {
    const app = express();

    app.listen(config.port, () => {
        console.log(`Server runs at http://localhost:${config.port}`);
    })

    //==================Middleware=================
    app.use(express.json())

    //===================Router====================
    app.use((req, res) => {
        res.status(404).send("Page not found")
    })

    //==================ErrorHandler===============
    app.use(errorHandler);
}