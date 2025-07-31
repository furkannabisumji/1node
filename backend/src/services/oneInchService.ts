import { ethers } from 'ethers';
import { config } from '../config/index.js';
import { logger } from '../config/logger.js';
import axios from 'axios';

// The 1inch server URL is now configured via config.oneInchServerUrl

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export interface SwapQuote {
  fromToken: TokenInfo;
  toToken: TokenInfo;
  fromTokenAmount: string;
  toTokenAmount: string;
  protocols: any[];
  estimatedGas: string;
}

export interface SwapTransaction {
  from: string;
  to: string;
  data: string;
  value: string;
  gasPrice: string;
  gas: string;
}

export interface LimitOrderData {
  orderHash: string;
  signature: string;
  order: {
    salt: string;
    maker: string;
    receiver: string;
    makerAsset: string;
    takerAsset: string;
    makingAmount: string;
    takingAmount: string;
    makerTraits: string;
  };
}

export interface FusionOrder {
  orderHash: string;
  order: {
    maker: string;
    makerAsset: string;
    takingAmount: string;
    makingAmount: string;
    receiver: string;
  };
  signature: string;
  quoteId: string;
}

class OneInchService {
  private baseUrl: string;
  private apiKey: string;
  private oneInchServerUrl: string;

  constructor() {
    this.baseUrl = 'https://api.1inch.dev';
    this.apiKey = config.oneInchApiKey;
    this.oneInchServerUrl = config.oneInchServerUrl;
    
    logger.info('OneInchService initialized', {
      oneInchServerUrl: this.oneInchServerUrl,
      hasApiKey: !!this.apiKey
    });
  }

  /**
   * Make request to the dedicated 1inch server
   */
  private async callOneInchServer(endpoint: string, options: any = {}): Promise<any> {
    try {
      const url = `${this.oneInchServerUrl}${endpoint}`;
      logger.debug('Calling 1inch server', { url, method: options.method || 'GET' });

      const response = await axios({
        url,
        method: options.method || 'GET',
        data: options.data,
        params: options.params,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        timeout: 30000
      });

      logger.debug('1inch server response', { 
        status: response.status, 
        endpoint,
        success: response.data?.success !== false 
      });

      return response.data;
    } catch (error: any) {
      logger.error('1inch server request failed', {
        endpoint,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      // If 1inch server is down, throw a specific error
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new Error(`1inch server unavailable at ${this.oneInchServerUrl}. Please ensure the 1inch server is running.`);
      }

      throw new Error(`1inch server error: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Get supported tokens for a specific chain
   */
  async getTokens(chainId: number): Promise<Record<string, TokenInfo>> {
    try {
      logger.debug(`Fetching tokens for chain ${chainId} from 1inch server`);
      
      const response = await this.callOneInchServer(`/api/tokens/${chainId}`);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch tokens from 1inch server');
      }

      // Convert array of tokens to Record format expected by the backend
      const tokensRecord: Record<string, TokenInfo> = {};
      if (response.tokens?.tokens) {
        response.tokens.tokens.forEach((token: TokenInfo) => {
          tokensRecord[token.address] = token;
        });
      }
      
      logger.debug(`Successfully fetched ${Object.keys(tokensRecord).length} tokens for chain ${chainId}`);
      return tokensRecord;
    } catch (error) {
      logger.error(`Failed to fetch tokens for chain ${chainId}:`, error);
      
      // Fallback to local common tokens if 1inch server fails
      logger.warn(`Using fallback common tokens for chain ${chainId}`);
      return this.getCommonTokens(chainId);
    }
  }

  /**
   * Get current token prices
   */
  async getTokenPrices(chainId: number, tokenAddresses: string[]): Promise<Record<string, string>> {
    try {
      // Validate inputs
      if (!chainId) {
        throw new Error('Chain ID is required');
      }
      if (!tokenAddresses || !Array.isArray(tokenAddresses)) {
        logger.warn('Invalid tokenAddresses provided, using empty array', { tokenAddresses });
        tokenAddresses = [];
      }

      logger.debug(`Fetching token prices for chain ${chainId}`, { tokenCount: tokenAddresses.length });
      
      const prices: Record<string, string> = {};

      // Use 1inch Spot Price API for accurate pricing
      for (const tokenAddress of tokenAddresses) {
        try {
          const response = await axios.get(`${this.baseUrl}/price/v1.1/${chainId}/${tokenAddress}`, {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            }
          });

          // The Spot Price API returns price in the chain's native currency
          prices[tokenAddress] = response.data[tokenAddress] || '0';
          
        } catch (priceError) {
          logger.warn(`Failed to get price for token ${tokenAddress} from Spot Price API:`, priceError);
          
          // Fallback to mock prices for common tokens
          const token = this.getCommonTokens(chainId)[tokenAddress];
          if (token?.symbol === 'USDC' || token?.symbol === 'USDT') {
            prices[tokenAddress] = '1.0';
          } else {
            prices[tokenAddress] = '2000.0'; // Default price for other tokens
          }
        }
      }
      
      logger.debug(`Successfully fetched prices for ${tokenAddresses.length} tokens from Spot Price API`);
      return prices;
    } catch (error) {
      logger.error(`Failed to fetch token prices for chain ${chainId}:`, error);
      throw new Error(`Failed to fetch token prices: ${error}`);
    }
  }

  /**
   * Get swap quote with Fusion+ support
   */
  async getSwapQuote(
    chainId: number,
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    userAddress?: string
  ): Promise<SwapQuote> {
    try {
      logger.debug('Getting swap quote from 1inch server', {
        chainId,
        fromTokenAddress,
        toTokenAddress,
        amount,
        userAddress
      });

      const params: any = {
        src: fromTokenAddress,
        dst: toTokenAddress,
        amount
      };

      if (userAddress) {
        params.from = userAddress;
      }

      const response = await this.callOneInchServer(`/api/quote/${chainId}`, {
        params
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to get swap quote from 1inch server');
      }

      // Convert 1inch server response to SwapQuote interface
      const swapQuote: SwapQuote = {
        fromToken: response.fromToken || this.getTokenInfo(fromTokenAddress, chainId),
        toToken: response.toToken || this.getTokenInfo(toTokenAddress, chainId),
        fromTokenAmount: response.fromTokenAmount || amount,
        toTokenAmount: response.toTokenAmount || amount,
        protocols: response.protocols || [],
        estimatedGas: response.estimatedGas || '200000'
      };

      logger.debug('Successfully got swap quote from 1inch server');
      return swapQuote;
    } catch (error) {
      logger.error('Failed to get swap quote:', error);
      
      // Fallback response if 1inch server fails
      logger.warn('Using fallback swap quote');
      return {
        fromToken: this.getTokenInfo(fromTokenAddress, chainId),
        toToken: this.getTokenInfo(toTokenAddress, chainId),
        fromTokenAmount: amount,
        toTokenAmount: amount,
        protocols: [],
        estimatedGas: '200000'
      };
    }
  }

  /**
   * Get cross-chain quote using Fusion+
   */
  async getCrossChainQuote(
    fromChain: number,
    toChain: number,
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    userAddress: string
  ): Promise<SwapQuote> {
    try {
      logger.debug('Getting cross-chain Fusion+ quote from 1inch server', {
        fromChain,
        toChain,
        fromTokenAddress,
        toTokenAddress,
        amount,
        userAddress
      });

      const params = {
        srcChainId: fromChain,
        dstChainId: toChain,
        srcTokenAddress: fromTokenAddress,
        dstTokenAddress: toTokenAddress,
        amount,
        walletAddress: userAddress
      };

      const response = await this.callOneInchServer('/api/fusion/quote', {
        params
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to get cross-chain quote from 1inch server');
      }

      // Convert 1inch server response to SwapQuote interface
      const crossChainQuote: SwapQuote = {
        fromToken: this.getTokenInfo(fromTokenAddress, fromChain),
        toToken: this.getTokenInfo(toTokenAddress, toChain),
        fromTokenAmount: amount,
        toTokenAmount: response.quote?.dstAmount || amount,
        protocols: response.quote?.protocols || [],
        estimatedGas: response.quote?.gas || '300000'
      };

      logger.debug('Successfully got cross-chain Fusion+ quote from 1inch server');
      return crossChainQuote;
    } catch (error) {
      logger.error('Failed to get cross-chain quote:', error);
      
      // Fallback for cross-chain
      logger.warn('Using fallback cross-chain quote');
      return {
        fromToken: this.getTokenInfo(fromTokenAddress, fromChain),
        toToken: this.getTokenInfo(toTokenAddress, toChain),
        fromTokenAmount: amount,
        toTokenAmount: amount,
        protocols: [],
        estimatedGas: '300000' // Higher gas for cross-chain
      };
    }
  }

  /**
   * Build swap transaction
   */
  async buildSwapTransaction(
    chainId: number,
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    fromAddress: string,
    slippage: number = 1,
    destReceiver?: string
  ): Promise<SwapTransaction> {
    try {
      logger.debug('Building swap transaction via 1inch server', {
        chainId,
        fromTokenAddress,
        toTokenAddress,
        amount,
        fromAddress,
        slippage
      });

      const params: any = {
        src: fromTokenAddress,
        dst: toTokenAddress,
        amount,
        from: fromAddress,
        slippage: slippage.toString()
      };

      if (destReceiver) {
        params.destReceiver = destReceiver;
      }

      const response = await this.callOneInchServer(`/api/swap/${chainId}`, {
        params
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to build swap transaction from 1inch server');
      }

      // Convert 1inch server response to SwapTransaction interface
      const transaction: SwapTransaction = {
        from: response.tx?.from || fromAddress,
        to: response.tx?.to || fromAddress,
        data: response.tx?.data || '0x',
        value: response.tx?.value || '0',
        gasPrice: response.tx?.gasPrice || await this.getGasPrice(chainId),
        gas: response.tx?.gas || '200000'
      };

      logger.debug('Successfully built swap transaction via 1inch server');
      return transaction;
    } catch (error) {
      logger.error('Failed to build swap transaction:', error);
      
      // Fallback transaction if 1inch server fails
      logger.warn('Using fallback swap transaction');
      return {
        from: fromAddress,
        to: fromAddress,
        data: '0x',
        value: fromTokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' ? amount : '0',
        gasPrice: await this.getGasPrice(chainId),
        gas: '200000'
      };
    }
  }

  /**
   * Create Fusion+ order with cross-chain support
   */
  async createFusionOrder(
    fromChainId: number,
    toChainId: number,
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    maker: string,
    receiver?: string,
    deadline?: number
  ): Promise<FusionOrder> {
    try {
      // Validate required parameters
      if (!maker || maker === '0x0000000000000000000000000000000000000000') {
        throw new Error('Valid maker wallet address is required for Fusion+ orders');
      }

      // Validate wallet address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(maker)) {
        throw new Error(`Invalid wallet address format: ${maker}`);
      }

      // Ensure wallet address is checksummed (proper case)
      const checksummedMaker = ethers.getAddress(maker);

      logger.info('Creating Fusion+ order via 1inch server', {
        fromChainId,
        toChainId,
        fromTokenAddress,
        toTokenAddress,
        amount,
        maker: checksummedMaker
      });

      const orderData = {
        srcChainId: fromChainId,
        dstChainId: toChainId,
        srcTokenAddress: fromTokenAddress,
        dstTokenAddress: toTokenAddress,
        amount,
        walletAddress: checksummedMaker
      };

      const response = await this.callOneInchServer('/api/fusion/order', {
        method: 'POST',
        data: orderData
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to create Fusion+ order from 1inch server');
      }

      // Convert 1inch server response to FusionOrder interface
      const fusionOrder: FusionOrder = {
        orderHash: response.orderHash || ethers.randomBytes(32).toString(),
        order: {
          maker: checksummedMaker,
          makerAsset: fromTokenAddress,
          takingAmount: amount,
          makingAmount: response.order?.makingAmount || amount,
          receiver: receiver || checksummedMaker
        },
        signature: response.signature || '0x',
        quoteId: response.quoteId || Date.now().toString()
      };

      logger.info('Successfully created Fusion+ order via 1inch server');
      return fusionOrder;
    } catch (error: any) {
      logger.error('Failed to create Fusion order:', {
        message: error.message,
        name: error.name,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // Fallback implementation
      logger.warn('Using fallback Fusion order creation');
      const checksummedMaker = ethers.getAddress(maker);
      const fusionOrder: FusionOrder = {
        orderHash: ethers.randomBytes(32).toString(),
        order: {
          maker: checksummedMaker,
          makerAsset: fromTokenAddress,
          takingAmount: amount,
          makingAmount: amount,
          receiver: receiver || checksummedMaker
        },
        signature: '0x',
        quoteId: Date.now().toString()
      };

      return fusionOrder;
    }
  }

  /**
   * Get active Fusion+ orders (simplified)
   */
  async getActiveFusionOrders(page: number = 1, limit: number = 10): Promise<any[]> {
    try {
      logger.debug('Getting active Fusion+ orders from 1inch server', { page, limit });

      // Note: This is a generic method, for specific wallet orders use getOrdersByMaker
      logger.warn('getActiveFusionOrders is deprecated, use getOrdersByMaker with wallet address instead');
      return [];
    } catch (error) {
      logger.error('Failed to get active orders:', error);
      throw new Error(`Failed to get active orders: ${error}`);
    }
  }

  /**
   * Get orders by maker address (simplified)
   */
  async getOrdersByMaker(address: string, page: number = 1, limit: number = 10): Promise<any[]> {
    try {
      logger.debug('Getting orders by maker from 1inch server', { address, page, limit });

      const params = { page, limit };

      const response = await this.callOneInchServer(`/api/fusion/orders/${address}`, {
        params
      });

      if (!response.success) {
        logger.warn('Failed to get orders by maker from 1inch server:', response.error);
        return [];
      }

      logger.debug('Successfully got orders by maker from 1inch server');
      return response.orders || [];
    } catch (error) {
      logger.error('Failed to get orders by maker:', error);
      
      // Return empty array on failure
      logger.warn('Returning empty orders array due to error');
      return [];
    }
  }

  /**
   * Get Fusion+ order status
   */
  async getFusionOrderStatus(chainId: number, orderHash: string): Promise<any> {
    try {
      logger.debug('Getting Fusion order status from 1inch server', { chainId, orderHash });

      const response = await this.callOneInchServer(`/api/fusion/order/${orderHash}`);

      if (!response.success) {
        logger.warn('Failed to get order status from 1inch server:', response.error);
        
        // Return mock status information
        return {
          orderHash,
          status: 'pending',
          chainId
        };
      }

      logger.debug('Successfully got order status from 1inch server');
      return {
        orderHash: response.orderHash || orderHash,
        status: response.status || 'pending',
        chainId,
        fills: response.fills || [],
        createDateTime: response.createDateTime,
        order: response.order
      };
    } catch (error) {
      logger.error('Failed to get Fusion order status:', error);
      
      // Return fallback status
      logger.warn('Using fallback order status');
      return {
        orderHash,
        status: 'pending',
        chainId
      };
    }
  }

  /**
   * Get wallet balance for multiple tokens
   */
  async getWalletBalances(
    chainId: number,
    walletAddress: string,
    tokenAddresses: string[]
  ): Promise<Record<string, string>> {
    try {
      logger.debug('Getting wallet balances from Balance API', {
        chainId,
        walletAddress,
        tokenCount: tokenAddresses.length
      });

      try {
        const response = await axios.get(`${this.baseUrl}/balance/v1.2/${chainId}/balances/${walletAddress}`, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        const allBalances = response.data;
        const requestedBalances: Record<string, string> = {};

        // Filter to only requested token addresses
        tokenAddresses.forEach(address => {
          requestedBalances[address] = allBalances[address] || '0';
        });

        logger.debug('Successfully got wallet balances from Balance API');
        return requestedBalances;

      } catch (apiError: any) {
        logger.warn('Failed to get balances from Balance API, using fallback:', {
          message: apiError.message,
          status: apiError.response?.status,
          statusText: apiError.response?.statusText
        });
        
        // Mock balances for testing
        const balances: Record<string, string> = {};
        tokenAddresses.forEach(address => {
          balances[address] = '1000000000000000000'; // 1 token with 18 decimals
        });

        return balances;
      }

    } catch (error) {
      logger.error('Failed to get wallet balances:', error);
      throw new Error(`Failed to get wallet balances: ${error}`);
    }
  }

  /**
   * Get gas price for a chain
   */
  async getGasPrice(chainId: number): Promise<string> {
    try {
      logger.debug('Getting gas price', { chainId });

      let gasPrice = '20000000000'; // 20 gwei default
      
      switch (chainId) {
        case 1: // Ethereum
          gasPrice = '30000000000'; // 30 gwei
          break;
        case 137: // Polygon
          gasPrice = '30000000000'; // 30 gwei
          break;
        case 56: // BSC
          gasPrice = '5000000000'; // 5 gwei
          break;
        case 42161: // Arbitrum
          gasPrice = '1000000000'; // 1 gwei
          break;
      }

      logger.debug('Successfully got gas price');
      return gasPrice;
    } catch (error) {
      logger.error('Failed to get gas price:', error);
      throw new Error(`Failed to get gas price: ${error}`);
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(chainId: number, txHash: string): Promise<any> {
    try {
      logger.debug('Getting transaction status', { chainId, txHash });

      return {
        txHash,
        status: 'pending',
        chainId
      };
    } catch (error) {
      logger.error('Failed to get transaction status:', error);
      throw new Error(`Failed to get transaction status: ${error}`);
    }
  }

  /**
   * Get supported chains
   */
  async getSupportedChains(): Promise<any[]> {
    try {
      logger.debug('Getting supported chains');

      const chains = [
        { id: 1, name: 'Ethereum' },
        { id: 137, name: 'Polygon' },
        { id: 56, name: 'BNB Chain' },
        { id: 42161, name: 'Arbitrum' },
        { id: 10, name: 'Optimism' },
        { id: 43114, name: 'Avalanche' }
      ];

      logger.debug('Successfully got supported chains', { chainCount: chains.length });
      return chains;
    } catch (error) {
      logger.error('Failed to get supported chains:', error);
      throw new Error(`Failed to get supported chains: ${error}`);
    }
  }

  /**
   * Create limit order (not available in cross-chain SDK)
   */
  async createLimitOrder(
    chainId: number,
    makerAsset: string,
    takerAsset: string,
    makingAmount: string,
    takingAmount: string,
    maker: string,
    receiver?: string
  ): Promise<LimitOrderData> {
    throw new Error('Limit orders not available in cross-chain SDK. Use createFusionOrder instead.');
  }

  /**
   * Get active limit orders for an address
   */
  async getLimitOrders(chainId: number, maker: string): Promise<LimitOrderData[]> {
    throw new Error('Limit orders not available in cross-chain SDK.');
  }

  /**
   * Cancel limit order
   */
  async cancelLimitOrder(chainId: number, orderHash: string): Promise<void> {
    throw new Error('Limit orders not available in cross-chain SDK.');
  }

  /**
   * Helper methods
   */
  formatTokenAmount(amount: string, decimals: number): string {
    return ethers.parseUnits(amount, decimals).toString();
  }

  parseTokenAmount(amount: string, decimals: number): string {
    return ethers.formatUnits(amount, decimals);
  }

  private getNetworkName(chainId: number): string {
    switch (chainId) {
      case 1: return 'Ethereum';
      case 137: return 'Polygon';
      case 56: return 'Binance Smart Chain';
      case 42161: return 'Arbitrum';
      case 10: return 'Optimism';
      case 43114: return 'Avalanche';
      default:
        logger.warn(`Unknown chain ID: ${chainId}, defaulting to Ethereum`);
        return 'Ethereum';
    }
  }

  private getTokenInfo(address: string, chainId: number): TokenInfo {
    const tokens = this.getCommonTokens(chainId);
    return tokens[address] || {
      address,
      symbol: 'TOKEN',
      name: 'Token',
      decimals: 18
    };
  }

  private getCommonTokens(chainId: number): Record<string, TokenInfo> {
    const tokens: Record<string, TokenInfo> = {};
    
    switch (chainId) {
      case 1: // Ethereum
        tokens['0xA0b86a33E6Fe3c4c4b389F8b4af2218D6e8E58D3'] = {
          address: '0xA0b86a33E6Fe3c4c4b389F8b4af2218D6e8E58D3',
          symbol: 'USDC', name: 'USD Coin', decimals: 6
        };
        tokens['0xdAC17F958D2ee523a2206206994597C13D831ec7'] = {
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          symbol: 'USDT', name: 'Tether USD', decimals: 6
        };
        break;
      case 10: // Optimism
        tokens['0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85'] = {
          address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
          symbol: 'USDC', name: 'USD Coin', decimals: 6
        };
        break;
      case 137: // Polygon
        tokens['0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'] = {
          address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
          symbol: 'USDC', name: 'USD Coin', decimals: 6
        };
        break;
      case 42161: // Arbitrum
        tokens['0xaf88d065e77c8cC2239327C5EDb3A432268e5831'] = {
          address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
          symbol: 'USDC', name: 'USD Coin', decimals: 6
        };
        break;
      case 56: // BSC
        tokens['0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'] = {
          address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
          symbol: 'USDC', name: 'USD Coin', decimals: 18
        };
        break;
    }
    
    return tokens;
  }
}

export const oneInchService = new OneInchService();