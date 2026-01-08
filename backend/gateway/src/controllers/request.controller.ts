//TODO

import { requestServiceAWSLambda } from '../services/impl/RequestServiceImplAWSLambda.js';
import { RequestService } from '../services/RequestService.js';
import { Request, Response } from 'express';
import { TicketRequestStatus, CreateRequestInput, UpdateRequestInput } from '../types/ticketRequest.js';

class RequestController {
    private service: RequestService = requestServiceAWSLambda;

    getAllRequests = async (req: Request, res: Response) => {
        const statusParam = req.query.status;
        let status: TicketRequestStatus | undefined;

        if (typeof statusParam === 'string') {
            if (!Object.values(TicketRequestStatus).includes(statusParam as TicketRequestStatus)) {
                return res.status(400).json({ error: 'Invalid status' });
            }
            status = statusParam as TicketRequestStatus;
        }

        const result = await this.service.getAllRequests(status);
        res.json(result);
    }

    getRequestById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await this.service.getRequestById(id);
        if (!result) return res.status(404).json({ error: 'Request not found' });
        res.json(result);
    }

    createRequest = async (req: Request, res: Response) => {
        const input: CreateRequestInput = req.body;
        const result = await this.service.createRequest(input);
        res.status(201).json(result);
    }

    updateRequest = async (req: Request, res: Response) => {
        const input: UpdateRequestInput = {
            requestId: req.params.id,
            ...req.body
        };
        const result = await this.service.updateRequest(input);
        res.json(result);
    }
}

export const requestController = new RequestController();
