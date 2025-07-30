import { Job } from 'bullmq';
import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';
import { oneInchService } from '../services/oneInchService.js';
import { vaultService } from '../services/vaultService.js';
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
          actionsExecuted: results.length,
          status: 'COMPLETED'
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
          actionsExecuted: 0,
          status: 'FAILED'
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
      case 'FUSION_ORDER':
        return await executeFusionOrderAction(action, workflow, executionId);
      
      default:
        throw new Error(`Unknown action type: ${action.type}. Available types: FUSION_ORDER`);
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

async function executeFusionOrderAction(action: any, workflow: any, executionId: string): Promise<any> {
  const { fromToken, toToken, amount, chainId, fromChain, toChain, receiver, deadline } = action.config;
  
  try {
    logger.info(`Creating Fusion+ order`, { fromToken, toToken, amount, chainId, fromChain, toChain });

    let fusionOrder;
    let vaultReservation;

    // Handle cross-chain or same-chain Fusion+ orders
    if (fromChain && toChain && fromChain !== toChain) {
      // Cross-chain Fusion+ order
      logger.info(`Executing cross-chain Fusion+ order from chain ${fromChain} to ${toChain}`);
      
      // Check vault balance for cross-chain order
      const balanceCheck = await vaultService.checkSwapBalance(
        workflow.user.walletAddress,
        fromToken,
        amount,
        fromChain
      );

      if (!balanceCheck.sufficient) {
        throw new Error(`Insufficient vault balance for cross-chain order. Required: ${amount}, Available: ${balanceCheck.currentBalance}`);
      }
    
      fusionOrder = await oneInchService.createFusionOrder(
        fromChain,
        toChain,
        fromToken,
        toToken,
        amount,
        workflow.user.walletAddress,
        receiver || workflow.user.walletAddress,
        deadline || Math.floor(Date.now() / 1000) + 3600
      );

      // Handle vault for Fusion order (reserve but don't deduct immediately)
      vaultReservation = await vaultService.handleFusionOrderVault(
        workflow.user.walletAddress,
        fromToken,
        amount,
        fusionOrder.orderHash
      );

      logger.info('Cross-chain Fusion+ order created with vault reservation', {
        orderHash: fusionOrder.orderHash,
        vaultReserved: vaultReservation.reserved,
        reservationId: vaultReservation.reservationId
      });

      return {
        success: true,
        actionId: action.id,
        actionType: 'FUSION_ORDER',
        result: {
          orderHash: fusionOrder.orderHash,
          fromToken,
          toToken,
          amount,
          fromChain,
          toChain,
          quoteId: fusionOrder.quoteId,
          orderType: 'CROSS_CHAIN',
          estimatedTime: '5-15 minutes',
          vaultReservation: vaultReservation
        }
      };

    } else {
      // Same-chain Fusion+ order
      const targetChain = chainId || fromChain || toChain;
      
      // Check vault balance for same-chain order
      const balanceCheck = await vaultService.checkSwapBalance(
        workflow.user.walletAddress,
        fromToken,
        amount,
        targetChain
      );

      if (!balanceCheck.sufficient) {
        throw new Error(`Insufficient vault balance. Required: ${amount}, Available: ${balanceCheck.currentBalance}`);
      }

      fusionOrder = await oneInchService.createFusionOrder(
        targetChain,
        targetChain,
        fromToken,
        toToken,
        amount,
        workflow.user.walletAddress,
        receiver || workflow.user.walletAddress,
        deadline || Math.floor(Date.now() / 1000) + 3600
      );

      // Handle vault for Fusion order
      vaultReservation = await vaultService.handleFusionOrderVault(
        workflow.user.walletAddress,
        fromToken,
        amount,
        fusionOrder.orderHash
      );

      logger.info('Same-chain Fusion+ order created with vault reservation', {
        orderHash: fusionOrder.orderHash,
        vaultReserved: vaultReservation.reserved,
        reservationId: vaultReservation.reservationId
      });

      return {
        success: true,
        actionId: action.id,
        actionType: 'FUSION_ORDER',
        result: {
          orderHash: fusionOrder.orderHash,
          fromToken,
          toToken,
          amount,
          chainId: targetChain,
          quoteId: fusionOrder.quoteId,
          orderType: 'SAME_CHAIN',
          vaultReservation: vaultReservation
        }
      };
    }

  } catch (error) {
    logger.error(`Fusion order creation failed: ${error}`);
    throw new Error(`Fusion order creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 