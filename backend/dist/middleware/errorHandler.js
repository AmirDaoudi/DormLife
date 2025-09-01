"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gracefulShutdown = exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = void 0;
const types_1 = require("../types");
const logger_1 = __importDefault(require("../utils/logger"));
const errorHandler = (error, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal server error';
    let details = undefined;
    // Log the error
    logger_1.default.error('Error occurred:', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
    });
    // Handle known AppError instances
    if (error instanceof types_1.AppError) {
        statusCode = error.statusCode;
        message = error.message;
    }
    // Handle validation errors
    else if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
        details = error.message;
    }
    // Handle JWT errors
    else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    // Handle database errors
    else if (error.name === 'DatabaseError') {
        statusCode = 500;
        message = 'Database error';
    }
    // Handle PostgreSQL errors
    else if (error.message.includes('duplicate key value')) {
        statusCode = 409;
        message = 'Resource already exists';
    }
    else if (error.message.includes('foreign key constraint')) {
        statusCode = 400;
        message = 'Invalid reference';
    }
    // Handle file upload errors
    else if (error.message.includes('File too large')) {
        statusCode = 413;
        message = 'File too large';
    }
    else if (error.message.includes('Unexpected field')) {
        statusCode = 400;
        message = 'Invalid file field';
    }
    // Handle rate limiting errors
    else if (error.message.includes('Too many requests')) {
        statusCode = 429;
        message = 'Too many requests';
    }
    // Don't leak internal errors in production
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        message = 'Something went wrong';
    }
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(details && { details }),
        ...(process.env.NODE_ENV === 'development' && statusCode === 500 && { stack: error.stack }),
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    logger_1.default.warn('Route not found:', {
        url: req.url,
        method: req.method,
        ip: req.ip,
    });
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.url,
        method: req.method,
    });
};
exports.notFoundHandler = notFoundHandler;
// Async error wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
// Graceful shutdown handler
const gracefulShutdown = (server) => {
    const shutdown = (signal) => {
        logger_1.default.info(`Received ${signal}. Starting graceful shutdown...`);
        server.close(() => {
            logger_1.default.info('HTTP server closed');
            process.exit(0);
        });
        // Force close after 30 seconds
        setTimeout(() => {
            logger_1.default.error('Could not close connections in time, forcefully shutting down');
            process.exit(1);
        }, 30000);
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
};
exports.gracefulShutdown = gracefulShutdown;
// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
    logger_1.default.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Close server & exit process
    process.exit(1);
});
// Uncaught exception handler
process.on('uncaughtException', (error) => {
    logger_1.default.error('Uncaught Exception:', error);
    // Close server & exit process
    process.exit(1);
});
//# sourceMappingURL=errorHandler.js.map