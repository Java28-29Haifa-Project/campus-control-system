import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';


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
        ]),
        subject: z.string().min(5).max(500),
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
        subject: z.string().min(5).max(500).optional(),
        description: z.string().max(2000).optional(),
        userReportedPriority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
        status: z.enum(['new', 'rejected', 'in_service', 'done']).optional()
    }),

    updateStatusBySupport: z.object({
        status: z.enum(['rejected', 'in_service', 'done'])
    })
};


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
    }),

    updateIncidentStatus: z.object({
        status: z.enum(['new', 'assigned', 'in_progress', 'resolved']),
        comment: z.string().max(500).optional()
    }),

    raiseIncidentPriority: z.object({
        priority: z.number().int().min(1).max(4),  // 1 is highest, 4 is lowest
        comment: z.string().max(500).optional()
    })
};


const isoDateString = z.string().refine(
    (date) => {
        if (!date) return true;  // Optional
        const parsed = new Date(date);
        return !isNaN(parsed.getTime());
    },
    { message: 'Invalid date format. Use ISO 8601 (YYYY-MM-DD)' }
).optional();

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
        userId: z.string().optional(),
        dateFrom: isoDateString,
        dateTo: isoDateString
    }),

    incidentFilters: z.object({
        status: z.enum(['new', 'assigned', 'in_progress', 'resolved', 'closed']).optional(),
        priority: z.string()
            .optional()
            .refine((val) => {
                if (!val) return true;
                const num = parseInt(val);
                return !isNaN(num) && num >= 1 && num <= 4;
            }, { message: 'Priority must be 1, 2, 3, or 4' }),
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
        assignedBy: z.string().optional(),
        dateFrom: isoDateString,
        dateTo: isoDateString
    })
};


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


export function validate(schema: z.ZodSchema, source: 'body' | 'params' | 'query' = 'body') {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await schema.parseAsync(req[source]);

            if (source !== 'query') {
                req[source] = validated;
            }

            next();
        } catch (error: any) {
            res.status(400).json({
                error: 'Validation failed',
                statusCode: 400,
                timestamp: new Date().toISOString(),
                path: req.path,
                details: error.issues || error.message
            });
        }
    };
}


//TODO : remove potentially dangerous chars, custom XSS protection, SQL injection prevention etc
export function sanitizeRequest(req: Request, res: Response, next: NextFunction) {
    next();
}

export function parseDateFilters(query: any): { dateFrom?: Date; dateTo?: Date } {
    const result: { dateFrom?: Date; dateTo?: Date } = {};

    if (query.dateFrom) {
        const parsed = new Date(query.dateFrom);
        if (!isNaN(parsed.getTime())) {
            result.dateFrom = parsed;
        }
    }

    if (query.dateTo) {
        const parsed = new Date(query.dateTo);
        if (!isNaN(parsed.getTime())) {
            // Set to end of day
            parsed.setHours(23, 59, 59, 999);
            result.dateTo = parsed;
        }
    }

    return result;
}

