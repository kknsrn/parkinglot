/**
 * Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({
        error: message,
        status,
    });
};

/**
 * Request Logger Middleware
 */
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
};

/**
 * Concurrency control middleware
 * Handles concurrent requests with proper locking mechanisms
 */
class ConcurrencyController {
    static locks = new Map();

    static async acquireLock(resource) {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (!this.locks.has(resource)) {
                    this.locks.set(resource, true);
                    clearInterval(interval);
                    resolve();
                }
            }, 10);
        });
    }

    static releaseLock(resource) {
        this.locks.delete(resource);
    }

    static middleware(resourceExtractor) {
        return async (req, res, next) => {
            const resource = resourceExtractor(req);
            await this.acquireLock(resource);

            res.on('finish', () => {
                this.releaseLock(resource);
            });

            next();
        };
    }
}

module.exports = {
    errorHandler,
    requestLogger,
    ConcurrencyController,
};
