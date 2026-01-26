import { Request, Response, NextFunction } from 'express';
import { requestQueryRepository } from '../repositories/impl/RequestQueryRepositoryDB.js';
import { requestWriteLambdaServiceAWS } from '../services/lambda-sdk/services/RequestWriteLambdaServiceAWS.js';
import { HttpError } from '../errors/http-error.js';

class RequestController {

    async getAllRequests(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new HttpError(401, 'Authentication required');
            }

            const status = req.query.status as any;
            const user = {
                userId: req.user.userId,
                role: req.user.role
            };

            const requests = await requestQueryRepository.getAllRequests(status, user);

            res.status(200).json(requests);

        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }

    async getRequestById(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new HttpError(401, 'Authentication required');
            }

            const { requestId } = req.params;

            const request = await requestQueryRepository.getRequestById(requestId);

            if (!request) {
                throw new HttpError(404, 'Request not found');
            }

            if (req.user.role === 'USER' && request.userId !== req.user.userId) {
                throw new HttpError(403, 'Access denied');
            }

            res.status(200).json(request);

        } catch (error: any) {
            next(error);
        }
    }

    async getRequestsByUser(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new HttpError(401, 'Authentication required');
            }

            const { userId } = req.params;
            const status = req.query.status as any;

            if (req.user.role === 'USER' && userId !== req.user.userId) {
                throw new HttpError(403, 'Access denied');
            }

            const requests = await requestQueryRepository.getRequestsByUser(userId, status);

            res.status(200).json(requests);

        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }

    async getUserRequestStats(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new HttpError(401, 'Authentication required');
            }

            const { userId } = req.params;

            if (req.user.role === 'USER' && userId !== req.user.userId) {
                throw new HttpError(403, 'Access denied');
            }

            const stats = await requestQueryRepository.getUserRequestStats(userId);

            res.status(200).json(stats);

        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }


    async createRequest(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new HttpError(401, 'Authentication required');
            }

            if (req.user.role !== 'USER') {
                throw new HttpError(403, 'Only users can create requests');
            }

            const { category, subject, userReportedPriority } = req.body;

            const result = await requestWriteLambdaServiceAWS.createRequest({
                action: 'CREATE_REQUEST',
                category,
                subject,
                userReportedPriority,
                createdBy: req.user.userId
            });

            res.status(201).json(result);

        } catch (error: any) {
            next(new HttpError(error.statusCode || 500, error.message));
        }
    }

    async updateRequest(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new HttpError(401, 'Authentication required');
            }

            const { requestId } = req.params;
            const { category, subject, userReportedPriority, status } = req.body;

            const existingRequest = await requestQueryRepository.getRequestById(requestId);

            if (!existingRequest) {
                throw new HttpError(404, 'Request not found');
            }

            if (req.user.role === 'USER' && existingRequest.userId !== req.user.userId) {
                throw new HttpError(403, 'Access denied: You can only update your own requests');
            }

            if (req.user.role === 'USER' && status !== undefined) {
                throw new HttpError(403, 'Access denied: Only support staff can change status');
            }

            const result = await requestWriteLambdaServiceAWS.updateRequest({
                action: 'UPDATE_REQUEST',
                requestId,
                category,
                subject,
                userReportedPriority,
                status: req.user.role !== 'USER' ? status : undefined,
                updatedBy: req.user.userId
            });

            res.status(200).json(result);

        } catch (error: any) {
            next(new HttpError(error.statusCode || 500, error.message));
        }
    }
}

export const requestController = new RequestController();