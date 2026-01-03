import {requestServiceAWSLambdaStub} from '../services/impl/RequestServiceImplAWSLambdaStub.js';
import {RequestService} from '../services/RequestService.js';
import {Request, Response} from 'express';
import {TicketRequestStatus} from '../types/ticketRequest.js';

class RequestController {
    private service: RequestService = requestServiceAWSLambdaStub;
    getAllRequests = async (req: Request, res: Response) => {
        const statusParam = req.query.status;

        let status:  TicketRequestStatus | undefined;

        if (typeof statusParam === 'string') {
            if (!Object.values(TicketRequestStatus).includes(statusParam as TicketRequestStatus)) {
                return res.status(400).json({error: 'Invalid status'});
            }
            status = statusParam as TicketRequestStatus;
        }

        const result = await this.service.getAllRequests(status);
        res.json(result);
    }
}

export const  requestController = new RequestController();