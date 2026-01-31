import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// ==================== Request (Ticket) Validation Schemas ====================

export const RequestValidationSchemas = {
    createRequest: z.object({
        category: z.enum([
            'plumbing',
            'electrical',
            'hvac',
            'gas',
            'fire_safety',
            'elevators',
            'access',
            'network',
            'infrastructure',
            'other'
            // 'system' NOT allowed - only notification MS can use
        ]),
        subject: z.string().min(10).max(500),
        userReportedPriority: z.enum(['low', 'medium', 'high', 'urgent']),
        description: z.string().max(2000).optional()
    }),

    updateRequest: z.object({
        category: z.enum([
            'plumbing',
            'electrical',
            'hvac',
            'gas',
            'fire_safety',
            'elevators',
            'access',
            'network',
            'infrastructure',
            'other'
        ]).optional(),
        subject: z.string().min(10).max(500).optional(),
        description: z.string().max(2000).optional(),
        userReportedPriority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
        status: z.enum(['new', 'rejected', 'in_service', 'done']).optional()
    }),

    updateStatusBySupport: z.object({
        // Support should not be able to set status back to 'new'
        status: z.enum(['rejected', 'in_service', 'done'])
    })
};

// ==================== Incident Validation Schemas ====================

export const IncidentValidationSchemas = {
    createIncident: z.object({
        ticketIds: z.array(z.string()).min(1, 'At least one ticket ID is required'),
        impact: z.enum(['low', 'medium', 'high', 'critical']),
        urgency: z.enum(['low', 'medium', 'high']),
        category: z.enum([
            'plumbing',
            'electrical',
            'hvac',
            'gas',
            'fire_safety',
            'elevators',
            'access',
            'network',
            'infrastructure',
            'other',
            'system'
        ]),
        description: z.string().max(2000).optional()
        // createdBy will be extracted from req.user in controller
    }),

    updateIncidentStatus: z.object({
        status: z.enum(['new', 'assigned', 'in_progress', 'resolved']),
        comment: z.string().max(500).optional()
        // updatedBy will be extracted from req.user in controller
    }),

    raiseIncidentPriority: z.object({
        priority: z.number().int().min(1).max(4),  // 1 is highest, 4 is lowest
        comment: z.string().max(500).optional()
        // updatedBy will be extracted from req.user in controller
    })
};

// ==================== Query Validation Schemas ====================

export const QueryValidationSchemas = {
    requestStatus: z.object({
        status: z.enum(['new', 'rejected', 'in_service', 'done']).optional()
    }),

    requestFilters: z.object({
        status: z.enum(['new', 'rejected', 'in_service', 'done']).optional(),
        category: z.enum([
            'plumbing',
            'electrical',
            'hvac',
            'gas',
            'fire_safety',
            'elevators',
            'access',
            'network',
            'infrastructure',
            'other',
            'system'
        ]).optional(),
        priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional()
    }),

    incidentFilters: z.object({
        status: z.enum(['new', 'assigned', 'in_progress', 'resolved', 'closed']).optional(),
        priority: z.number().int().min(1).max(4).optional(),
        category: z.enum([
            'plumbing',
            'electrical',
            'hvac',
            'gas',
            'fire_safety',
            'elevators',
            'access',
            'network',
            'infrastructure',
            'other',
            'system'
        ]).optional(),
        assignedTo: z.string().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional()
    })
};

// ==================== Auth Validation Schemas ====================

export const AuthValidationSchemas = {
    login: z.object({
        email: z.string().email(),
        password: z.string().min(6)
    }),
    register: z.object({
        name: z.string().min(2).max(100),
        email: z.string().email(),
        password: z.string().min(6)
    })
};

// ==================== Validation Middleware ====================

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

// ==================== Request Sanitization ====================

export function sanitizeRequest(req: Request, res: Response, next: NextFunction) {
    //TODO expand logic ?~
    next();
}