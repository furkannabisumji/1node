import express from 'express';
import { body, validationResult } from 'express-validator';
import { ethers } from 'ethers';
import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';
import { generateToken, authenticateToken, refreshToken } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validateRequest = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
    return;
  }
  next();
};

/**
 * POST /api/auth/connect-wallet
 * Authenticate user with wallet signature
 */
router.post(
  '/connect-wallet',
  [
    body('walletAddress').isEthereumAddress().withMessage('Invalid wallet address'),
    //   body('signature').isString().notEmpty().withMessage('Signature is required'),
    //   body('message').isString().notEmpty().withMessage('Message is required'),
  ],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const { walletAddress, signature, message } = req.body;

      // Verify the signature

     const recoveredAddress = ethers.verifyMessage(message, signature);
      

      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return res.status(401).json({
          error: 'Invalid signature',
          code: 'INVALID_SIGNATURE',
        });
      }

      // Check if user exists, create if not
      let user = await prisma.user.findUnique({
        where: { walletAddress: walletAddress.toLowerCase() },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            walletAddress: walletAddress.toLowerCase(),
          },
        });
        logger.info(`New user created: ${user.id}`, { walletAddress });
      }

      // Generate JWT token
      const token = generateToken(user.id, user.walletAddress, user.email || undefined);

      logger.info(`User authenticated: ${user.id}`, { walletAddress });

      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
          path: '/',
          sameSite: 'none',
          maxAge: 3600000,
      }).json({
        message: 'Authentication successful'
      });
    } catch (error) {
      logger.error('Wallet authentication failed:', error);
      res.status(500).json({
        error: 'Authentication failed',
        code: 'AUTH_ERROR',
      });
    }
  }
);

/**
 * POST /api/auth/register
 * Register new user with email (optional)
 */
router.post(
  '/register',
  [
    body('walletAddress').isEthereumAddress().withMessage('Invalid wallet address'),
    body('email').optional().isEmail().withMessage('Invalid email address'),
    body('username').optional().isString().isLength({ min: 3, max: 30 }),
    //   body('signature').isString().notEmpty().withMessage('Signature is required'),
    //   body('message').isString().notEmpty().withMessage('Message is required'),
  ],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const { walletAddress, email, username, signature, message } = req.body;

      // Verify the signature

     const recoveredAddress = ethers.verifyMessage(message, signature);
      

      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return res.status(401).json({
          error: 'Invalid signature',
          code: 'INVALID_SIGNATURE',
        });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { walletAddress: walletAddress.toLowerCase() },
      });

      if (existingUser) {
        return res.status(409).json({
          error: 'User already exists',
          code: 'USER_EXISTS',
        });
      }

      // Check if email is already taken
      if (email) {
        const existingEmail = await prisma.user.findUnique({
          where: { email },
        });

        if (existingEmail) {
          return res.status(409).json({
            error: 'Email already registered',
            code: 'EMAIL_EXISTS',
          });
        }
      }

      // Create new user
      const user = await prisma.user.create({
        data: {
          walletAddress: walletAddress.toLowerCase(),
          email,
          username,
        },
      });

      // Generate JWT token
      const token = generateToken(user.id, user.walletAddress, user.email || undefined);

      logger.info(`New user registered: ${user.id}`, { walletAddress, email });

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          email: user.email,
          username: user.username,
          preferredChains: user.preferredChains,
          riskTolerance: user.riskTolerance,
        },
      });
    } catch (error) {
      logger.error('User registration failed:', error);
      res.status(500).json({
        error: 'Registration failed',
        code: 'REGISTRATION_ERROR',
      });
    }
  }
);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        error: 'User not authenticated',
        code: 'NO_USER_ID',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            workflows: true,
            notifications: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    res.json({
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        email: user.email,
        username: user.username,
        preferredChains: user.preferredChains,
        riskTolerance: user.riskTolerance,
        notificationPrefs: user.notificationPrefs,
        createdAt: user.createdAt,
        stats: {
          workflowCount: (user as any)._count.workflows,
          notificationCount: (user as any)._count.notifications,
        },
      },
    });
  } catch (error) {
    logger.error('Failed to fetch user profile:', error);
    res.status(500).json({
      error: 'Failed to fetch user profile',
      code: 'PROFILE_ERROR',
    });
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put(
  '/profile',
  authenticateToken,
  [
    body('email').optional().isEmail().withMessage('Invalid email address'),
    body('username').optional().isString().isLength({ min: 3, max: 30 }),
    body('preferredChains').optional().isArray(),
    body('riskTolerance').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
    body('notificationPrefs').optional().isObject(),
  ],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = req.user?.id;
      const { email, username, preferredChains, riskTolerance, notificationPrefs } = req.body;

      if (!userId) {
        res.status(401).json({
          error: 'User not authenticated',
          code: 'NO_USER_ID',
        });
        return;
      }

      // Check if email is already taken by another user
      if (email) {
        const existingEmail = await prisma.user.findFirst({
          where: {
            email,
            NOT: { id: userId as string },
          },
        });

        if (existingEmail) {
          res.status(409).json({
            error: 'Email already registered by another user',
            code: 'EMAIL_EXISTS',
          });
          return;
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId as string },
        data: {
          ...(email !== undefined && { email }),
          ...(username !== undefined && { username }),
          ...(preferredChains !== undefined && { preferredChains }),
          ...(riskTolerance !== undefined && { riskTolerance }),
          ...(notificationPrefs !== undefined && { notificationPrefs }),
        },
      });

      logger.info(`User profile updated: ${userId}`);

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          walletAddress: updatedUser.walletAddress,
          email: updatedUser.email,
          username: updatedUser.username,
          preferredChains: updatedUser.preferredChains,
          riskTolerance: updatedUser.riskTolerance,
          notificationPrefs: updatedUser.notificationPrefs,
        },
      });
    } catch (error) {
      logger.error('Failed to update user profile:', error);
      res.status(500).json({
        error: 'Failed to update profile',
        code: 'PROFILE_UPDATE_ERROR',
      });
    }
  }
);

/**
 * POST /api/auth/refresh-token
 * Refresh JWT token
 */
router.post('/refresh-token', authenticateToken, refreshToken);

/**
 * GET /api/auth/nonce
 * Get nonce for wallet signature
 */
router.get('/nonce/:walletAddress', async (req: express.Request, res: express.Response) => {
  try {
    const { walletAddress } = req.params;

    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({
        error: 'Invalid wallet address',
        code: 'INVALID_ADDRESS',
      });
    }

    // Generate a nonce message for signing
    const nonce = Math.floor(Math.random() * 1000000);
    const message = `Sign this message to authenticate with DeFi Automation Platform.\n\nNonce: ${nonce}\nTimestamp: ${Date.now()}`;

    res.json({
      message,
      nonce,
    });
  } catch (error) {
    logger.error('Failed to generate nonce:', error);
    res.status(500).json({
      error: 'Failed to generate nonce',
      code: 'NONCE_ERROR',
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (mainly for cleanup)
 */
router.post('/logout', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.id;

    logger.info(`User logged out: ${userId}`);

    res.json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Logout failed:', error);
    res.status(500).json({
      error: 'Logout failed',
      code: 'LOGOUT_ERROR',
    });
  }
});

export default router; 