import express from 'express';
import { param, query, body, validationResult } from 'express-validator';
import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';
import { oneInchService } from '../services/oneInchService.js';
import { SUPPORTED_CHAINS } from '../config/index.js';

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
 * GET /api/portfolio
 * Get complete portfolio overview across all chains
 */
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.id;
    const walletAddress = req.user?.walletAddress;

    if (!userId || !walletAddress) {
      res.status(400).json({
        error: 'User authentication required',
        code: 'NO_USER_ID',
      });
      return;
    }

    // Get all user workflows and their deposits
    const workflows = await prisma.workflow.findMany({
      where: { userId },
      include: {
        deposits: true,
        executions: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Aggregate portfolio data across chains
    const portfolioData = {
      totalValue: 0,
      chains: {} as Record<string, any>,
      workflows: workflows.length,
      activeWorkflows: workflows.filter(w => w.isActive).length,
      totalDeposits: workflows.reduce((sum, w) => 
        sum + w.deposits.reduce((dSum, d) => dSum + parseFloat(d.amount), 0), 0
      ),
    };

    // Fetch balances for each supported chain
    for (const [chainKey, chainConfig] of Object.entries(SUPPORTED_CHAINS)) {
      try {
        // Get workflow deposits for this chain
        const chainDeposits = workflows.flatMap(w => 
          w.deposits.filter(d => d.chainId === chainConfig.id)
        );

        if (chainDeposits.length > 0) {
          const tokenAddresses = [...new Set(chainDeposits.map(d => d.tokenAddress))];
          
          // Get current balances and prices
          const [balances, prices] = await Promise.all([
            oneInchService.getWalletBalances(chainConfig.id, walletAddress, tokenAddresses),
            oneInchService.getTokenPrices(chainConfig.id, tokenAddresses),
          ]);

          const chainValue = Object.entries(balances).reduce((sum, [address, balance]) => {
            const price = parseFloat(prices[address] || '0');
            const balanceNum = parseFloat(balance) / Math.pow(10, 18); // Simplified
            return sum + (balanceNum * price);
          }, 0);

          portfolioData.chains[chainKey] = {
            name: chainConfig.name,
            id: chainConfig.id,
            totalValue: chainValue,
            tokens: Object.entries(balances).map(([address, balance]) => ({
              address,
              balance,
              priceUSD: prices[address] || '0',
              valueUSD: parseFloat(balance) * parseFloat(prices[address] || '0') / Math.pow(10, 18),
            })),
            deposits: chainDeposits,
          };

          portfolioData.totalValue += chainValue;
        }
      } catch (error) {
        logger.warn(`Failed to fetch portfolio data for ${chainKey}:`, error);
        portfolioData.chains[chainKey] = {
          name: chainConfig.name,
          id: chainConfig.id,
          error: 'Failed to fetch data',
        };
      }
    }

    res.json({
      portfolio: portfolioData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to fetch portfolio:', error);
    res.status(500).json({
      error: 'Failed to fetch portfolio data',
      code: 'PORTFOLIO_ERROR',
    });
  }
});

/**
 * GET /api/portfolio/balances/:chainId
 * Get detailed balances for a specific chain
 */
router.get(
  '/balances/:chainId',
  [param('chainId').isInt({ min: 1 }).withMessage('Invalid chain ID')],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const walletAddress = req.user?.walletAddress;
      const chainIdParam = req.params.chainId;

      if (!chainIdParam) {
        return res.status(400).json({
          error: 'Chain ID is required',
          code: 'MISSING_CHAIN_ID',
        });
      }

      const chainId = parseInt(chainIdParam);

      if (!walletAddress) {
        return res.status(400).json({
          error: 'Wallet address not found',
          code: 'NO_WALLET_ADDRESS',
        });
      }

      // Get supported tokens for this chain
      const tokens = await oneInchService.getTokens(chainId);
      const tokenAddresses = Object.keys(tokens).slice(0, 50); // Limit for performance

      // Get balances and prices
      const [balances, prices] = await Promise.all([
        oneInchService.getWalletBalances(chainId, walletAddress, tokenAddresses),
        oneInchService.getTokenPrices(chainId, tokenAddresses),
      ]);

      // Filter out zero balances and format response
      const tokenBalances = Object.entries(balances)
        .filter(([_, balance]) => parseFloat(balance) > 0)
        .map(([address, balance]) => {
          const token = tokens[address];
          if (!token) return null;
          
          const price = parseFloat(prices[address] || '0');
          const balanceFormatted = parseFloat(balance) / Math.pow(10, token.decimals);
          
          return {
            address,
            symbol: token.symbol,
            name: token.name,
            decimals: token.decimals,
            balance: balanceFormatted.toString(),
            balanceWei: balance,
            priceUSD: price,
            valueUSD: balanceFormatted * price,
          };
        })
        .filter((token): token is NonNullable<typeof token> => token !== null)
        .sort((a, b) => b.valueUSD - a.valueUSD);

      const totalValue = tokenBalances.reduce((sum, token) => sum + token.valueUSD, 0);

      res.json({
        chainId,
        chainName: Object.values(SUPPORTED_CHAINS).find(c => c.id === chainId)?.name || 'Unknown',
        walletAddress,
        totalValue,
        tokenCount: tokenBalances.length,
        tokens: tokenBalances,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to fetch chain balances:', error);
      res.status(500).json({
        error: 'Failed to fetch chain balances',
        code: 'BALANCE_ERROR',
      });
    }
  }
);

/**
 * GET /api/portfolio/workflow/:workflowId/deposits
 * Get deposits for a specific workflow
 */
router.get(
  '/workflow/:workflowId/deposits',
  [param('workflowId').isString().withMessage('Invalid workflow ID')],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = req.user?.id;
      const workflowId = req.params.workflowId;

      if (!userId || !workflowId) {
        res.status(400).json({
          error: 'Missing required parameters',
          code: 'MISSING_PARAMS',
        });
        return;
      }

      // Verify workflow ownership
      const workflow = await prisma.workflow.findFirst({
        where: { id: workflowId, userId },
        include: { deposits: true },
      });

      if (!workflow) {
        return res.status(404).json({
          error: 'Workflow not found',
          code: 'WORKFLOW_NOT_FOUND',
        });
      }

      // Get current prices for deposited tokens
      const depositsByChain = workflow.deposits.reduce((acc, deposit) => {
        if (!acc[deposit.chainId]) {
          acc[deposit.chainId] = [];
        }
        acc[deposit.chainId]!.push(deposit);
        return acc;
      }, {} as Record<number, any[]>);

      const enrichedDeposits = [];

      for (const [chainId, deposits] of Object.entries(depositsByChain)) {
        try {
          const tokenAddresses = deposits.map(d => d.tokenAddress);
          const prices = await oneInchService.getTokenPrices(parseInt(chainId), tokenAddresses);

          for (const deposit of deposits) {
            const price = parseFloat(prices[deposit.tokenAddress] || '0');
            const amount = parseFloat(deposit.amount);
            
            enrichedDeposits.push({
              ...deposit,
              currentPriceUSD: price,
              currentValueUSD: amount * price,
            });
          }
        } catch (error) {
          logger.warn(`Failed to get prices for chain ${chainId}:`, error);
          enrichedDeposits.push(...deposits.map(d => ({ ...d, currentPriceUSD: 0, currentValueUSD: 0 })));
        }
      }

      const totalValue = enrichedDeposits.reduce((sum, d) => sum + (d.currentValueUSD || 0), 0);
      const lockedValue = enrichedDeposits
        .filter(d => d.isLocked)
        .reduce((sum, d) => sum + (d.currentValueUSD || 0), 0);

      res.json({
        workflowId,
        workflowName: workflow.name,
        deposits: enrichedDeposits,
        summary: {
          totalValue,
          lockedValue,
          availableValue: totalValue - lockedValue,
          depositCount: enrichedDeposits.length,
        },
      });
    } catch (error) {
      logger.error('Failed to fetch workflow deposits:', error);
      res.status(500).json({
        error: 'Failed to fetch workflow deposits',
        code: 'DEPOSITS_ERROR',
      });
    }
  }
);

/**
 * POST /api/portfolio/workflow/:workflowId/deposit
 * Record a deposit for a workflow (when user deposits funds)
 */
router.post(
  '/workflow/:workflowId/deposit',
  [
    param('workflowId').isString().withMessage('Invalid workflow ID'),
    body('chainId').isInt({ min: 1 }).withMessage('Invalid chain ID'),
    body('tokenAddress').isEthereumAddress().withMessage('Invalid token address'),
    body('tokenSymbol').isString().notEmpty().withMessage('Token symbol required'),
    body('amount').isString().notEmpty().withMessage('Amount required'),
    body('transactionHash').isString().notEmpty().withMessage('Transaction hash required'),
  ],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = req.user?.id;
      const workflowId = req.params.workflowId;
      const { chainId, tokenAddress, tokenSymbol, amount, transactionHash } = req.body;

      if (!userId || !workflowId) {
        res.status(400).json({
          error: 'Missing required parameters',
          code: 'MISSING_PARAMS',
        });
        return;
      }

      // Verify workflow ownership
      const workflow = await prisma.workflow.findFirst({
        where: { id: workflowId, userId },
      });

      if (!workflow) {
        return res.status(404).json({
          error: 'Workflow not found',
          code: 'WORKFLOW_NOT_FOUND',
        });
      }

      // Create deposit record
      const deposit = await prisma.workflowDeposit.create({
        data: {
          workflowId,
          chainId,
          tokenAddress: tokenAddress.toLowerCase(),
          tokenSymbol,
          amount,
        },
      });

      logger.info(`Deposit recorded for workflow ${workflowId}:`, {
        userId,
        chainId,
        tokenSymbol,
        amount,
        transactionHash,
      });

      res.status(201).json({
        message: 'Deposit recorded successfully',
        deposit,
      });
    } catch (error) {
      logger.error('Failed to record deposit:', error);
      res.status(500).json({
        error: 'Failed to record deposit',
        code: 'DEPOSIT_ERROR',
      });
    }
  }
);

/**
 * GET /api/portfolio/analytics
 * Get portfolio analytics and insights
 */
router.get('/analytics', async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(400).json({
        error: 'User authentication required',
        code: 'NO_USER_ID',
      });
      return;
    }

    // Get user's workflows with executions
    const workflows = await prisma.workflow.findMany({
      where: { userId },
      include: {
        executions: {
          where: { success: true },
          orderBy: { createdAt: 'desc' },
          take: 30,
        },
        deposits: true,
      },
    });

    // Calculate analytics
    const totalExecutions = workflows.reduce((sum, w: any) => sum + w.executions.length, 0);
    const successfulExecutions = workflows.reduce((sum, w: any) => 
      sum + w.executions.filter((e: any) => e.success).length, 0
    );
    const totalGasUsed = workflows.reduce((sum, w: any) => 
      sum + w.executions.reduce((eSum: number, e: any) => eSum + parseFloat(e.gasUsed || '0'), 0), 0
    );

    // Recent activity
    const recentExecutions = workflows
      .flatMap((w: any) => w.executions.map((e: any) => ({ ...e, workflowName: w.name })))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    res.json({
      analytics: {
        totalWorkflows: workflows.length,
        activeWorkflows: workflows.filter(w => w.isActive).length,
        totalExecutions,
        successfulExecutions,
        successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
        totalGasUsed,
      },
      recentActivity: recentExecutions,
    });
  } catch (error) {
    logger.error('Failed to fetch portfolio analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      code: 'ANALYTICS_ERROR',
    });
  }
});

export default router; 