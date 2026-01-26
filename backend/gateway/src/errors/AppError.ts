export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly context?: Record<string, any>;

    constructor(
        message: string,
        statusCode: number = 500,
        isOperational: boolean = true,
        context?: Record<string, any>
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.context = context;

        Error.captureStackTrace(this, this.constructor);

        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, 400, true, context);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Authentication required', context?: Record<string, any>) {
        super(message, 401, true, context);
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Access denied', context?: Record<string, any>) {
        super(message, 403, true, context);
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string = 'Resource', context?: Record<string, any>) {
        super(`${resource} not found`, 404, true, context);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class ConflictError extends AppError {
    constructor(message: string = 'Resource already exists', context?: Record<string, any>) {
        super(message, 409, true, context);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}

export class DatabaseError extends AppError {
    constructor(message: string = 'Database operation failed', context?: Record<string, any>) {
        super(message, 500, true, context);
        Object.setPrototypeOf(this, DatabaseError.prototype);
    }
}

export class LambdaError extends AppError {
    constructor(
        functionName: string,
        originalError?: any,
        context?: Record<string, any>
    ) {
        const message = `Lambda function ${functionName} failed`;
        super(message, 503, true, {
            functionName,
            originalError: originalError?.message || originalError,
            ...context
        });
        Object.setPrototypeOf(this, LambdaError.prototype);
    }
}

export class RateLimitError extends AppError {
    constructor(message: string = 'Too many requests', retryAfter?: number) {
        super(message, 429, true, { retryAfter });
        Object.setPrototypeOf(this, RateLimitError.prototype);
    }
}

export class ExternalServiceError extends AppError {
    constructor(
        service: string,
        message: string = 'External service unavailable',
        context?: Record<string, any>
    ) {
        super(`${service}: ${message}`, 502, true, { service, ...context });
        Object.setPrototypeOf(this, ExternalServiceError.prototype);
    }
}

export function isOperationalError(error: Error): boolean {
    if (error instanceof AppError) {
        return error.isOperational;
    }
    return false;
}

export function mapDatabaseError(error: any): AppError {
    const pgErrorCode = error.code;

    switch (pgErrorCode) {
        case '23505': // unique_violation
            return new ConflictError('Resource already exists', {
                constraint: error.constraint,
                detail: error.detail
            });

        case '23503': // foreign_key_violation
            return new ValidationError('Invalid reference to related resource', {
                constraint: error.constraint,
                detail: error.detail
            });

        case '23502': // not_null_violation
            return new ValidationError('Required field is missing', {
                column: error.column
            });

        case '23514': // check_violation
            return new ValidationError('Invalid value for field', {
                constraint: error.constraint
            });

        case '42P01': // undefined_table
        case '42703': // undefined_column
            return new DatabaseError('Database schema error', {
                code: pgErrorCode,
                message: error.message
            });

        case '08000': // connection_exception
        case '08003': // connection_does_not_exist
        case '08006': // connection_failure
            return new DatabaseError('Database connection failed', {
                code: pgErrorCode
            });

        default:
            // Generic database error
            return new DatabaseError('Database operation failed', {
                code: pgErrorCode,
                message: error.message
            });
    }
}

export function mapLambdaError(functionName: string, error: any): LambdaError {
    return new LambdaError(functionName, error, {
        statusCode: error.StatusCode,
        functionError: error.FunctionError
    });
}