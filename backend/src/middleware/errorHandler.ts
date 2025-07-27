import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';
import { config } from '../config/index.js';

export interface AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  code?: string;
}

export class CustomError extends Error implements AppError {
  statusCode: number;
  status: string;
  isOperational: boolean;
  code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode.toString().startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle Prisma errors
const handlePrismaError = (error: any): AppError => {
  if (error.code === 'P2002') {
    return new CustomError(
      'Duplicate entry. This resource already exists.',
      409,
      'DUPLICATE_ENTRY'
    );
  }

  if (error.code === 'P2025') {
    return new CustomError(
      'Record not found.',
      404,
      'RECORD_NOT_FOUND'
    );
  }

  if (error.code === 'P2003') {
    return new CustomError(
      'Foreign key constraint failed.',
      400,
      'FOREIGN_KEY_CONSTRAINT'
    );
  }

  if (error.code === 'P2021') {
    return new CustomError(
      'Table does not exist.',
      500,
      'TABLE_NOT_FOUND'
    );
  }

  return new CustomError(
    'Database operation failed.',
    500,
    'DATABASE_ERROR'
  );
};

// Handle validation errors
const handleValidationError = (error: any): AppError => {
  const message = error.errors?.map((err: any) => err.message).join('. ') || 'Validation failed';
  return new CustomError(message, 400, 'VALIDATION_ERROR');
};

// Handle JWT errors
const handleJWTError = (): AppError => {
  return new CustomError('Invalid token. Please log in again.', 401, 'INVALID_TOKEN');
};

const handleJWTExpiredError = (): AppError => {
  return new CustomError('Your token has expired. Please log in again.', 401, 'TOKEN_EXPIRED');
};

// Handle MongoDB/Mongoose errors (if using)
const handleCastErrorDB = (error: any): AppError => {
  return new CustomError(`Invalid ${error.path}: ${error.value}`, 400, 'INVALID_ID');
};

// Handle rate limiting errors
const handleRateLimitError = (): AppError => {
  return new CustomError(
    'Too many requests from this IP. Please try again later.',
    429,
    'RATE_LIMIT_EXCEEDED'
  );
};

// Send error response in development
const sendErrorDev = (err: AppError, res: Response): void => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
    code: err.code,
  });
};

// Send error response in production
const sendErrorProd = (err: AppError, res: Response): void => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      code: err.code,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('ERROR 💥', {
      error: err,
      stack: err.stack,
    });

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
};

// Global error handling middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
  });

  let error = { ...err };
  error.message = err.message;

  // Handle specific error types
  if (err.name === 'PrismaClientKnownRequestError') {
    error = handlePrismaError(err);
  } else if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  } else if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  } else if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  } else if (err.name === 'CastError') {
    error = handleCastErrorDB(err);
  } else if (err.name === 'RateLimitError') {
    error = handleRateLimitError();
  }

  // Send error response
  if (config.nodeEnv === 'development') {
    sendErrorDev(error as AppError, res);
  } else {
    sendErrorProd(error as AppError, res);
  }
};

// Async error wrapper
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// Handle unhandled promise rejections
export const handleUnhandledRejection = (): void => {
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('UNHANDLED PROMISE REJECTION! 💥 Shutting down...', {
      reason,
      promise,
    });
    process.exit(1);
  });
};

// Handle uncaught exceptions
export const handleUncaughtException = (): void => {
  process.on('uncaughtException', (err: Error) => {
    logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', {
      error: err.message,
      stack: err.stack,
    });
    process.exit(1);
  });
};

// 404 Not Found handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const err = new CustomError(
    `Can't find ${req.originalUrl} on this server!`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(err);
}; 