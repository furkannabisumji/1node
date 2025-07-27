import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { prisma } from '@/config/database.js';
import { logger } from '@/config/logger.js';
import { addTriggerEvaluationJob, addExecutionJob } from '@/jobs/index.js';
import { oneInchService } from '@/services/oneInchService.js';

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
 * POST /api/automations
 * Create a new automation workflow
 */
router.post(
  '/',
  [
    body('name').isString().isLength({ min: 1, max: 100 }),
    body('description').optional().isString().isLength({ max: 500 }),
    body('trigger').isObject(),
    body('trigger.type').isIn([
      'PRICE_THRESHOLD',
      'PRICE_CHANGE',
      'BALANCE_CHANGE',
      'TIME_BASED',
      'CROSS_CHAIN_PRICE_DIFF',
      'PORTFOLIO_RATIO',
    ]),
    body('trigger.chainId').optional().isInt({ min: 1 }),
    body('trigger.config').isObject(),
    body('action').isObject(),
    body('action.type').isIn([
      'SWAP',
      'TRANSFER',
      'CROSS_CHAIN_SWAP',
      'STAKE',
      'PROVIDE_LIQUIDITY',
      'SEND_NOTIFICATION',
    ]),
    body('action.chainId').optional().isInt({ min: 1 }),
    body('action.config').isObject(),
    body('conditions').optional().isArray(),
  ],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { name, description, trigger, action, conditions = [] } = req.body;

      // Validate trigger configuration based on type
      const triggerValidation = validateTriggerConfig(trigger);
      if (!triggerValidation.valid) {
        return res.status(400).json({ error: triggerValidation.message });
      }

      // Validate action configuration based on type
      const actionValidation = validateActionConfig(action);
      if (!actionValidation.valid) {
        return res.status(400).json({ error: actionValidation.message });
      }

      // Create workflow in database
      const workflow = await prisma.workflow.create({
        data: {
          name,
          description,
          userId,
          triggers: {
            create: {
              type: trigger.type,
              chainId: trigger.chainId,
              config: trigger.config,
            },
          },
          actions: {
            create: {
              type: action.type,
              chainId: action.chainId,
              config: action.config,
            },
          },
          conditions: {
            create: conditions.map((condition: any) => ({
              type: condition.type,
              config: condition.config,
            })),
          },
        },
        include: {
          triggers: true,
          actions: true,
          conditions: true,
        },
      });

      logger.info(`Automation created: ${workflow.id}`, { userId, workflowName: name });

      res.status(201).json({
        message: 'Automation created successfully',
        automation: workflow,
      });
    } catch (error) {
      logger.error('Failed to create automation:', error);
      res.status(500).json({ error: 'Failed to create automation' });
    }
  }
);

/**
 * GET /api/automations
 * Get all automations for the authenticated user
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'inactive', 'all']),
  ],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string || 'all';
      const skip = (page - 1) * limit;

      const where: any = { userId };
      if (status !== 'all') {
        where.isActive = status === 'active';
      }

      const [workflows, total] = await Promise.all([
        prisma.workflow.findMany({
          where,
          include: {
            triggers: true,
            actions: true,
            conditions: true,
            executions: {
              take: 5,
              orderBy: { createdAt: 'desc' },
            },
            _count: {
              select: { executions: true },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.workflow.count({ where }),
      ]);

      res.json({
        automations: workflows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error('Failed to fetch automations:', error);
      res.status(500).json({ error: 'Failed to fetch automations' });
    }
  }
);

/**
 * GET /api/automations/:id
 * Get specific automation details
 */
router.get(
  '/:id',
  [param('id').isString()],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = req.user?.id;
      const workflowId = req.params.id;

      if (!userId || !workflowId) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }

      const workflow = await prisma.workflow.findFirst({
        where: { id: workflowId, userId },
        include: {
          triggers: true,
          actions: true,
          conditions: true,
          deposits: true,
          executions: {
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
        },
      });

      if (!workflow) {
        return res.status(404).json({ error: 'Automation not found' });
      }

      res.json({ automation: workflow });
    } catch (error) {
      logger.error('Failed to fetch automation:', error);
      res.status(500).json({ error: 'Failed to fetch automation' });
    }
  }
);

/**
 * PUT /api/automations/:id/toggle
 * Toggle automation active/inactive status
 */
router.put(
  '/:id/toggle',
  [param('id').isString()],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = req.user?.id;
      const workflowId = req.params.id;

      if (!userId || !workflowId) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }

      const workflow = await prisma.workflow.findFirst({
        where: { id: workflowId, userId },
      });

      if (!workflow) {
        return res.status(404).json({ error: 'Automation not found' });
      }

      const updatedWorkflow = await prisma.workflow.update({
        where: { id: workflowId },
        data: { isActive: !workflow.isActive },
        include: {
          triggers: true,
          actions: true,
          conditions: true,
        },
      });

      // Start monitoring if activated
      if (updatedWorkflow.isActive) {
        await addTriggerEvaluationJob(workflowId, 1);
      }

      logger.info(`Automation ${updatedWorkflow.isActive ? 'activated' : 'deactivated'}: ${workflowId}`, { userId });

      res.json({
        message: `Automation ${updatedWorkflow.isActive ? 'activated' : 'deactivated'}`,
        automation: updatedWorkflow,
      });
    } catch (error) {
      logger.error('Failed to toggle automation:', error);
      res.status(500).json({ error: 'Failed to toggle automation' });
    }
  }
);

/**
 * POST /api/automations/:id/execute
 * Manually execute an automation (for testing)
 */
router.post(
  '/:id/execute',
  [param('id').isString()],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = req.user?.id;
      const workflowId = req.params.id;

      if (!userId || !workflowId) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }

      const workflow = await prisma.workflow.findFirst({
        where: { id: workflowId, userId },
        include: {
          triggers: true,
          actions: true,
          conditions: true,
        },
      });

      if (!workflow) {
        return res.status(404).json({ error: 'Automation not found' });
      }

      // Add execution job
      await addExecutionJob(workflowId, { manual: true, userId }, 10);

      logger.info(`Manual execution triggered: ${workflowId}`, { userId });

      res.json({
        message: 'Automation execution started',
        workflowId,
      });
    } catch (error) {
      logger.error('Failed to execute automation:', error);
      res.status(500).json({ error: 'Failed to execute automation' });
    }
  }
);

/**
 * DELETE /api/automations/:id
 * Delete an automation
 */
router.delete(
  '/:id',
  [param('id').isString()],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = req.user?.id;
      const workflowId = req.params.id;

      if (!userId || !workflowId) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }

      const workflow = await prisma.workflow.findFirst({
        where: { id: workflowId, userId },
      });

      if (!workflow) {
        return res.status(404).json({ error: 'Automation not found' });
      }

      await prisma.workflow.delete({
        where: { id: workflowId },
      });

      logger.info(`Automation deleted: ${workflowId}`, { userId });

      res.json({ message: 'Automation deleted successfully' });
    } catch (error) {
      logger.error('Failed to delete automation:', error);
      res.status(500).json({ error: 'Failed to delete automation' });
    }
  }
);

// Helper functions for validation
function validateTriggerConfig(trigger: any): { valid: boolean; message?: string } {
  switch (trigger.type) {
    case 'PRICE_THRESHOLD':
      if (!trigger.config.token || !trigger.config.threshold || !trigger.config.operator) {
        return { valid: false, message: 'Price threshold trigger requires token, threshold, and operator' };
      }
      break;
    case 'PRICE_CHANGE':
      if (!trigger.config.token || !trigger.config.percentage) {
        return { valid: false, message: 'Price change trigger requires token and percentage' };
      }
      break;
    case 'BALANCE_CHANGE':
      if (!trigger.config.token || !trigger.config.threshold) {
        return { valid: false, message: 'Balance change trigger requires token and threshold' };
      }
      break;
    case 'TIME_BASED':
      if (!trigger.config.schedule && !trigger.config.interval) {
        return { valid: false, message: 'Time-based trigger requires schedule or interval' };
      }
      break;
  }
  return { valid: true };
}

function validateActionConfig(action: any): { valid: boolean; message?: string } {
  switch (action.type) {
    case 'SWAP':
      if (!action.config.fromToken || !action.config.toToken || !action.config.amount) {
        return { valid: false, message: 'Swap action requires fromToken, toToken, and amount' };
      }
      break;
    case 'TRANSFER':
      if (!action.config.token || !action.config.to || !action.config.amount) {
        return { valid: false, message: 'Transfer action requires token, to, and amount' };
      }
      break;
    case 'CROSS_CHAIN_SWAP':
      if (!action.config.fromChain || !action.config.toChain || !action.config.token || !action.config.amount) {
        return { valid: false, message: 'Cross-chain swap requires fromChain, toChain, token, and amount' };
      }
      break;
  }
  return { valid: true };
}

export default router; 