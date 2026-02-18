import { Request, Response, NextFunction } from 'express';
import { requestQueryRepository } from '../repositories/impl/RequestQueryRepositoryDB.js';
import { requestWriteLambdaServiceAWS } from '../services/lambda-sdk/services/RequestWriteLambdaServiceAWS.js';
import { HttpError } from '../errors/http-error.js';
import {TicketRequestStatus} from "../types/ticketRequest.js";
import { parseDateFilters } from '../middleware/validation.middleware.js';
import Logger from "../utils/logger.js";


class RequestController {

    async getAllRequests(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new HttpError(401, 'Authentication required');

            const statusRaw = Array.isArray(req.query.status) ? req.query.status[0] : req.query.status;
            const status: TicketRequestStatus | undefined = Object.values(TicketRequestStatus).includes(statusRaw as TicketRequestStatus)
                ? (statusRaw as TicketRequestStatus)
                : undefined;

            const user = {
                userId: req.user.userId,
                role: req.user.role
            };

            const { dateFrom, dateTo } = parseDateFilters(req.query);
            const filters = {
                category: req.query.category as string,
                priority: req.query.priority as string,
                dateFrom,
                dateTo
            }

            const requests = await requestQueryRepository.getAllRequests(status, user, filters);
            res.status(200).json(requests);

        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }

    async getRequestById(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new HttpError(401, 'Authentication required');

            const requestId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const request = await requestQueryRepository.getRequestById(requestId);

            if (!request) throw new HttpError(404, 'Request not found');
            if (req.user.role === 'USER' && request.userId !== req.user.userId) throw new HttpError(403, 'Access denied');

            res.status(200).json(request);

        } catch (error: any) {
            next(error);
        }
    }

    async getRequestsByUser(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new HttpError(401, 'Authentication required');

            const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
            const statusRaw = Array.isArray(req.query.status) ? req.query.status[0] : req.query.status;
            const status: TicketRequestStatus | undefined = Object.values(TicketRequestStatus).includes(statusRaw as TicketRequestStatus)
                ? (statusRaw as TicketRequestStatus)
                : undefined;

            if (req.user.role === 'USER' && userId !== req.user.userId) throw new HttpError(403, 'Access denied');

            const requests = await requestQueryRepository.getRequestsByUser(userId, status);
            res.status(200).json(requests);

        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }

    async getUserRequestStats(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new HttpError(401, 'Authentication required');

            const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
            if (req.user.role === 'USER' && userId !== req.user.userId) throw new HttpError(403, 'Access denied');

            const stats = await requestQueryRepository.getUserRequestStats(userId);
            res.status(200).json(stats);

        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }

    async createRequest(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new HttpError(401, 'Authentication required');
            if (req.user.role !== 'USER') throw new HttpError(403, 'Only users can create requests');

            Logger.info('Request creation started', {
                userId: req.user!.userId,
                category: req.body.category
            });

            const { category, subject, description, userReportedPriority } = req.body;
            const result = await requestWriteLambdaServiceAWS.createRequest({
                action: 'CREATE_REQUEST',
                category,
                subject,
                description,
                userReportedPriority,
                createdBy: req.user!.userId
            });

            Logger.info('Request created successfully', {
                userId: req.user!.userId,
                requestId: result.requestId
            });

            res.status(201).json(result);
        } catch (error: any) {
            Logger.error('Request creation failed', {
                userId: req.user?.userId,
                error: error.message,
                stack: error.stack
            });
            next(new HttpError(error.statusCode || 500, error.message));
        }
    }

    async updateRequest(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new HttpError(401, 'Authentication required');

            const requestId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const { category, subject, description, userReportedPriority, status } = req.body;

            const existingRequest = await requestQueryRepository.getRequestById(requestId);
            if (!existingRequest) throw new HttpError(404, 'Request not found');

            if (req.user.role === 'USER' && existingRequest.userId !== req.user.userId)
                throw new HttpError(403, 'Access denied: You can only update your own requests');

            if (req.user.role === 'USER' && status !== undefined)
                throw new HttpError(403, 'Access denied: Only support staff can change status');

            const result = await requestWriteLambdaServiceAWS.updateRequest({
                action: 'UPDATE_REQUEST',
                requestId,
                category,
                subject,
                description,
                userReportedPriority,
                status: Object.values(TicketRequestStatus).includes(status as TicketRequestStatus) ? (status as TicketRequestStatus) : undefined,
                updatedBy: req.user.userId
            });

            res.status(200).json(result);

        } catch (error: any) {
            next(new HttpError(error.statusCode || 500, error.message));
        }
    }

    async updateRequestStatus(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new HttpError(401, 'Authentication required');

            const requestId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const { status } = req.body;

            const existing = await requestQueryRepository.getRequestById(requestId);
            if (!existing) throw new HttpError(404, 'Request not found');

            const result = await requestWriteLambdaServiceAWS.updateRequestStatus({
                requestId,
                status,
                updatedBy: req.user.userId
            });

            res.status(200).json(result);

        } catch (error) {
            next(error);
        }
    }

}

export const requestController = new RequestController();
