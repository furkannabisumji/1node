import { Job } from 'bullmq';
import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';
import { oneInchService } from '../services/oneInchService.js';
import { addExecutionJob } from './index.js';

export async function processTriggerEvaluation(job: Job): Promise<void> {
  const { workflowId } = job.data;
  
  try {
    logger.info(`Processing trigger evaluation for workflow: ${workflowId}`);

    // Get active workflows to evaluate
    const workflows = workflowId 
      ? await prisma.workflow.findMany({
          where: { id: workflowId, isActive: true },
          include: { triggers: true, conditions: true }
        })
      : await prisma.workflow.findMany({
          where: { isActive: true },
          include: { triggers: true, conditions: true }
        });

    for (const workflow of workflows) {
      await evaluateWorkflowTriggers(workflow);
    }

    // Handle special recurring jobs
    if (job.name === 'update-prices') {
      await updatePriceData();
    }

    logger.info(`Trigger evaluation completed for ${workflows.length} workflows`);
  } catch (error) {
    logger.error('Trigger evaluation failed:', error);
    throw error;
  }
}

async function evaluateWorkflowTriggers(workflow: any): Promise<void> {
  try {
    for (const trigger of workflow.triggers) {
      const shouldExecute = await evaluateTrigger(trigger, workflow);
      
      if (shouldExecute) {
        logger.info(`Trigger activated for workflow ${workflow.id}`, { 
          triggerId: trigger.id, 
          triggerType: trigger.type 
        });

        // Check conditions before execution
        const conditionsMet = await evaluateConditions(workflow.conditions, workflow);
        
        if (conditionsMet) {
          await addExecutionJob(workflow.id, {
            triggerId: trigger.id,
            triggerType: trigger.type,
            timestamp: new Date()
          }, 1); // High priority for triggered executions
        }
      }
    }
  } catch (error) {
    logger.error(`Failed to evaluate triggers for workflow ${workflow.id}:`, error);
  }
}

async function evaluateTrigger(trigger: any, workflow: any): Promise<boolean> {
  try {
    switch (trigger.type) {
      case 'PRICE_THRESHOLD':
        return await evaluatePriceTrigger(trigger, workflow);
      
      case 'TIME_BASED':
        return await evaluateTimeTrigger(trigger);
      
      case 'BALANCE_CHANGE':
        return await evaluateBalanceTrigger(trigger, workflow);
      
      case 'MARKET_CONDITION':
        return await evaluateMarketTrigger(trigger);
      
      default:
        logger.warn(`Unknown trigger type: ${trigger.type}`);
        return false;
    }
  } catch (error) {
    logger.error(`Error evaluating trigger ${trigger.id}:`, error);
    return false;
  }
}

async function evaluatePriceTrigger(trigger: any, workflow: any): Promise<boolean> {
  const { tokenAddress, chainId, operator, threshold } = trigger.config;
  
  try {
    // Validate inputs
    if (!chainId || !tokenAddress) {
      logger.warn('Missing chainId or tokenAddress in price trigger config', { 
        chainId, 
        tokenAddress, 
        triggerId: trigger.id 
      });
      return false;
    }

    // Get current token price
    const priceData = await oneInchService.getTokenPrices(chainId, [tokenAddress]);
    const currentPrice = parseFloat(priceData[tokenAddress] || '0');
    const thresholdPrice = parseFloat(threshold);

    switch (operator) {
      case 'GREATER_THAN':
        return currentPrice > thresholdPrice;
      case 'LESS_THAN':
        return currentPrice < thresholdPrice;
      case 'EQUALS':
        return Math.abs(currentPrice - thresholdPrice) < 0.01; // Small tolerance
      default:
        return false;
    }
  } catch (error) {
    logger.error('Price trigger evaluation failed:', error);
    return false;
  }
}

async function evaluateTimeTrigger(trigger: any): Promise<boolean> {
  const { schedule, lastExecuted } = trigger.config;
  const now = new Date();
  
  // Simple time-based checks
  if (schedule === 'DAILY') {
    const lastExec = lastExecuted ? new Date(lastExecuted) : new Date(0);
    const daysDiff = (now.getTime() - lastExec.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff >= 1;
  }
  
  if (schedule === 'WEEKLY') {
    const lastExec = lastExecuted ? new Date(lastExecuted) : new Date(0);
    const daysDiff = (now.getTime() - lastExec.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff >= 7;
  }
  
  return false;
}

async function evaluateBalanceTrigger(trigger: any, workflow: any): Promise<boolean> {
  const { tokenAddress, chainId, operator, threshold } = trigger.config;
  
  try {
    // Get user's current balance
    const balance = await oneInchService.getWalletBalances(
      workflow.user.walletAddress,
      tokenAddress,
      chainId
    );
    
    const currentBalance = parseFloat(balance[tokenAddress] || '0');
    const thresholdBalance = parseFloat(threshold);

    switch (operator) {
      case 'GREATER_THAN':
        return currentBalance > thresholdBalance;
      case 'LESS_THAN':
        return currentBalance < thresholdBalance;
      default:
        return false;
    }
  } catch (error) {
    logger.error('Balance trigger evaluation failed:', error);
    return false;
  }
}

async function evaluateMarketTrigger(trigger: any): Promise<boolean> {
  // Placeholder for market condition evaluation
  // This would integrate with market data APIs
  logger.info('Market trigger evaluation - placeholder');
  return false;
}

async function evaluateConditions(conditions: any[], workflow: any): Promise<boolean> {
  if (!conditions || conditions.length === 0) {
    return true; // No conditions means always execute
  }

  // Simple AND logic for all conditions
  for (const condition of conditions) {
    const conditionMet = await evaluateCondition(condition, workflow);
    if (!conditionMet) {
      return false;
    }
  }
  
  return true;
}

async function evaluateCondition(condition: any, workflow: any): Promise<boolean> {
  try {
    switch (condition.type) {
      case 'MIN_BALANCE':
        return await evaluateMinBalanceCondition(condition, workflow);
      case 'MAX_SLIPPAGE':
        return true; // Will be checked during execution
      case 'TIME_WINDOW':
        return await evaluateTimeWindowCondition(condition);
      default:
        logger.warn(`Unknown condition type: ${condition.type}`);
        return true;
    }
  } catch (error) {
    logger.error(`Error evaluating condition ${condition.id}:`, error);
    return false;
  }
}

async function evaluateMinBalanceCondition(condition: any, workflow: any): Promise<boolean> {
  const { tokenAddress, chainId, minAmount } = condition.config;
  
  try {
    const balance = await oneInchService.getWalletBalances(
      workflow.user.walletAddress,
      tokenAddress,
      chainId
    );
    
    return parseFloat(balance[tokenAddress] || '0') >= parseFloat(minAmount);
  } catch (error) {
    logger.error('Min balance condition evaluation failed:', error);
    return false;
  }
}

async function evaluateTimeWindowCondition(condition: any): Promise<boolean> {
  const { startTime, endTime } = condition.config;
  const now = new Date();
  const currentTime = now.getHours() * 100 + now.getMinutes(); // HHMM format
  
  return currentTime >= parseInt(startTime) && currentTime <= parseInt(endTime);
}

async function updatePriceData(): Promise<void> {
  try {
    logger.info('Updating price data for monitored tokens');
    
    // Get all unique tokens from active triggers
    const triggers = await prisma.trigger.findMany({
      where: {
        type: 'PRICE_THRESHOLD',
        workflow: { isActive: true }
      },
      select: { config: true }
    });

    const uniqueTokens = new Map();
    triggers.forEach(trigger => {
      const config = trigger.config as any;
      if (config && config.tokenAddress && config.chainId) {
        const key = `${config.tokenAddress}-${config.chainId}`;
        uniqueTokens.set(key, {
          address: config.tokenAddress,
          chainId: config.chainId
        });
      }
    });

    // Update prices for each unique token
    for (const token of uniqueTokens.values()) {
      try {
        if (token.chainId && token.address) {
          await oneInchService.getTokenPrices(token.chainId, [token.address]);
          // Price is cached by the service
        } else {
          logger.warn('Invalid token data for price update', { token });
        }
      } catch (error) {
        logger.warn(`Failed to update price for token ${token.address}:`, error);
      }
    }

    logger.info(`Updated prices for ${uniqueTokens.size} tokens`);
  } catch (error) {
    logger.error('Price update failed:', error);
  }
} 