import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const RequestValidationSchemas = {
    createRequest: z.object({
        category: z.enum(['plumbing', 'electrical', 'general']),
        subject: z.string().min(10).max(500),
        userReportedPriority: z.enum(['low', 'medium', 'high', 'urgent']),
        description: z.string().min(10).max(2000).optional()
    }),

    updateRequest: z.object({
        category: z.enum(['plumbing', 'electrical', 'general']).optional(),
        subject: z.string().min(10).max(500).optional(),
        description: z.string().min(10).max(2000).optional(),
        userReportedPriority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
        status: z.enum(['new', 'rejected', 'in_service', 'done']).optional()
    })
};

export const AuthValidationSchemas = {
    login: z.object({
        email: z.string().email(),
        password: z.string().min(6)
    })
};

export const QueryValidationSchemas = {
    requestStatus: z.object({
        status: z.enum(['new', 'rejected', 'in_service', 'done']).optional()
    })
};

export function validate(schema: z.ZodSchema, source: 'body' | 'params' | 'query' = 'body') {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await schema.parseAsync(req[source]);

            // Only reassign if not query (query is read-only)
            if (source !== 'query') {
                req[source] = validated;
            }

            next();
        } catch (error: any) {
            res.status(400).json({
                error: 'Validation failed',
                details: error.issues || error.message
            });
        }
    };
}

export function sanitizeRequest(req: Request, res: Response, next: NextFunction) {
    next();
}