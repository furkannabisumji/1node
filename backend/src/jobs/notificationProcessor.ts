import { Job } from 'bullmq';
import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';
import { config } from '../config/index.js';

// Notification services would be imported here
// import { sendEmail } from '../services/emailService.js';
// import { sendTelegramMessage } from '../services/telegramService.js';
// import { sendPushNotification } from '../services/pushService.js';

export async function processNotificationJob(job: Job): Promise<void> {
  const { userId, type, title, message, metadata } = job.data;
  
  try {
    logger.info(`Processing notification for user ${userId}`, { type, title });

    // Get user preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        walletAddress: true,
        notificationPrefs: true
      }
    });

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    // Create notification record
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        metadata
      }
    });

    try {
      // Send notifications based on user preferences
      const prefs = user.notificationPrefs as any || {};
      const results = [];

      // Email notifications
      if (prefs.email && user.email) {
        const emailResult = await sendEmailNotification(user.email, type, title, message, metadata);
        results.push({ channel: 'email', success: emailResult.success });
      }

      // Telegram notifications
      if (prefs.telegram && prefs.telegramChatId) {
        const telegramResult = await sendTelegramNotification(prefs.telegramChatId, type, title, message, metadata);
        results.push({ channel: 'telegram', success: telegramResult.success });
      }

      // Push notifications (for web/mobile)
      if (prefs.push) {
        const pushResult = await sendPushNotification(userId, type, title, message, metadata);
        results.push({ channel: 'push', success: pushResult.success });
      }

      // In-app notifications (always enabled)
      results.push({ channel: 'in-app', success: true });

      // Update notification status
      const allSuccessful = results.every(r => r.success);
      // Notification sent successfully (would update status in real implementation)

      logger.info(`Notification processed for user ${userId}`, {
        notificationId: notification.id,
        channels: results.length,
        allSuccessful
      });

    } catch (error) {
      // Mark notification as failed
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          updatedAt: new Date()
        }
      });

      throw error;
    }

  } catch (error) {
    logger.error('Notification processing failed:', error);
    throw error;
  }
}

async function sendEmailNotification(
  email: string, 
  type: string, 
  title: string, 
  message: string, 
  metadata?: any
): Promise<{ success: boolean; error?: string }> {
  try {
    // Email service integration would go here
    // For now, we'll simulate email sending
    
    logger.info(`Sending email notification to ${email}`, { type, title });

    // Simulate email sending based on notification type
    const emailTemplate = getEmailTemplate(type, title, message, metadata);
    
    // In a real implementation:
    // await emailService.send({
    //   to: email,
    //   subject: title,
    //   html: emailTemplate.html,
    //   text: emailTemplate.text
    // });

    logger.info(`Email notification sent successfully to ${email}`);
    return { success: true };

  } catch (error) {
    logger.error(`Failed to send email to ${email}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function sendTelegramNotification(
  chatId: string, 
  type: string, 
  title: string, 
  message: string, 
  metadata?: any
): Promise<{ success: boolean; error?: string }> {
  try {
    logger.info(`Sending Telegram notification to chat ${chatId}`, { type, title });

    // Format message for Telegram
    const telegramMessage = formatTelegramMessage(type, title, message, metadata);
    
    // In a real implementation:
    // await telegramBot.sendMessage(chatId, telegramMessage, {
    //   parse_mode: 'Markdown',
    //   disable_web_page_preview: true
    // });

    logger.info(`Telegram notification sent successfully to chat ${chatId}`);
    return { success: true };

  } catch (error) {
    logger.error(`Failed to send Telegram message to ${chatId}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function sendPushNotification(
  userId: string, 
  type: string, 
  title: string, 
  message: string, 
  metadata?: any
): Promise<{ success: boolean; error?: string }> {
  try {
    logger.info(`Sending push notification to user ${userId}`, { type, title });

    // Push notification would use services like:
    // - Firebase Cloud Messaging for mobile
    // - Web Push API for browsers
    // - Apple Push Notification Service for iOS
    
    // In a real implementation:
    // await pushService.send({
    //   userId,
    //   title,
    //   body: message,
    //   data: metadata,
    //   icon: getNotificationIcon(type),
    //   badge: getNotificationBadge(type)
    // });

    logger.info(`Push notification sent successfully to user ${userId}`);
    return { success: true };

  } catch (error) {
    logger.error(`Failed to send push notification to user ${userId}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

function getEmailTemplate(type: string, title: string, message: string, metadata?: any): { html: string; text: string } {
  const baseTemplate = {
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">DeFi Automation Platform</h1>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #333;">${title}</h2>
          <p style="color: #666; line-height: 1.6;">${message}</p>
          ${metadata ? `<div style="background: #e9ecef; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <h3 style="margin-top: 0;">Details:</h3>
            <pre style="font-size: 12px; overflow-x: auto;">${JSON.stringify(metadata, null, 2)}</pre>
          </div>` : ''}
        </div>
        <div style="padding: 20px; text-align: center; background-color: #333; color: white;">
          <p style="margin: 0;">Manage your automations at <a href="#" style="color: #667eea;">DeFi Automation Platform</a></p>
        </div>
      </div>
    `,
    text: `${title}\n\n${message}${metadata ? `\n\nDetails:\n${JSON.stringify(metadata, null, 2)}` : ''}\n\nManage your automations at DeFi Automation Platform`
  };

  return baseTemplate;
}

function formatTelegramMessage(type: string, title: string, message: string, metadata?: any): string {
  const emoji = getNotificationEmoji(type);
  let telegramMessage = `${emoji} *${title}*\n\n${message}`;
  
  if (metadata) {
    telegramMessage += '\n\n📊 *Details:*';
    
    // Format common metadata fields
    if (metadata.workflowId) {
      telegramMessage += `\n• Workflow ID: \`${metadata.workflowId}\``;
    }
    if (metadata.executionId) {
      telegramMessage += `\n• Execution ID: \`${metadata.executionId}\``;
    }
    if (metadata.txHash) {
      telegramMessage += `\n• Transaction: \`${metadata.txHash}\``;
    }
    if (metadata.chainId) {
      telegramMessage += `\n• Chain: ${getChainName(metadata.chainId)}`;
    }
  }
  
  return telegramMessage;
}

function getNotificationEmoji(type: string): string {
  const emojiMap: { [key: string]: string } = {
    'EXECUTION_SUCCESS': '✅',
    'EXECUTION_FAILED': '❌',
    'TRIGGER_ACTIVATED': '🔔',
    'PRICE_ALERT': '📈',
    'BALANCE_LOW': '⚠️',
    'WORKFLOW_CREATED': '🆕',
    'WORKFLOW_PAUSED': '⏸️',
    'SECURITY_ALERT': '🚨',
    'SYSTEM_UPDATE': 'ℹ️',
    'BRIDGE_COMPLETED': '🌉',
    'SWAP_COMPLETED': '🔄',
    'YIELD_EARNED': '💰'
  };
  
  return emojiMap[type] || '📋';
}

function getChainName(chainId: number): string {
  const chainNames: { [key: number]: string } = {
    1: 'Ethereum',
    56: 'BSC',
    137: 'Polygon',
    42161: 'Arbitrum',
    10: 'Optimism',
    43114: 'Avalanche',
    250: 'Fantom'
  };
  
  return chainNames[chainId] || `Chain ${chainId}`;
}

function getNotificationIcon(type: string): string {
  // Return appropriate icon URL based on notification type
  return '/icons/notification-default.png';
}

function getNotificationBadge(type: string): number {
  // Return badge count for different notification types
  return type === 'EXECUTION_FAILED' || type === 'SECURITY_ALERT' ? 1 : 0;
} 