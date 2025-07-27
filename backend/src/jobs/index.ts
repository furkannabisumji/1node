import { Queue, Worker, QueueScheduler } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config';
import { logger } from '../config/logger';

// Import job processors
import { processTriggerEvaluation } from './triggerProcessor';
import { processAutomationExecution } from './executionProcessor';
import { processNotificationJob } from './notificationProcessor';
import { processAIAnalysis } from './aiProcessor';

// Redis connection
const redisConnection = new IORedis(config.redisUrl, {
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
});

// Job queues
export const triggerQueue = new Queue('trigger-evaluation', { connection: redisConnection });
export const executionQueue = new Queue('automation-execution', { connection: redisConnection });
export const notificationQueue = new Queue('notifications', { connection: redisConnection });
export const aiQueue = new Queue('ai-analysis', { connection: redisConnection });

// Queue schedulers for delayed jobs
const triggerScheduler = new QueueScheduler('trigger-evaluation', { connection: redisConnection });
const executionScheduler = new QueueScheduler('automation-execution', { connection: redisConnection });
const notificationScheduler = new QueueScheduler('notifications', { connection: redisConnection });
const aiScheduler = new QueueScheduler('ai-analysis', { connection: redisConnection });

// Workers
let triggerWorker: Worker;
let executionWorker: Worker;
let notificationWorker: Worker;
let aiWorker: Worker;

export async function initializeJobs(): Promise<void> {
  try {
    logger.info('Initializing job queues and workers...');

    // Create workers
    triggerWorker = new Worker('trigger-evaluation', processTriggerEvaluation, {
      connection: redisConnection,
      concurrency: 5,
      limiter: {
        max: 100,
        duration: 60000, // 100 jobs per minute
      },
    });

    executionWorker = new Worker('automation-execution', processAutomationExecution, {
      connection: redisConnection,
      concurrency: 3,
      limiter: {
        max: 50,
        duration: 60000, // 50 executions per minute
      },
    });

    notificationWorker = new Worker('notifications', processNotificationJob, {
      connection: redisConnection,
      concurrency: 10,
      limiter: {
        max: 200,
        duration: 60000, // 200 notifications per minute
      },
    });

    aiWorker = new Worker('ai-analysis', processAIAnalysis, {
      connection: redisConnection,
      concurrency: 2,
      limiter: {
        max: 20,
        duration: 60000, // 20 AI analyses per minute
      },
    });

    // Set up event listeners
    setupWorkerEventListeners();

    // Add recurring jobs
    await setupRecurringJobs();

    logger.info('✅ Job queues and workers initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize job queues:', error);
    throw error;
  }
}

function setupWorkerEventListeners(): void {
  // Trigger worker events
  triggerWorker.on('completed', (job) => {
    logger.debug(`Trigger evaluation completed: ${job.id}`, { jobData: job.data });
  });

  triggerWorker.on('failed', (job, err) => {
    logger.error(`Trigger evaluation failed: ${job?.id}`, { error: err.message, jobData: job?.data });
  });

  // Execution worker events
  executionWorker.on('completed', (job) => {
    logger.info(`Automation execution completed: ${job.id}`, { jobData: job.data });
  });

  executionWorker.on('failed', (job, err) => {
    logger.error(`Automation execution failed: ${job?.id}`, { error: err.message, jobData: job?.data });
  });

  // Notification worker events
  notificationWorker.on('completed', (job) => {
    logger.debug(`Notification sent: ${job.id}`, { jobData: job.data });
  });

  notificationWorker.on('failed', (job, err) => {
    logger.error(`Notification failed: ${job?.id}`, { error: err.message, jobData: job?.data });
  });

  // AI worker events
  aiWorker.on('completed', (job) => {
    logger.info(`AI analysis completed: ${job.id}`, { jobData: job.data });
  });

  aiWorker.on('failed', (job, err) => {
    logger.error(`AI analysis failed: ${job?.id}`, { error: err.message, jobData: job?.data });
  });
}

async function setupRecurringJobs(): Promise<void> {
  try {
    // Clear existing repeatable jobs
    await triggerQueue.obliterate({ force: true });

    // Add repeatable job for trigger evaluation every 30 seconds
    await triggerQueue.add(
      'evaluate-all-triggers',
      {},
      {
        repeat: { every: 30000 }, // 30 seconds
        removeOnComplete: 10,
        removeOnFail: 5,
      }
    );

    // Add repeatable job for portfolio analysis every 5 minutes
    if (config.enableAiSuggestions) {
      await aiQueue.add(
        'portfolio-analysis',
        {},
        {
          repeat: { every: 300000 }, // 5 minutes
          removeOnComplete: 10,
          removeOnFail: 5,
        }
      );
    }

    // Add repeatable job for price updates every minute
    await triggerQueue.add(
      'update-prices',
      {},
      {
        repeat: { every: 60000 }, // 1 minute
        removeOnComplete: 5,
        removeOnFail: 3,
      }
    );

    logger.info('✅ Recurring jobs set up successfully');
  } catch (error) {
    logger.error('Failed to set up recurring jobs:', error);
    throw error;
  }
}

// Job queue helper functions
export async function addTriggerEvaluationJob(workflowId: string, priority = 0): Promise<void> {
  await triggerQueue.add(
    'evaluate-workflow-triggers',
    { workflowId },
    {
      priority,
      removeOnComplete: 20,
      removeOnFail: 10,
      attempts: 3,
      backoff: 'exponential',
    }
  );
}

export async function addExecutionJob(
  workflowId: string, 
  triggeredBy: any, 
  priority = 0
): Promise<void> {
  await executionQueue.add(
    'execute-automation',
    { workflowId, triggeredBy },
    {
      priority,
      removeOnComplete: 20,
      removeOnFail: 10,
      attempts: 3,
      backoff: 'exponential',
      delay: 1000, // 1 second delay
    }
  );
}

export async function addNotificationJob(
  userId: string,
  type: string,
  title: string,
  message: string,
  metadata?: any
): Promise<void> {
  await notificationQueue.add(
    'send-notification',
    { userId, type, title, message, metadata },
    {
      removeOnComplete: 50,
      removeOnFail: 20,
      attempts: 3,
      backoff: 'exponential',
    }
  );
}

export async function addAIAnalysisJob(
  userId: string,
  analysisType: string,
  data: any
): Promise<void> {
  await aiQueue.add(
    'ai-analysis',
    { userId, analysisType, data },
    {
      removeOnComplete: 10,
      removeOnFail: 5,
      attempts: 2,
      backoff: 'exponential',
    }
  );
}

// Queue monitoring
export async function getQueueStats(): Promise<any> {
  const [triggerStats, executionStats, notificationStats, aiStats] = await Promise.all([
    triggerQueue.getJobCounts(),
    executionQueue.getJobCounts(),
    notificationQueue.getJobCounts(),
    aiQueue.getJobCounts(),
  ]);

  return {
    trigger: triggerStats,
    execution: executionStats,
    notification: notificationStats,
    ai: aiStats,
  };
}

// Graceful shutdown
export async function shutdownJobs(): Promise<void> {
  logger.info('Shutting down job workers...');

  await Promise.all([
    triggerWorker?.close(),
    executionWorker?.close(),
    notificationWorker?.close(),
    aiWorker?.close(),
  ]);

  await Promise.all([
    triggerScheduler?.close(),
    executionScheduler?.close(),
    notificationScheduler?.close(),
    aiScheduler?.close(),
  ]);

  await redisConnection.disconnect();
  logger.info('✅ Job workers shut down successfully');
} 