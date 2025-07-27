import jwt, { SignOptions } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';
import { logger } from '../config/logger.js';
import { prisma } from '../config/database.js';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        walletAddress: string;
        email?: string;
      };
    }
  }
}

export interface JWTPayload {
  userId: string;
  walletAddress: string;
  email?: string;
  iat: number;
  exp: number;
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(401).json({
        error: 'Access denied. No token provided.',
        code: 'NO_TOKEN',
      });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;

    if (!decoded.userId) {
      res.status(401).json({
        error: 'Invalid token payload.',
        code: 'INVALID_TOKEN',
      });
      return;
    }

    // Check if user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        walletAddress: true,
        email: true,
      },
    });

    if (!user) {
      res.status(401).json({
        error: 'User not found.',
        code: 'USER_NOT_FOUND',
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      walletAddress: user.walletAddress,
      email: user.email || undefined,
    };

    logger.debug('User authenticated successfully', {
      userId: user.id,
      walletAddress: user.walletAddress,
    });

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: 'Invalid token.',
        code: 'INVALID_TOKEN',
        details: error.message,
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: 'Token expired.',
        code: 'TOKEN_EXPIRED',
        details: error.message,
      });
      return;
    }

    logger.error('Authentication error:', error);
    res.status(500).json({
      error: 'Authentication failed.',
      code: 'AUTH_ERROR',
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.token;

    if (!token) {
      next();
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;

    if (decoded.userId) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          walletAddress: true,
          email: true,
        },
      });

      if (user) {
        req.user = {
          id: user.id,
          walletAddress: user.walletAddress,
          email: user.email || undefined,
        };
      }
    }

    next();
  } catch (error) {
    // Silently continue without authentication
    next();
  }
};

/**
 * Generate JWT token for user
 */
export const generateToken = (
  userId: string,
  walletAddress: string,
  email?: string,
  expiresIn: string | number = '7d'
): string => {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId,
    walletAddress,
    email,
  };

  return jwt.sign(payload, config.jwtSecret, { expiresIn } as SignOptions);
};

/**
 * Refresh token middleware
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'User not authenticated.',
        code: 'NOT_AUTHENTICATED',
      });
      return;
    }

    // Generate new token
    const newToken = generateToken(
      req.user.id,
      req.user.walletAddress,
      req.user.email
    );

    res.json({
      message: 'Token refreshed successfully',
      token: newToken,
      user: req.user,
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Failed to refresh token.',
      code: 'REFRESH_ERROR',
    });
  }
};

/**
 * Middleware to check if user has specific permissions
 */
export const requirePermissions = (permissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'User not authenticated.',
          code: 'NOT_AUTHENTICATED',
        });
        return;
      }

      // Check API key permissions if using API key
      const apiKeyHeader = req.headers['x-api-key'] as string;
      if (apiKeyHeader) {
        const apiKey = await prisma.apiKey.findFirst({
          where: {
            keyHash: apiKeyHeader,
            userId: req.user.id,
            isActive: true,
          },
        });

        if (!apiKey) {
          res.status(401).json({
            error: 'Invalid API key.',
            code: 'INVALID_API_KEY',
          });
          return;
        }

        // Check if API key has required permissions
        const hasPermissions = permissions.every(permission =>
          apiKey.permissions.includes(permission)
        );

        if (!hasPermissions) {
          res.status(403).json({
            error: 'Insufficient permissions.',
            code: 'INSUFFICIENT_PERMISSIONS',
            required: permissions,
            available: apiKey.permissions,
          });
          return;
        }

        // Update last used timestamp
        await prisma.apiKey.update({
          where: { id: apiKey.id },
          data: { lastUsed: new Date() },
        });
      }

      next();
    } catch (error) {
      logger.error('Permission check error:', error);
      res.status(500).json({
        error: 'Permission check failed.',
        code: 'PERMISSION_ERROR',
      });
    }
  };
}; 