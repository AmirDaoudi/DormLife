import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';
import logger from '../utils/logger';

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let details: any = undefined;

  // Log the error
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
  });

  // Handle known AppError instances
  if (error instanceof AppError) {
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

export const notFoundHandler = (req: Request, res: Response): void => {
  logger.warn('Route not found:', {
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

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Graceful shutdown handler
export const gracefulShutdown = (server: any) => {
  const shutdown = (signal: string) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });

    // Force close after 30 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Close server & exit process
  process.exit(1);
});

// Uncaught exception handler
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  // Close server & exit process
  process.exit(1);
});