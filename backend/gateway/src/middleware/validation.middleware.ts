/**
 * Request Validation Middleware
 *
 * Provides schema-based validation for request bodies, params, and queries.
 * Uses Zod for type-safe validation with clear error messages.
 */

import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors/AppError.js';

/**
 * Validation schemas for ticket requests
 */
export const RequestValidationSchemas = {
    /**
     * Schema for creating a new request
     */
    createRequest: z.object({
        category: z.enum(['plumbing', 'electrical', 'general'], {
            message: 'Category must be one of: plumbing, electrical, general'
        }),
        subject: z.string()
            .min(10, 'Subject must be at least 10 characters')
            .max(500, 'Subject must not exceed 500 characters')
            .trim(),
        userReportedPriority: z.enum(['low', 'medium', 'high', 'urgent'], {
            message: 'Priority must be one of: low, medium, high, urgent'
        })
    }),


    /**
     * Schema for updating a request
     */
    updateRequest: z.object({
        category: z.enum(['plumbing', 'electrical', 'general']).optional(),
        subject: z.string()
            .min(10, 'Subject must be at least 10 characters')
            .max(500, 'Subject must not exceed 500 characters')
            .trim()
            .optional(),
        userReportedPriority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
        status: z.enum(['new', 'rejected', 'in_service', 'done']).optional()
    }).refine(
        (data) => Object.keys(data).length > 0,
        { message: 'At least one field must be provided for update' }
    ),

    /**
     * Schema for request ID parameter
     */
    requestId: z.object({
        id: z.string().uuid('Invalid request ID format')
    })
};

/**
 * Validation schemas for incidents
 */
export const IncidentValidationSchemas = {
    /**
     * Schema for creating an incident
     */
    createIncident: z.object({
        ticketIds: z.array(z.string().uuid())
            .min(1, 'At least one ticket ID is required'),
        impact: z.string()
            .min(3, 'Impact description is required')
            .max(100, 'Impact description too long'),
        urgency: z.string()
            .min(3, 'Urgency description is required')
            .max(100, 'Urgency description too long'),
        category: z.string()
            .min(3, 'Category is required')
            .max(100, 'Category too long'),
        description: z.string()
            .min(10, 'Description must be at least 10 characters')
            .max(1000, 'Description must not exceed 1000 characters')
    }),

    /**
     * Schema for updating an incident
     */
    updateIncident: z.object({
        status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
        urgency: z.string().max(100).optional(),
        category: z.string().max(100).optional()
    }).refine(
        (data) => Object.keys(data).length > 0,
        { message: 'At least one field must be provided for update' }
    )
};

/**
 * Validation schemas for authentication
 */
export const AuthValidationSchemas = {
    /**
     * Schema for login
     */
    login: z.object({
        email: z.string()
            .email('Invalid email format')
            .toLowerCase()
            .trim(),
        password: z.string()
            .min(6, 'Password must be at least 6 characters')
    }),

    /**
     * Schema for user registration
     */
    register: z.object({
        username: z.string()
            .min(3, 'Username must be at least 3 characters')
            .max(50, 'Username must not exceed 50 characters')
            .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
            .trim(),
        email: z.string()
            .email('Invalid email format')
            .toLowerCase()
            .trim(),
        password: z.string()
            .min(8, 'Password must be at least 8 characters')
            .max(100, 'Password must not exceed 100 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number'),
        role: z.enum(['USER', 'ADMIN', 'SUPPORT', 'ENGINEER']).optional().default('USER')
    })
};

/**
 * Validation middleware factory
 * Creates a middleware that validates request data against a Zod schema
 */
export function validate(schema: z.ZodSchema, source: 'body' | 'params' | 'query' = 'body') {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get data from the specified source
            const data = req[source];

            // Validate data against schema
            const validated = await schema.parseAsync(data);

            // Replace request data with validated (and potentially transformed) data
            req[source] = validated;

            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Format Zod errors into a readable format
                const errors = error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));

                next(new ValidationError('Validation failed', { errors }));
            } else {
                next(error);
            }
        }
    };
}

/**
 * Query parameter validation schemas
 */
export const QueryValidationSchemas = {
    /**
     * Schema for request status filter
     */
    requestStatus: z.object({
        status: z.enum(['new', 'rejected', 'in_service', 'done']).optional()
    }),

    /**
     * Schema for incident filters
     */
    incidentFilters: z.object({
        status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
        priority: z.enum(['P1', 'P2', 'P3', 'P4']).optional()
    }),

    /**
     * Schema for monitoring log filters
     */
    logFilters: z.object({
        level: z.enum(['ERROR', 'WARN', 'INFO', 'DEBUG']).optional(),
        startDate: z.string().datetime().optional()
    }),

    /**
     * Schema for alarm filters
     */
    alarmFilters: z.object({
        status: z.enum(['ACTIVE', 'RESOLVED']).optional(),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional()
    })
};

/**
 * Sanitization helpers
 */
export const Sanitizers = {
    /**
     * Sanitize string input (trim, remove dangerous characters)
     */
    sanitizeString: (str: string): string => {
        return str
            .trim()
            .replace(/<script>/gi, '')
            .replace(/<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '');
    },

    /**
     * Sanitize object (recursively sanitize all string values)
     */
    sanitizeObject: (obj: any): any => {
        if (typeof obj === 'string') {
            return Sanitizers.sanitizeString(obj);
        }
        if (Array.isArray(obj)) {
            return obj.map(Sanitizers.sanitizeObject);
        }
        if (typeof obj === 'object' && obj !== null) {
            const sanitized: any = {};
            for (const [key, value] of Object.entries(obj)) {
                sanitized[key] = Sanitizers.sanitizeObject(value);
            }
            return sanitized;
        }
        return obj;
    }
};

/**
 * Sanitization middleware
 */
export function sanitizeRequest(req: Request, res: Response, next: NextFunction) {
    if (req.body) {
        req.body = Sanitizers.sanitizeObject(req.body);
    }
    if (req.query) {
        req.query = Sanitizers.sanitizeObject(req.query);
    }
    if (req.params) {
        req.params = Sanitizers.sanitizeObject(req.params);
    }
    next();
}