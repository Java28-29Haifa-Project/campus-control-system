import { requestServiceAWSLambda } from '../services/impl/RequestServiceImplAWSLambda.js';
import { RequestService } from '../services/RequestService.js';
import { Request, Response, NextFunction } from 'express';
import { TicketRequestStatus, CreateRequestInput, UpdateRequestInput } from '../types/ticketRequest.js';

class RequestController {
    private service: RequestService = requestServiceAWSLambda;

    getAllRequests = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const statusParam = req.query.status;
            let status: TicketRequestStatus | undefined;

            if (typeof statusParam === 'string') {
                if (!Object.values(TicketRequestStatus).includes(statusParam as TicketRequestStatus)) {
                    return res.status(400).json({ error: 'Invalid status' });
                }
                status = statusParam as TicketRequestStatus;
            }

            const result = await this.service.getAllRequests(status);

            if (req.user?.role === 'USER') {
                const filteredResult = result.filter((r: any) => r.userId === req.user?.userId);
                return res.json(filteredResult);
            }

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    getRequestById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const result = await this.service.getRequestById(id);

            if (!result) {
                return res.status(404).json({ error: 'Request not found' });
            }

            if (req.user?.role === 'USER' && (result as any).userId !== req.user.userId) {
                return res.status(403).json({ error: 'Access denied - not your request' });
            }

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    createRequest = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const input: CreateRequestInput = {
                ...req.body,
                userId: req.user?.userId
            };
            const result = await this.service.createRequest(input);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    updateRequest = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const input: UpdateRequestInput = {
                requestId: req.params.id,
                ...req.body
            };
            const result = await this.service.updateRequest(input);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}

export const requestController = new RequestController();