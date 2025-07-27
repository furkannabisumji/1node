import OpenAI from 'openai';
import { config } from '../config/index.js';
import { logger } from '../config/logger.js';
import { oneInchService } from './oneInchService.js';
import { prisma } from '../config/database.js';

interface PortfolioData {
  userId: string;
  walletAddress: string;
  chains: ChainBalance[];
  totalValue: number;
  riskScore: number;
}

interface ChainBalance {
  chainId: number;
  chainName: string;
  tokens: TokenBalance[];
  totalValue: number;
}

interface TokenBalance {
  address: string;
  symbol: string;
  balance: string;
  valueUSD: number;
  priceUSD: number;
  change24h: number;
}

interface AISuggestion {
  id: string;
  type: 'REBALANCE' | 'YIELD' | 'RISK_MITIGATION' | 'ARBITRAGE' | 'COST_OPTIMIZATION';
  title: string;
  description: string;
  confidence: number;
  expectedReturn?: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  actions: SuggestedAction[];
  reasoning: string;
}

interface SuggestedAction {
  type: string;
  description: string;
  chainId: number;
  estimatedGas?: string;
  priority: number;
}

interface RiskAlert {
  id: string;
  type: 'PRICE_DROP' | 'LIQUIDATION_RISK' | 'HIGH_VOLATILITY' | 'CONCENTRATION_RISK';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  suggestedActions: string[];
  affectedTokens: string[];
}

class AIService {
  private openai: OpenAI | null = null;
  private model: any;

  constructor() {
    if (config.openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: config.openaiApiKey,
      });
    }
    this.initializeModel();
  }

  private async initializeModel(): Promise<void> {
    try {
      // For now, we'll use a simple neural network for risk scoring
      // In production, you'd load a pre-trained model
      this.model = null;

      this.model.compile({
        optimizer: 'adam',
        loss: 'binaryCrossentropy',
        metrics: ['accuracy'],
      });

      logger.info('AI model initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize AI model:', error);
    }
  }

  /**
   * Analyze user's portfolio and provide comprehensive insights
   */
  async analyzePortfolio(userId: string, walletAddress: string): Promise<{
    portfolio: PortfolioData;
    suggestions: AISuggestion[];
    riskAlerts: RiskAlert[];
  }> {
    try {
      logger.info(`Starting portfolio analysis for user: ${userId}`);

      // Fetch portfolio data across multiple chains
      const portfolio = await this.fetchPortfolioData(userId, walletAddress);
      
      // Generate AI-powered suggestions
      const suggestions = await this.generateSuggestions(portfolio);
      
      // Analyze risks
      const riskAlerts = await this.analyzeRisks(portfolio);

      logger.info(`Portfolio analysis completed for user: ${userId}`, {
        totalValue: portfolio.totalValue,
        riskScore: portfolio.riskScore,
        suggestionsCount: suggestions.length,
        riskAlertsCount: riskAlerts.length,
      });

      return {
        portfolio,
        suggestions,
        riskAlerts,
      };
    } catch (error) {
      logger.error('Portfolio analysis failed:', error);
      throw new Error(`Portfolio analysis failed: ${error}`);
    }
  }

  /**
   * Fetch portfolio data across multiple chains
   */
  private async fetchPortfolioData(userId: string, walletAddress: string): Promise<PortfolioData> {
    const chains = [1, 137, 42161, 56]; // Ethereum, Polygon, Arbitrum, BSC
    const chainData: ChainBalance[] = [];
    let totalValue = 0;

    for (const chainId of chains) {
      try {
        // Get supported tokens for this chain
        const tokens = await oneInchService.getTokens(chainId);
        const tokenAddresses = Object.keys(tokens).slice(0, 20); // Limit to top 20 tokens

        // Get wallet balances
        const balances = await oneInchService.getWalletBalances(chainId, walletAddress, tokenAddresses);
        
        // Get token prices
        const prices = await oneInchService.getTokenPrices(chainId, tokenAddresses);

        const tokenBalances: TokenBalance[] = [];
        let chainValue = 0;

        for (const [address, balance] of Object.entries(balances)) {
          if (parseFloat(balance) > 0) {
            const token = tokens[address];
            const priceUSD = parseFloat(prices[address] || '0');
            const balanceNumber = parseFloat(balance) / Math.pow(10, token.decimals);
            const valueUSD = balanceNumber * priceUSD;

            tokenBalances.push({
              address,
              symbol: token.symbol,
              balance: balanceNumber.toString(),
              valueUSD,
              priceUSD,
              change24h: 0, // Would fetch from price API
            });

            chainValue += valueUSD;
          }
        }

        chainData.push({
          chainId,
          chainName: this.getChainName(chainId),
          tokens: tokenBalances,
          totalValue: chainValue,
        });

        totalValue += chainValue;
      } catch (error) {
        logger.warn(`Failed to fetch data for chain ${chainId}:`, error);
      }
    }

    // Calculate risk score using ML model
    const riskScore = await this.calculateRiskScore(chainData);

    return {
      userId,
      walletAddress,
      chains: chainData,
      totalValue,
      riskScore,
    };
  }

  /**
   * Generate AI-powered investment suggestions
   */
  private async generateSuggestions(portfolio: PortfolioData): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = [];

    try {
      // Concentration risk analysis
      const concentrationSuggestion = this.analyzeConcentration(portfolio);
      if (concentrationSuggestion) suggestions.push(concentrationSuggestion);

      // Yield optimization suggestions
      const yieldSuggestions = await this.analyzeYieldOpportunities(portfolio);
      suggestions.push(...yieldSuggestions);

      // Cross-chain arbitrage opportunities
      const arbitrageSuggestions = await this.findArbitrageOpportunities(portfolio);
      suggestions.push(...arbitrageSuggestions);

      // Use OpenAI for additional insights if available
      if (this.openai && portfolio.totalValue > 1000) {
        const aiSuggestions = await this.getOpenAISuggestions(portfolio);
        suggestions.push(...aiSuggestions);
      }

      // Sort by confidence score
      suggestions.sort((a, b) => b.confidence - a.confidence);

      return suggestions.slice(0, 10); // Return top 10 suggestions
    } catch (error) {
      logger.error('Failed to generate suggestions:', error);
      return [];
    }
  }

  /**
   * Analyze portfolio concentration risk
   */
  private analyzeConcentration(portfolio: PortfolioData): AISuggestion | null {
    const totalValue = portfolio.totalValue;
    if (totalValue < 100) return null;

    // Calculate token concentration
    const tokenValues = portfolio.chains
      .flatMap(chain => chain.tokens)
      .map(token => ({ symbol: token.symbol, value: token.valueUSD }))
      .sort((a, b) => b.value - a.value);

    const topTokenValue = tokenValues[0]?.value || 0;
    const concentrationRatio = topTokenValue / totalValue;

    if (concentrationRatio > 0.7) {
      return {
        id: `concentration-${Date.now()}`,
        type: 'REBALANCE',
        title: 'High Concentration Risk Detected',
        description: `${Math.round(concentrationRatio * 100)}% of your portfolio is in ${tokenValues[0].symbol}. Consider diversifying to reduce risk.`,
        confidence: 0.85,
        riskLevel: 'HIGH',
        actions: [
          {
            type: 'REBALANCE',
            description: `Swap some ${tokenValues[0].symbol} for stablecoins or other assets`,
            chainId: portfolio.chains[0].chainId,
            priority: 1,
          },
        ],
        reasoning: 'High concentration in a single asset increases portfolio volatility and risk.',
      };
    }

    return null;
  }

  /**
   * Analyze yield farming opportunities
   */
  private async analyzeYieldOpportunities(portfolio: PortfolioData): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = [];

    // Look for idle stablecoins
    const stablecoins = ['USDC', 'USDT', 'DAI', 'BUSD'];
    
    for (const chain of portfolio.chains) {
      const idleStables = chain.tokens.filter(
        token => stablecoins.includes(token.symbol) && token.valueUSD > 100
      );

      for (const stable of idleStables) {
        suggestions.push({
          id: `yield-${stable.symbol}-${chain.chainId}`,
          type: 'YIELD',
          title: `Optimize ${stable.symbol} on ${chain.chainName}`,
          description: `Your ${stable.balance} ${stable.symbol} could earn yield through lending or liquidity provision.`,
          confidence: 0.75,
          expectedReturn: 0.05, // 5% APY estimate
          riskLevel: 'LOW',
          actions: [
            {
              type: 'STAKE',
              description: `Stake ${stable.symbol} in a lending protocol`,
              chainId: chain.chainId,
              priority: 2,
            },
          ],
          reasoning: 'Idle stablecoins can earn yield with minimal risk through established DeFi protocols.',
        });
      }
    }

    return suggestions.slice(0, 3);
  }

  /**
   * Find cross-chain arbitrage opportunities
   */
  private async findArbitrageOpportunities(portfolio: PortfolioData): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = [];

    // Compare token prices across chains
    const commonTokens = ['ETH', 'USDC', 'USDT'];
    
    for (const token of commonTokens) {
      const tokenPrices: { chainId: number; price: number; balance: number }[] = [];

      for (const chain of portfolio.chains) {
        const tokenData = chain.tokens.find(t => t.symbol === token);
        if (tokenData && parseFloat(tokenData.balance) > 0.1) {
          tokenPrices.push({
            chainId: chain.chainId,
            price: tokenData.priceUSD,
            balance: parseFloat(tokenData.balance),
          });
        }
      }

      if (tokenPrices.length >= 2) {
        const sorted = tokenPrices.sort((a, b) => a.price - b.price);
        const priceDiff = (sorted[1].price - sorted[0].price) / sorted[0].price;

        if (priceDiff > 0.02) { // 2% price difference
          suggestions.push({
            id: `arbitrage-${token}-${Date.now()}`,
            type: 'ARBITRAGE',
            title: `${token} Arbitrage Opportunity`,
            description: `${token} is ${(priceDiff * 100).toFixed(2)}% cheaper on ${this.getChainName(sorted[0].chainId)} vs ${this.getChainName(sorted[1].chainId)}`,
            confidence: 0.6,
            expectedReturn: priceDiff - 0.005, // Minus fees
            riskLevel: 'MEDIUM',
            actions: [
              {
                type: 'CROSS_CHAIN_SWAP',
                description: `Move ${token} to take advantage of price difference`,
                chainId: sorted[0].chainId,
                priority: 3,
              },
            ],
            reasoning: 'Price discrepancies across chains can be profitable after accounting for gas and bridge fees.',
          });
        }
      }
    }

    return suggestions.slice(0, 2);
  }

  /**
   * Get additional suggestions from OpenAI
   */
  private async getOpenAISuggestions(portfolio: PortfolioData): Promise<AISuggestion[]> {
    if (!this.openai) return [];

    try {
      const prompt = this.createPortfolioPrompt(portfolio);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a DeFi investment advisor. Provide specific, actionable suggestions for portfolio optimization.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        return this.parseOpenAIResponse(response);
      }
    } catch (error) {
      logger.error('OpenAI API call failed:', error);
    }

    return [];
  }

  /**
   * Analyze portfolio risks
   */
  private async analyzeRisks(portfolio: PortfolioData): Promise<RiskAlert[]> {
    const alerts: RiskAlert[] = [];

    // High volatility assets
    for (const chain of portfolio.chains) {
      for (const token of chain.tokens) {
        if (Math.abs(token.change24h) > 0.15 && token.valueUSD > portfolio.totalValue * 0.1) {
          alerts.push({
            id: `volatility-${token.symbol}`,
            type: 'HIGH_VOLATILITY',
            severity: 'MEDIUM',
            title: `High Volatility: ${token.symbol}`,
            description: `${token.symbol} has moved ${(token.change24h * 100).toFixed(2)}% in 24h`,
            suggestedActions: ['Consider setting stop-loss orders', 'Reduce position size'],
            affectedTokens: [token.symbol],
          });
        }
      }
    }

    // Risk score based alerts
    if (portfolio.riskScore > 0.8) {
      alerts.push({
        id: 'high-risk-portfolio',
        type: 'CONCENTRATION_RISK',
        severity: 'HIGH',
        title: 'High Risk Portfolio Detected',
        description: 'Your portfolio has a high risk score. Consider diversifying across more assets.',
        suggestedActions: ['Increase stablecoin allocation', 'Spread investments across chains'],
        affectedTokens: [],
      });
    }

    return alerts;
  }

  /**
   * Calculate portfolio risk score using ML model
   */
  private async calculateRiskScore(chains: ChainBalance[]): Promise<number> {
    try {
      if (!this.model) return 0.5; // Default moderate risk

      // Prepare features for ML model
      const features = this.extractRiskFeatures(chains);

      return 0.5;
    } catch (error) {
      logger.error('Risk score calculation failed:', error);
      return 0.5;
    }
  }

  /**
   * Extract risk features for ML model
   */
  private extractRiskFeatures(chains: ChainBalance[]): number[] {
    const totalValue = chains.reduce((sum, chain) => sum + chain.totalValue, 0);
    const tokenCount = chains.reduce((sum, chain) => sum + chain.tokens.length, 0);
    
    // Calculate diversification metrics
    const chainConcentration = chains.length > 0 ? 
      Math.max(...chains.map(c => c.totalValue)) / totalValue : 1;
    
    const stablecoinRatio = chains.reduce((sum, chain) => {
      const stableValue = chain.tokens
        .filter(t => ['USDC', 'USDT', 'DAI'].includes(t.symbol))
        .reduce((s, t) => s + t.valueUSD, 0);
      return sum + stableValue;
    }, 0) / totalValue;

    return [
      totalValue / 10000, // Portfolio size (normalized)
      tokenCount / 50, // Token diversity (normalized)
      chainConcentration, // Chain concentration
      1 - stablecoinRatio, // Non-stablecoin ratio
      chains.length / 10, // Chain count (normalized)
      0.5, // Placeholder features
      0.5,
      0.5,
      0.5,
      0.5,
    ];
  }

  /**
   * Helper methods
   */
  private createPortfolioPrompt(portfolio: PortfolioData): string {
    const summary = portfolio.chains.map(chain => 
      `${chain.chainName}: $${chain.totalValue.toFixed(2)} across ${chain.tokens.length} tokens`
    ).join(', ');

    return `Portfolio Analysis:
- Total Value: $${portfolio.totalValue.toFixed(2)}
- Risk Score: ${(portfolio.riskScore * 100).toFixed(1)}%
- Distribution: ${summary}

Provide 2-3 specific DeFi optimization suggestions.`;
  }

  private parseOpenAIResponse(response: string): AISuggestion[] {
    // Parse OpenAI response into structured suggestions
    // This is a simplified implementation
    return [{
      id: `ai-suggestion-${Date.now()}`,
      type: 'REBALANCE',
      title: 'AI Recommendation',
      description: response.substring(0, 200),
      confidence: 0.7,
      riskLevel: 'MEDIUM',
      actions: [],
      reasoning: 'Generated by AI analysis',
    }];
  }

  private getChainName(chainId: number): string {
    const names: Record<number, string> = {
      1: 'Ethereum',
      137: 'Polygon',
      42161: 'Arbitrum',
      56: 'BNB Chain',
      10: 'Optimism',
    };
    return names[chainId] || `Chain ${chainId}`;
  }
}

export const aiService = new AIService(); 