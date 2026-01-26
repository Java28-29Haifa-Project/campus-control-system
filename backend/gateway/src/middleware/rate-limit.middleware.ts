import rateLimit from 'express-rate-limit';


export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 999999,
    // max: 5,
    standardHeaders: true,
    legacyHeaders: false
});

export const readRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 999999,
    // max: 100,
    standardHeaders: true,
    legacyHeaders: false
});

export const writeRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 999999,
    // max: 20,
    standardHeaders: true,
    legacyHeaders: false
});

export const generalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 999999,
    // max: 50,
    standardHeaders: true,
    legacyHeaders: false
});