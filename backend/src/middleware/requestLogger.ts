import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export interface RequestLogData {
  method: string;
  url: string;
  userAgent?: string;
  ip: string;
  userId?: string;
  responseTime: number;
  statusCode: number;
  contentLength?: number;
}

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // Capture the original res.end method
  const originalEnd = res.end;

  // Override res.end to capture response data
  res.end = function(chunk?: any, encoding?: any): any {
    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Get content length
    const contentLength = res.get('Content-Length');

    // Prepare log data
    const logData: RequestLogData = {
      method: req.method,
      url: req.originalUrl || req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userId: req.user?.id,
      responseTime,
      statusCode: res.statusCode,
      contentLength: contentLength ? parseInt(contentLength) : undefined,
    };

    // Log based on status code
    if (res.statusCode >= 500) {
      logger.error('HTTP Request - Server Error', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP Request - Client Error', logData);
    } else if (res.statusCode >= 300) {
      logger.info('HTTP Request - Redirect', logData);
    } else {
      logger.info('HTTP Request - Success', logData);
    }

    // Call the original end method
    return originalEnd.call(this, chunk, encoding);
  };

  // Log incoming request
  logger.debug('Incoming Request', {
    method: req.method,
    url: req.originalUrl || req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userId: req.user?.id,
    headers: req.headers,
    body: req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
    query: req.query && Object.keys(req.query).length > 0 ? req.query : undefined,
  });

  next();
}; 