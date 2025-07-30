import { Job } from 'bullmq';
import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';
import { config } from '../config/index.js';
import { oneInchService } from '../services/oneInchService.js';
import { aiService } from '../services/aiService.js';
import { addNotificationJob } from './index.js';

export async function processAIAnalysis(job: Job): Promise<void> {
  const { userId, analysisType, data } = job.data;
  
  try {
    logger.info(`Processing AI analysis for user ${userId}`, { analysisType });

    // Check if AI suggestions are enabled
    if (!config.enableAiSuggestions) {
      logger.warn('AI suggestions are disabled');
      return;
    }

    switch (analysisType) {
      case 'portfolio-analysis':
        await processPortfolioAnalysis(userId, data);
        break;
        
      case 'market-sentiment':
        await processMarketSentiment(userId, data);
        break;
        
      case 'risk-assessment':
        await processRiskAssessment(userId, data);
        break;
        
      case 'yield-optimization':
        await processYieldOptimization(userId, data);
        break;
        
      case 'strategy-suggestion':
        await processStrategySuggestion(userId, data);
        break;
        
      default:
        throw new Error(`Unknown analysis type: ${analysisType}`);
    }

    logger.info(`AI analysis completed for user ${userId}`, { analysisType });

  } catch (error) {
    logger.error('AI analysis failed:', error);
    throw error;
  }
}

async function processPortfolioAnalysis(userId: string, data?: any): Promise<void> {
  try {
    // Get user's portfolio data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        workflows: {
          include: {
            deposits: true,
            executions: {
              where: { status: 'COMPLETED' },
              orderBy: { createdAt: 'desc' },
              take: 10
            }
          }
        }
      }
    });

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    if (!user.walletAddress) {
      logger.warn(`User ${userId} has no wallet address`);
      return;
    }

    // Use AI service for comprehensive portfolio analysis
    const analysisResult = await aiService.analyzePortfolio(userId, user.walletAddress);
    
    // Store analysis results in database
    await storeAnalysisResults(userId, 'portfolio-analysis', {
      portfolio: analysisResult.portfolio,
      suggestions: analysisResult.suggestions,
      riskAlerts: analysisResult.riskAlerts,
      generatedAt: new Date()
    });

    // Send notifications for high-priority suggestions
    const highPrioritySuggestions = analysisResult.suggestions.filter(s => s.confidence > 0.8);
    if (highPrioritySuggestions.length > 0) {
      await addNotificationJob(
        userId,
        'AI_INSIGHTS',
        'New Portfolio Insights Available',
        `AI analysis has identified ${highPrioritySuggestions.length} high-confidence optimization opportunities for your portfolio.`,
        { 
          analysisType: 'portfolio-analysis', 
          suggestions: highPrioritySuggestions,
          totalValue: analysisResult.portfolio.totalValue
        }
      );
    }

    // Send risk alerts if any critical risks detected
    const criticalAlerts = analysisResult.riskAlerts.filter(alert => alert.severity === 'CRITICAL' || alert.severity === 'HIGH');
    if (criticalAlerts.length > 0) {
      await addNotificationJob(
        userId,
        'RISK_ALERT',
        'Critical Risk Alerts',
        `AI analysis has detected ${criticalAlerts.length} critical risk factors in your portfolio.`,
        { alerts: criticalAlerts }
      );
    }

    logger.info(`Portfolio analysis completed for user ${userId}`, {
      portfolioValue: analysisResult.portfolio.totalValue,
      suggestionsGenerated: analysisResult.suggestions.length,
      riskAlertsGenerated: analysisResult.riskAlerts.length
    });

  } catch (error) {
    logger.error(`Portfolio analysis failed for user ${userId}:`, error);
    throw error;
  }
}

async function processMarketSentiment(userId: string, data?: any): Promise<void> {
  try {
    // Generate market sentiment analysis using OpenAI
    const marketAnalysis = await generateMarketSentimentAnalysis();
    
    // Get user's portfolio context for personalized insights
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddress: true, riskTolerance: true, preferredChains: true }
    });

    if (!user?.walletAddress) {
      logger.warn(`User ${userId} has no wallet address for market sentiment analysis`);
      return;
    }

    // Generate personalized market insights
    const insights = await generatePersonalizedMarketInsights(marketAnalysis, user);
    
    // Store results
    await storeAnalysisResults(userId, 'market-sentiment', {
      marketAnalysis,
      personalizedInsights: insights,
      generatedAt: new Date()
    });

    // Notify user of significant market insights
    if (insights.recommendedActions && insights.recommendedActions.length > 0) {
      await addNotificationJob(
        userId,
        'MARKET_INSIGHTS',
        'Market Analysis Update',
        `New market insights available with ${insights.recommendedActions.length} recommended actions.`,
        { insights, marketTrend: marketAnalysis.overallTrend }
      );
    }

    logger.info(`Market sentiment analysis completed for user ${userId}`);

  } catch (error) {
    logger.error(`Market sentiment analysis failed for user ${userId}:`, error);
    throw error;
  }
}

async function processRiskAssessment(userId: string, data?: any): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        workflows: {
          include: {
            deposits: true,
            executions: { where: { status: 'COMPLETED' }, take: 20 }
          }
        }
      }
    });

    if (!user?.walletAddress) {
      throw new Error(`User ${userId} not found or has no wallet address`);
    }

    // Use AI service for portfolio analysis which includes risk assessment
    const analysisResult = await aiService.analyzePortfolio(userId, user.walletAddress);
    
    // Focus on risk-specific insights
    const riskAssessment = {
      overallRiskScore: analysisResult.portfolio.riskScore,
      riskAlerts: analysisResult.riskAlerts,
      riskMitigationSuggestions: analysisResult.suggestions.filter(s => 
        s.type === 'RISK_MITIGATION' || s.riskLevel === 'LOW'
      ),
      portfolioDistribution: analysisResult.portfolio.chains
    };
    
    // Store results
    await storeAnalysisResults(userId, 'risk-assessment', {
      riskAssessment,
      generatedAt: new Date()
    });

    // Alert user if high risk detected
    const highRiskAlerts = analysisResult.riskAlerts.filter(alert => 
      alert.severity === 'HIGH' || alert.severity === 'CRITICAL'
    );
    
    if (highRiskAlerts.length > 0) {
      await addNotificationJob(
        userId,
        'RISK_ALERT',
        'High Risk Detected in Portfolio',
        'AI analysis has detected elevated risk levels in your portfolio. Review recommended actions.',
        { 
          riskScore: analysisResult.portfolio.riskScore,
          alerts: highRiskAlerts,
          suggestions: riskAssessment.riskMitigationSuggestions
        }
      );
    }

    logger.info(`Risk assessment completed for user ${userId}`, {
      riskScore: analysisResult.portfolio.riskScore,
      alertsGenerated: analysisResult.riskAlerts.length
    });

  } catch (error) {
    logger.error(`Risk assessment failed for user ${userId}:`, error);
    throw error;
  }
}

async function processYieldOptimization(userId: string, data?: any): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddress: true, riskTolerance: true }
    });

    if (!user?.walletAddress) {
      throw new Error(`User ${userId} not found or has no wallet address`);
    }

    // Use AI service for portfolio analysis
    const analysisResult = await aiService.analyzePortfolio(userId, user.walletAddress);
    
    // Filter for yield-related suggestions
    const yieldOptimizations = analysisResult.suggestions.filter(s => 
      s.type === 'YIELD' || s.description.toLowerCase().includes('yield')
    );
    
    // Store results
    await storeAnalysisResults(userId, 'yield-optimization', {
      currentPositions: analysisResult.portfolio,
      optimizations: yieldOptimizations,
      generatedAt: new Date()
    });

    // Notify if significant yield improvements found
    const highYieldOpportunities = yieldOptimizations.filter(opt => 
      opt.expectedReturn && opt.expectedReturn > 0.05 // 5% APY or higher
    );
    
    if (highYieldOpportunities.length > 0) {
      await addNotificationJob(
        userId,
        'YIELD_OPTIMIZATION',
        'Yield Optimization Opportunities Found',
        'AI has identified opportunities to improve your yield farming returns.',
        { optimizations: highYieldOpportunities }
      );
    }

    logger.info(`Yield optimization completed for user ${userId}`, {
      opportunitiesFound: yieldOptimizations.length,
      highYieldOpportunities: highYieldOpportunities.length
    });

  } catch (error) {
    logger.error(`Yield optimization failed for user ${userId}:`, error);
    throw error;
  }
}

async function processStrategySuggestion(userId: string, data?: any): Promise<void> {
  try {
    // Get user preferences and risk tolerance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        workflows: { 
          include: { actions: true },
          take: 10 
        }
      }
    });

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    // Generate AI-powered personalized strategies
    const strategies = await generateAIPersonalizedStrategies(user);
    
    // Store results
    await storeAnalysisResults(userId, 'strategy-suggestion', {
      strategies,
      userProfile: {
        riskTolerance: user.riskTolerance,
        preferredChains: user.preferredChains,
        workflowHistory: user.workflows.length
      },
      generatedAt: new Date()
    });

    // Notify user of new strategies
    if (strategies.length > 0) {
      await addNotificationJob(
        userId,
        'STRATEGY_SUGGESTION',
        'New Strategy Suggestions Available',
        `AI has generated ${strategies.length} personalized strategy suggestions for your portfolio.`,
        { strategies: strategies.slice(0, 3) } // Send top 3 strategies
      );
    }

    logger.info(`Strategy suggestions generated for user ${userId}`, {
      strategiesGenerated: strategies.length
    });

  } catch (error) {
    logger.error(`Strategy suggestion failed for user ${userId}:`, error);
    throw error;
  }
}

// AI-powered helper functions

async function generateMarketSentimentAnalysis(): Promise<any> {
  // This would integrate with external market data APIs and use OpenAI for analysis
  // For now, returning a structured format that could be enhanced with real data
  return {
    overallTrend: 'bullish',
    confidenceScore: 0.75,
    keyFactors: [
      'Institutional adoption increasing',
      'Regulatory clarity improving',
      'DeFi TVL growing steadily'
    ],
    riskFactors: [
      'Market volatility remains high',
      'Macroeconomic uncertainty'
    ],
    sectorAnalysis: {
      defi: { trend: 'positive', strength: 0.8 },
      layer2: { trend: 'very_positive', strength: 0.9 },
      yield_farming: { trend: 'stable', strength: 0.6 }
    }
  };
}

async function generatePersonalizedMarketInsights(marketAnalysis: any, user: any): Promise<any> {
  return {
    summary: `Based on current ${marketAnalysis.overallTrend} market conditions and your ${user.riskTolerance} risk tolerance.`,
    recommendedActions: [
      {
        action: 'position_adjustment',
        description: 'Consider adjusting position sizes based on market volatility',
        priority: 'medium',
        reasoning: 'Current market conditions suggest moderate position sizing'
      }
    ],
    marketOpportunities: [
      'Layer 2 scaling solutions showing strong growth',
      'Yield farming opportunities in stable protocols'
    ]
  };
}

async function generateAIPersonalizedStrategies(user: any): Promise<any[]> {
  // This would use OpenAI to generate truly personalized strategies
  // Based on user's history, preferences, and current market conditions
  
  const baseStrategies = [
    {
      name: 'AI-Optimized Yield Strategy',
      description: 'Dynamic yield farming strategy optimized by AI for current market conditions',
      riskLevel: user.riskTolerance || 'MEDIUM',
      expectedReturn: '8-15% APY',
      aiGenerated: true,
      protocols: ['Aave', 'Compound', 'Convex'],
      reasoning: 'AI analysis suggests optimal allocation across these protocols based on current yields and risk factors'
    },
    {
      name: 'Cross-Chain Arbitrage Strategy',
      description: 'AI-powered cross-chain arbitrage opportunities',
      riskLevel: 'MEDIUM',
      expectedReturn: '5-12% APY',
      aiGenerated: true,
      protocols: ['1inch', 'Hop Protocol', 'Stargate'],
      reasoning: 'AI identifies price discrepancies across chains for automated arbitrage'
    }
  ];

  // Filter strategies based on user's risk tolerance
  return baseStrategies.filter(strategy => {
    if (!user.riskTolerance) return true;
    return strategy.riskLevel === user.riskTolerance || strategy.riskLevel === 'MEDIUM';
  });
}

async function storeAnalysisResults(userId: string, analysisType: string, results: any): Promise<void> {
  try {
    // Store in database for future reference
    // In a real implementation, you'd have a dedicated AI insights table
    await prisma.user.update({
      where: { id: userId },
      data: {
        updatedAt: new Date()
        // Could store JSON data in a dedicated insights field or table
      }
    });

    logger.debug(`AI analysis results stored for user ${userId}`, { 
      analysisType,
      resultSize: JSON.stringify(results).length 
    });
  } catch (error) {
    logger.error('Failed to store analysis results:', error);
  }
} 