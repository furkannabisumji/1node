import axios, { AxiosInstance } from 'axios';
import { ethers } from 'ethers';
import { config } from '../config/index.js';
import { logger } from '../config/logger.js';

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
  private api: AxiosInstance;
  private readonly baseURL: string;

  constructor() {
    this.baseURL = config.oneInchBaseUrl;
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${config.oneInchApiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Request/Response interceptors for logging
    this.api.interceptors.request.use(
      (config) => {
        logger.debug(`1inch API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          params: config.params,
          data: config.data,
        });
        return config;
      },
      (error) => {
        logger.error('1inch API Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => {
        logger.debug(`1inch API Response: ${response.status}`, {
          url: response.config.url,
          data: response.data,
        });
        return response;
      },
      (error) => {
        logger.error('1inch API Response Error:', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          url: error.config?.url,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get supported tokens for a specific chain
   */
  async getTokens(chainId: number): Promise<Record<string, TokenInfo>> {
    try {
      const response = await this.api.get(`/swap/v6.0/${chainId}/tokens`);
      return response.data.tokens;
    } catch (error) {
      logger.error(`Failed to fetch tokens for chain ${chainId}:`, error);
      throw new Error(`Failed to fetch tokens: ${error}`);
    }
  }

  /**
   * Get current token prices
   */
  async getTokenPrices(chainId: number, tokenAddresses: string[]): Promise<Record<string, string>> {
    try {
      const addresses = tokenAddresses.join(',');
      const response = await this.api.get(`/price/v1.1/${chainId}`, {
        params: { tokens: addresses },
      });
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch token prices for chain ${chainId}:`, error);
      throw new Error(`Failed to fetch token prices: ${error}`);
    }
  }

  /**
   * Get swap quote
   */
  async getSwapQuote(
    chainId: number,
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    userAddress?: string
  ): Promise<SwapQuote> {
    try {
      const params: any = {
        src: fromTokenAddress,
        dst: toTokenAddress,
        amount,
      };

      if (userAddress) {
        params.from = userAddress;
      }

      const response = await this.api.get(`/swap/v6.0/${chainId}/quote`, { params });
      return response.data;
    } catch (error) {
      logger.error('Failed to get swap quote:', error);
      throw new Error(`Failed to get swap quote: ${error}`);
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
      const params: any = {
        src: fromTokenAddress,
        dst: toTokenAddress,
        amount,
        from: fromAddress,
        slippage,
        disableEstimate: true,
        allowPartialFill: false,
      };

      if (destReceiver) {
        params.destReceiver = destReceiver;
      }

      const response = await this.api.get(`/swap/v6.0/${chainId}/swap`, { params });
      return response.data.tx;
    } catch (error) {
      logger.error('Failed to build swap transaction:', error);
      throw new Error(`Failed to build swap transaction: ${error}`);
    }
  }

  /**
   * Create limit order
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
    try {
      const orderData = {
        makerAsset,
        takerAsset,
        makingAmount,
        takingAmount,
        maker,
        receiver: receiver || maker,
      };

      const response = await this.api.post(`/orderbook/v4.0/${chainId}/order`, orderData);
      return response.data;
    } catch (error) {
      logger.error('Failed to create limit order:', error);
      throw new Error(`Failed to create limit order: ${error}`);
    }
  }

  /**
   * Get active limit orders for an address
   */
  async getLimitOrders(chainId: number, maker: string): Promise<LimitOrderData[]> {
    try {
      const response = await this.api.get(`/orderbook/v4.0/${chainId}/orders`, {
        params: { maker },
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to get limit orders:', error);
      throw new Error(`Failed to get limit orders: ${error}`);
    }
  }

  /**
   * Cancel limit order
   */
  async cancelLimitOrder(chainId: number, orderHash: string): Promise<void> {
    try {
      await this.api.delete(`/orderbook/v4.0/${chainId}/order/${orderHash}`);
      logger.info(`Limit order cancelled: ${orderHash}`);
    } catch (error) {
      logger.error('Failed to cancel limit order:', error);
      throw new Error(`Failed to cancel limit order: ${error}`);
    }
  }

  /**
   * Create Fusion+ order (cross-chain)
   */
  async createFusionOrder(
    chainId: number,
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    maker: string,
    receiver?: string,
    deadline?: number
  ): Promise<FusionOrder> {
    try {
      const orderData = {
        makerAsset: fromTokenAddress,
        takerAsset: toTokenAddress,
        makingAmount: amount,
        maker,
        receiver: receiver || maker,
        deadline: deadline || Math.floor(Date.now() / 1000) + 3600, // 1 hour default
      };

      const response = await this.api.post(`/fusion/v1.0/${chainId}/order`, orderData);
      return response.data;
    } catch (error) {
      logger.error('Failed to create Fusion order:', error);
      throw new Error(`Failed to create Fusion order: ${error}`);
    }
  }

  /**
   * Get Fusion+ order status
   */
  async getFusionOrderStatus(chainId: number, orderHash: string): Promise<any> {
    try {
      const response = await this.api.get(`/fusion/v1.0/${chainId}/order/${orderHash}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get Fusion order status:', error);
      throw new Error(`Failed to get Fusion order status: ${error}`);
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
      const addresses = tokenAddresses.join(',');
      const response = await this.api.get(`/balance/v1.2/${chainId}/${walletAddress}`, {
        params: { tokens: addresses },
      });
      return response.data;
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
      const response = await this.api.get(`/gas-price/v1.4/${chainId}`);
      return response.data.gasPrice;
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
      const response = await this.api.get(`/tx-gateway/v1.1/${chainId}/status/${txHash}`);
      return response.data;
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
      const response = await this.api.get('/swap/v6.0/1/chains');
      return response.data;
    } catch (error) {
      logger.error('Failed to get supported chains:', error);
      throw new Error(`Failed to get supported chains: ${error}`);
    }
  }

  /**
   * Helper method to format token amount with decimals
   */
  formatTokenAmount(amount: string, decimals: number): string {
    return ethers.parseUnits(amount, decimals).toString();
  }

  /**
   * Helper method to parse token amount from wei
   */
  parseTokenAmount(amount: string, decimals: number): string {
    return ethers.formatUnits(amount, decimals);
  }
}

export const oneInchService = new OneInchService(); 