/**
 * Rate Limiting Middleware
 *
 * Provides protection against API abuse with different limits for different endpoint types.
 * Uses Redis for distributed rate limiting (works across multiple Express instances).
 *
 * Rate limits:
 * - Auth endpoints: 5 requests per 15 minutes per IP
 * - Read endpoints: 100 requests per 15 minutes per user
 * - Write endpoints: 20 requests per 15 minutes per user
 */

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { Request, Response } from 'express';
import { redisClient } from '../utils/redis.client.js';

/**
 * Rate limit configuration
 */
export const rateLimitConfig = {
    auth: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // 5 requests per window
        message: 'Too many authentication attempts. Please try again in 15 minutes.'
    },
    read: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // 100 requests per window
        message: 'Too many read requests. Please try again in 15 minutes.'
    },
    write: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 20, // 20 requests per window
        message: 'Too many write requests. Please try again in 15 minutes.'
    }
};

/**
 * Custom key generator for authenticated requests
 * Uses userId from JWT token if available, otherwise falls back to IP
 */
const keyGenerator = (req: Request): string => {
    // If user is authenticated, use their userId
    if (req.user?.userId) {
        return `user:${req.user.userId}`;
    }
    // Otherwise use IP address
    return `ip:${req.ip}`;
};

/**
 * Custom handler for rate limit exceeded
 */
const rateLimitHandler = (req: Request, res: Response) => {
    console.warn(`[RATE_LIMIT] Limit exceeded for ${keyGenerator(req)} on ${req.path}`);
    res.status(429).json({
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.',
        retryAfter: res.getHeader('Retry-After')
    });
};

/**
 * Skip rate limiting for health check endpoints
 */
const skipSuccessfulRequests = (req: Request, res: Response) => {
    return req.path.startsWith('/health');
};

/**
 * Create Redis store for distributed rate limiting
 * Falls back to memory store if Redis is not available
 */
const createStore = () => {
    try {
        // Ensure Redis client is connected
        redisClient.connect().catch(err => {
            console.error('[RATE_LIMIT] Redis connection failed, using memory store:', err);
        });

        return new RedisStore({
            // @ts-ignore - RedisStore expects redis v3 client, but we're using v4
            client: redisClient,
            prefix: 'rl:' // prefix for rate limit keys
        });
    } catch (error) {
        console.error('[RATE_LIMIT] Failed to create Redis store, using memory store:', error);
        return undefined; // Will use default memory store
    }
};

/**
 * Rate limiter for authentication endpoints
 * Stricter limits to prevent brute force attacks
 */
export const authRateLimiter = rateLimit({
    windowMs: rateLimitConfig.auth.windowMs,
    max: rateLimitConfig.auth.max,
    message: rateLimitConfig.auth.message,
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    keyGenerator,
    handler: rateLimitHandler,
    skip: skipSuccessfulRequests,
    // Use Redis store for distributed rate limiting
    store: createStore()
});

/**
 * Rate limiter for read endpoints (GET requests)
 * More permissive to allow users to browse their data
 */
export const readRateLimiter = rateLimit({
    windowMs: rateLimitConfig.read.windowMs,
    max: rateLimitConfig.read.max,
    message: rateLimitConfig.read.message,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    handler: rateLimitHandler,
    skip: skipSuccessfulRequests,
    store: createStore()
});

/**
 * Rate limiter for write endpoints (POST, PUT, PATCH, DELETE)
 * Moderate limits to prevent spam while allowing normal usage
 */
export const writeRateLimiter = rateLimit({
    windowMs: rateLimitConfig.write.windowMs,
    max: rateLimitConfig.write.max,
    message: rateLimitConfig.write.message,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    handler: rateLimitHandler,
    skip: skipSuccessfulRequests,
    store: createStore()
});

/**
 * General rate limiter for unclassified endpoints
 * Moderate default limits
 */
export const generalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requests per window
    message: 'Too many requests. Please try again in 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    handler: rateLimitHandler,
    skip: skipSuccessfulRequests,
    store: createStore()
});