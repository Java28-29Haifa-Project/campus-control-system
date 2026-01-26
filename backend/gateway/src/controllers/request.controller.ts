import { Request, Response, NextFunction } from 'express';
import { requestQueryRepository } from '../repositories/impl/RequestQueryRepositoryDB.js';
import { requestServiceAWSLambda } from '../services/impl/RequestServiceImplAWSLambda.js';
import { RequestService } from '../services/RequestService.js';
import { RequestQueryRepository } from '../repositories/RequestQueryRepository.js';
import { CreateRequestInput, UpdateRequestInput } from '../types/ticketRequest.js';
import { NotFoundError, ForbiddenError } from '../errors/AppError.js';
import Logger from '../utils/logger.js';

class RequestController {
    private writeService: RequestService;
    private readRepository: RequestQueryRepository;

    constructor(
        writeService: RequestService = requestServiceAWSLambda,
        readRepository: RequestQueryRepository = requestQueryRepository
    ) {
        this.writeService = writeService;
        this.readRepository = readRepository;
    }

    getAllRequests = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { status } = req.query;
            const user = req.user;

            Logger.info('[RequestController] Getting all requests', {
                userId: user?.userId,
                role: user?.role,
                status
            });

            const requests = await this.readRepository.getAllRequests(
                status as any,
                user
            );

            Logger.info('[RequestController] Successfully retrieved requests', {
                count: requests.length,
                userId: user?.userId
            });

            res.status(200).json(requests);
        } catch (error) {
            Logger.error('[RequestController] Error getting requests', {
                error,
                userId: req.user?.userId
            });
            next(error);
        }
    };

    getRequestById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const user = req.user;

            Logger.info('[RequestController] Getting request by ID', {
                requestId: id,
                userId: user?.userId,
                role: user?.role
            });

            const request = await this.readRepository.getRequestById(id);

            if (!request) {
                throw new NotFoundError('Request');
            }

            if (user?.role === 'USER' && request.userId !== user.userId) {
                Logger.security('Unauthorized request access attempt', {
                    requestId: id,
                    requestOwner: request.userId,
                    attemptedBy: user.userId
                });
                throw new ForbiddenError('You can only access your own requests');
            }

            Logger.info('[RequestController] Successfully retrieved request', {
                requestId: id,
                userId: user?.userId
            });

            res.status(200).json(request);
        } catch (error) {
            Logger.error('[RequestController] Error getting request by ID', {
                error,
                requestId: req.params.id,
                userId: req.user?.userId
            });
            next(error);
        }
    };

    getUserStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.params;
            const currentUser = req.user;

            if (currentUser?.role === 'USER' && userId !== currentUser.userId) {
                throw new ForbiddenError('You can only access your own statistics');
            }

            Logger.info('[RequestController] Getting user stats', {
                targetUserId: userId,
                requestedBy: currentUser?.userId
            });

            const stats = await this.readRepository.getUserRequestStats(userId);

            Logger.info('[RequestController] Successfully retrieved user stats', {
                userId,
                total: stats.total
            });

            res.status(200).json(stats);
        } catch (error) {
            Logger.error('[RequestController] Error getting user stats', {
                error,
                userId: req.params.userId
            });
            next(error);
        }
    };

    createRequest = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;

            const input: CreateRequestInput = {
                category: req.body.category,
                subject: req.body.subject,
                userReportedPriority: req.body.userReportedPriority,
                createdBy: user!.userId
            };

            Logger.info('[RequestController] Creating new request', {
                userId: user?.userId,
                category: input.category,
                priority: input.userReportedPriority
            });

            const result = await this.writeService.createRequest(input);

            Logger.info('[RequestController] Successfully created request', {
                requestId: result.requestId,
                requestNumber: result.requestNumber,
                userId: user?.userId
            });

            res.status(201).json(result);
        } catch (error) {
            Logger.error('[RequestController] Error creating request', {
                error,
                userId: req.user?.userId,
                body: req.body
            });
            next(error);
        }
    };

    updateRequest = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const user = req.user;

            const existingRequest = await this.readRepository.getRequestById(id);

            if (!existingRequest) {
                throw new NotFoundError('Request');
            }

            if (user?.role === 'USER' && existingRequest.userId !== user.userId) {
                Logger.security('Unauthorized request update attempt', {
                    requestId: id,
                    requestOwner: existingRequest.userId,
                    attemptedBy: user.userId
                });
                throw new ForbiddenError('You can only update your own requests');
            }

            const input: UpdateRequestInput = {
                requestId: id,
                category: req.body.category,
                subject: req.body.subject,
                userReportedPriority: req.body.userReportedPriority,
                status: req.body.status,
                updatedBy: user!.userId
            };

            Logger.info('[RequestController] Updating request', {
                requestId: id,
                userId: user?.userId,
                updates: req.body
            });

            const result = await this.writeService.updateRequest(input);

            Logger.info('[RequestController] Successfully updated request', {
                requestId: id,
                userId: user?.userId
            });

            res.status(200).json(result);
        } catch (error) {
            Logger.error('[RequestController] Error updating request', {
                error,
                requestId: req.params.id,
                userId: req.user?.userId,
                body: req.body
            });
            next(error);
        }
    };
}

export const requestController = new RequestController();