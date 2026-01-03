import {requestServiceAWSLambdaStub} from "../services/impl/RequestServiceImplAWSLambdaStub.js";
import {RequestService} from "../services/RequestService.js";
import {Request, Response} from "express";

class RequestController {
    private service: RequestService = requestServiceAWSLambdaStub;
    getAllRequests = async (req: Request, res: Response) => {
        const result = await this.service.getAllRequests();
        res.json(result);
    }
}

export const  requestController = new RequestController();