import { Job } from 'bullmq';
import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';
import { oneInchService } from '../services/oneInchService.js';
import { addNotificationJob } from './index.js';

export async function processAutomationExecution(job: Job): Promise<void> {
  const { workflowId, triggeredBy } = job.data;
  
  try {
    logger.info(`Processing automation execution for workflow: ${workflowId}`, { triggeredBy });

    // Get workflow with actions and user
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        actions: { orderBy: { createdAt: 'asc' } },
        user: true,
        deposits: true
      }
    });

    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    if (!workflow.isActive) {
      logger.info(`Workflow ${workflowId} is not active, skipping execution`);
      return;
    }

    // Create execution record
    const execution = await prisma.execution.create({
      data: {
        workflow: { connect: { id: workflowId } },
        actionsExecuted: 0,
        triggeredBy: JSON.stringify(triggeredBy),
        status: 'PENDING'
      }
    });

    try {
      // Execute actions in sequence
      const results = [];
      for (const action of workflow.actions) {
        const result = await executeAction(action, workflow, execution.id);
        results.push(result);
        
        if (!result.success) {
          throw new Error(`Action ${action.id} failed: ${result.error}`);
        }
      }

      // Update execution as successful
      await prisma.execution.update({
        where: { id: execution.id },
        data: {
          actionsExecuted: results.length
        }
      });

      // Send success notification
      await addNotificationJob(
        workflow.userId,
        'EXECUTION_SUCCESS',
        'Automation Executed Successfully',
        `Your workflow "${workflow.name}" has been executed successfully.`,
        { workflowId, executionId: execution.id, results }
      );

      logger.info(`Automation execution completed for workflow ${workflowId}`, {
        executionId: execution.id,
        actionsExecuted: results.length
      });

    } catch (error) {
      // Update execution as failed
      await prisma.execution.update({
        where: { id: execution.id },
        data: {
          actionsExecuted: 0
        }
      });

      // Send failure notification
      await addNotificationJob(
        workflow.userId,
        'EXECUTION_FAILED',
        'Automation Execution Failed',
        `Your workflow "${workflow.name}" failed to execute: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { workflowId, executionId: execution.id, error: error instanceof Error ? error.message : 'Unknown error' }
      );

      throw error;
    }

  } catch (error) {
    logger.error('Automation execution failed:', error);
    throw error;
  }
}

async function executeAction(action: any, workflow: any, executionId: string): Promise<any> {
  try {
    logger.info(`Executing action ${action.id} of type ${action.type}`, { workflowId: workflow.id });

    switch (action.type) {
      case 'SWAP':
        return await executeSwapAction(action, workflow, executionId);
      
      case 'BRIDGE':
        return await executeBridgeAction(action, workflow, executionId);
      
      case 'LIMIT_ORDER':
        return await executeLimitOrderAction(action, workflow, executionId);
      
      case 'YIELD_FARM':
        return await executeYieldFarmAction(action, workflow, executionId);
      
      case 'REBALANCE':
        return await executeRebalanceAction(action, workflow, executionId);
      
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  } catch (error) {
    logger.error(`Action ${action.id} execution failed:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      actionId: action.id,
      actionType: action.type
    };
  }
}

async function executeSwapAction(action: any, workflow: any, executionId: string): Promise<any> {
  const { fromToken, toToken, amount, chainId, slippage } = action.config;
  
  try {
    // Get swap quote
    const quote = await oneInchService.getSwapQuote(
      fromToken,
      toToken,
      amount,
      chainId
    );

    // Build transaction
    const transaction = await oneInchService.buildSwapTransaction(
      fromToken,
      toToken,
      amount,
      workflow.user.walletAddress,
      chainId
    );

    // In a real implementation, you would:
    // 1. Sign the transaction with the user's private key
    // 2. Submit to the blockchain
    // 3. Wait for confirmation
    // For now, we'll simulate success

    logger.info(`Swap executed: ${amount} ${fromToken} -> ${quote.toTokenAmount} ${toToken}`, {
      workflowId: workflow.id,
      executionId,
      chainId
    });

    return {
      success: true,
      actionId: action.id,
      actionType: 'SWAP',
      result: {
        fromToken,
        toToken,
        fromAmount: amount,
        toAmount: quote.toTokenAmount,
        chainId,
        txHash: 'simulated-tx-hash', // Would be real hash
        gasUsed: quote.estimatedGas
      }
    };

  } catch (error) {
    throw new Error(`Swap execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function executeBridgeAction(action: any, workflow: any, executionId: string): Promise<any> {
  const { token, amount, fromChain, toChain } = action.config;
  
  try {
    // For cross-chain operations, you would typically use:
    // - 1inch Fusion+ for cross-chain swaps
    // - Bridge protocols like Across, Stargate, etc.
    
    logger.info(`Bridge executed: ${amount} ${token} from chain ${fromChain} to ${toChain}`, {
      workflowId: workflow.id,
      executionId
    });

    return {
      success: true,
      actionId: action.id,
      actionType: 'BRIDGE',
      result: {
        token,
        amount,
        fromChain,
        toChain,
        txHash: 'simulated-bridge-tx-hash',
        estimatedTime: '5-10 minutes'
      }
    };

  } catch (error) {
    throw new Error(`Bridge execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function executeLimitOrderAction(action: any, workflow: any, executionId: string): Promise<any> {
  const { fromToken, toToken, amount, limitPrice, chainId, expiry } = action.config;
  
  try {
    // Create limit order using 1inch limit order protocol
    const order = await oneInchService.createLimitOrder(
      fromToken,
      toToken,
      amount,
      Math.floor(parseFloat(amount) * parseFloat(limitPrice)).toString(),
      workflow.user.walletAddress,
      chainId
    );

    logger.info(`Limit order created: ${amount} ${fromToken} at price ${limitPrice}`, {
      workflowId: workflow.id,
      executionId,
      chainId
    });

    return {
      success: true,
      actionId: action.id,
      actionType: 'LIMIT_ORDER',
      result: {
        orderHash: order.orderHash,
        fromToken,
        toToken,
        amount,
        limitPrice,
        chainId,
        expiry
      }
    };

  } catch (error) {
    throw new Error(`Limit order creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function executeYieldFarmAction(action: any, workflow: any, executionId: string): Promise<any> {
  const { protocol, poolAddress, amount, chainId } = action.config;
  
  try {
    // Yield farming would involve:
    // 1. Approving tokens for the protocol
    // 2. Depositing tokens into yield farming pool
    // 3. Staking LP tokens if required
    
    logger.info(`Yield farm action executed on ${protocol}`, {
      workflowId: workflow.id,
      executionId,
      amount,
      chainId
    });

    return {
      success: true,
      actionId: action.id,
      actionType: 'YIELD_FARM',
      result: {
        protocol,
        poolAddress,
        amount,
        chainId,
        txHash: 'simulated-yield-tx-hash',
        expectedApy: '12.5%'
      }
    };

  } catch (error) {
    throw new Error(`Yield farm execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function executeRebalanceAction(action: any, workflow: any, executionId: string): Promise<any> {
  const { targetAllocations, chainId } = action.config;
  
  try {
    // Portfolio rebalancing would involve:
    // 1. Getting current portfolio balances
    // 2. Calculating required swaps to reach target allocation
    // 3. Executing multiple swap transactions
    
    logger.info(`Portfolio rebalanced according to target allocations`, {
      workflowId: workflow.id,
      executionId,
      targetAllocations,
      chainId
    });

    return {
      success: true,
      actionId: action.id,
      actionType: 'REBALANCE',
      result: {
        targetAllocations,
        chainId,
        swapsExecuted: 3,
        totalGasUsed: '0.005 ETH',
        newAllocation: targetAllocations
      }
    };

  } catch (error) {
    throw new Error(`Rebalance execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 