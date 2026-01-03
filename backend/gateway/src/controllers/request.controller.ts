import {requestServiceAWSLambda} from "../services/impl/requestServiceAWSLambda";
import {RequestService} from "../services/RequestService";

class RequestController {
    private service: RequestService = requestServiceAWSLambda;
    getAllRequests = async (req: Request, res: Response) => {
        const result = await.this.service.getAllRequests();
        res.json(result);
    }
}

export const  requestController = new RequestController();