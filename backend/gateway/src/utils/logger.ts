export const Logger = {
    error: (message: string, meta?: any) => {
        console.error(`[ERROR] ${message}`, meta || '');
    },

    warn: (message: string, meta?: any) => {
        console.warn(`[WARN] ${message}`, meta || '');
    },

    info: (message: string, meta?: any) => {
        console.log(`[INFO] ${message}`, meta || '');
    },

    debug: (message: string, meta?: any) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DEBUG] ${message}`, meta || '');
        }
    },

    security: (message: string, meta?: any) => {
        console.warn(`[SECURITY] ${message}`, meta || '');
    }
};

export default Logger;

export function requestLoggerMiddleware(req: any, res: any, next: any) {
    Logger.info(`${req.method} ${req.path}`);
    next();
}