import { HttpError } from "./HttpError.js";
import { NextFunction, Request, Response } from "express";

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof HttpError) {
        res.status(err.status).send(err.message);
    } else if (err instanceof Error) {
        res.status(400).send('Invalid request: ' + err.message);
    } else {
        res.status(500).send('Unknown server error: ' + err);
    }
}
