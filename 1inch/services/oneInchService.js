const { SDK, NetworkEnum } = require('@1inch/cross-chain-sdk');
const axios = require('axios');

/**
 * 1inch Fusion+ SDK Service
 * Implements cross-chain swaps using the official 1inch Fusion+ SDK
 */
class OneInchService {
  constructor() {
    this.apiKey = process.env.ONE_INCH_API_KEY;
    this.baseUrl = 'https://api.1inch.dev';
    
    if (!this.apiKey) {
      console.warn('⚠️  Warning: ONE_INCH_API_KEY not set. Some features may be limited.');
    }

    // Initialize Fusion+ SDK
    this.sdk = new SDK({
      url: "https://api.1inch.dev/fusion-plus",
      authKey: this.apiKey,
    });

    // Network mapping for easier access
    this.networks = {
      1: NetworkEnum.ETHEREUM,
      56: NetworkEnum.BINANCE,
      137: NetworkEnum.POLYGON,
      10: NetworkEnum.OPTIMISM,
      42161: NetworkEnum.ARBITRUM,
      43114: NetworkEnum.AVALANCHE,
      250: NetworkEnum.FANTOM,
      100: NetworkEnum.GNOSIS,
      8217: NetworkEnum.KLAYTN,
      1313161554: NetworkEnum.AURORA
    };
  }

  /**
   * Get headers for direct API requests (fallback)
   */
  getHeaders() {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  /**
   * Get supported tokens using Fusion+ SDK
   */
  async getSupportedTokens(chainId) {
    try {
      const network = this.networks[chainId];
      if (!network) {
        throw new Error(`Unsupported network: ${chainId}`);
      }

      // Get supported tokens for the network
      const supportedTokens = await this.sdk.getSupportedTokens({
        network
      });

      return {
        chainId,
        network: network,
        total: supportedTokens.length,
        tokens: supportedTokens.slice(0, 50) // Limit for performance
      };
    } catch (error) {
      console.error('Error getting supported tokens:', error);
      // Fallback to direct API call
      return this.fallbackGetTokens(chainId);
    }
  }

  /**
   * Get cross-chain quote using Fusion+ SDK
   */
  async getCrossChainQuote(srcChainId, dstChainId, srcTokenAddress, dstTokenAddress, amount, walletAddress) {
    try {
      const srcNetwork = this.networks[srcChainId];
      const dstNetwork = this.networks[dstChainId];

      if (!srcNetwork || !dstNetwork) {
        throw new Error(`Unsupported network: ${srcChainId} or ${dstChainId}`);
      }

      const quote = await this.sdk.getQuote({
        srcChainId,
        dstChainId,
        srcTokenAddress,
        dstTokenAddress,
        amount,
        walletAddress
      });

      return {
        success: true,
        srcChainId,
        dstChainId,
        srcTokenAddress,
        dstTokenAddress,
        amount,
        quote: {
          dstAmount: quote.dstAmount,
          srcAmount: quote.srcAmount,
          gas: quote.gas,
          prices: quote.prices,
          protocols: quote.protocols || []
        }
      };
    } catch (error) {
      console.error('Error getting cross-chain quote:', error);
      throw new Error(`Failed to get cross-chain quote: ${error.message}`);
    }
  }

  /**
   * Create Fusion+ order using SDK
   */
  async createFusionOrder(srcChainId, dstChainId, srcTokenAddress, dstTokenAddress, amount, walletAddress) {
    try {
      const srcNetwork = this.networks[srcChainId];
      const dstNetwork = this.networks[dstChainId];

      if (!srcNetwork || !dstNetwork) {
        throw new Error(`Unsupported network: ${srcChainId} or ${dstChainId}`);
      }

      const order = await this.sdk.createOrder({
        srcChainId,
        dstChainId,
        srcTokenAddress,
        dstTokenAddress,
        amount,
        walletAddress
      });

      return {
        success: true,
        orderHash: order.orderHash,
        order: order.order,
        signature: order.signature,
        quoteId: order.quoteId
      };
    } catch (error) {
      console.error('Error creating Fusion+ order:', error);
      throw new Error(`Failed to create Fusion+ order: ${error.message}`);
    }
  }

  /**
   * Get order status using SDK
   */
  async getOrderStatus(orderHash) {
    try {
      const status = await this.sdk.getOrderStatus({
        orderHash
      });

      return {
        success: true,
        orderHash,
        status: status.status,
        fills: status.fills || [],
        createDateTime: status.createDateTime,
        order: status.order
      };
    } catch (error) {
      console.error('Error getting order status:', error);
      throw new Error(`Failed to get order status: ${error.message}`);
    }
  }

  /**
   * Get active orders using SDK
   */
  async getActiveOrders(walletAddress, page = 1, limit = 10) {
    try {
      const orders = await this.sdk.getActiveOrders({
        walletAddress,
        page,
        limit
      });

      return {
        success: true,
        orders: orders.items || [],
        pagination: {
          page,
          limit,
          total: orders.meta?.totalItems || 0
        }
      };
    } catch (error) {
      console.error('Error getting active orders:', error);
      throw new Error(`Failed to get active orders: ${error.message}`);
    }
  }

  /**
   * Get swap quote for same chain (fallback to regular swap API)
   */
  async getSwapQuote(chainId, src, dst, amount, from = null) {
    try {
      const url = new URL(`${this.baseUrl}/swap/v6.0/${chainId}/quote`);
      
      const params = { src, dst, amount };
      if (from) params.from = from;

      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      const response = await axios.get(url.toString(), {
        headers: this.getHeaders(),
        timeout: 10000
      });

      return {
        success: true,
        chainId,
        fromToken: response.data.fromToken,
        toToken: response.data.toToken,
        fromTokenAmount: response.data.fromTokenAmount,
        toTokenAmount: response.data.toTokenAmount,
        protocols: response.data.protocols,
        estimatedGas: response.data.estimatedGas
      };
    } catch (error) {
      console.error('Error getting swap quote:', error);
      throw new Error(`Failed to get swap quote: ${error.response?.data?.description || error.message}`);
    }
  }

  /**
   * Build swap transaction for same chain
   */
  async buildSwapTransaction(chainId, src, dst, amount, from, slippage = 1) {
    try {
      const url = new URL(`${this.baseUrl}/swap/v6.0/${chainId}/swap`);
      
      const params = { src, dst, amount, from, slippage };
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      const response = await axios.get(url.toString(), {
        headers: this.getHeaders(),
        timeout: 10000
      });

      return {
        success: true,
        chainId,
        fromToken: response.data.fromToken,
        toToken: response.data.toToken,
        fromTokenAmount: response.data.fromTokenAmount,
        toTokenAmount: response.data.toTokenAmount,
        tx: response.data.tx,
        protocols: response.data.protocols
      };
    } catch (error) {
      console.error('Error building swap transaction:', error);
      throw new Error(`Failed to build swap transaction: ${error.response?.data?.description || error.message}`);
    }
  }

  /**
   * Fallback method for getting tokens via direct API
   */
  async fallbackGetTokens(chainId) {
    try {
      const url = `${this.baseUrl}/swap/v6.0/${chainId}/tokens`;
      const response = await axios.get(url, {
        headers: this.getHeaders(),
        timeout: 10000
      });

      const tokens = Object.entries(response.data.tokens).map(([address, token]) => ({
        address,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        logoURI: token.logoURI
      }));

      return {
        chainId,
        total: tokens.length,
        tokens: tokens.slice(0, 50)
      };
    } catch (error) {
      console.error('Fallback token fetch failed:', error);
      throw new Error(`Failed to get tokens: ${error.response?.data?.description || error.message}`);
    }
  }

  /**
   * Get token allowance
   */
  async getAllowance(chainId, tokenAddress, walletAddress) {
    try {
      const url = new URL(`${this.baseUrl}/swap/v6.0/${chainId}/approve/allowance`);
      url.searchParams.append('tokenAddress', tokenAddress);
      url.searchParams.append('walletAddress', walletAddress);

      const response = await axios.get(url.toString(), {
        headers: this.getHeaders(),
        timeout: 10000
      });

      return response.data.allowance;
    } catch (error) {
      console.error('Error getting allowance:', error);
      throw new Error(`Failed to get allowance: ${error.response?.data?.description || error.message}`);
    }
  }

  /**
   * Get spender address for approvals
   */
  async getSpenderAddress(chainId) {
    try {
      const url = `${this.baseUrl}/swap/v6.0/${chainId}/approve/spender`;
      const response = await axios.get(url, {
        headers: this.getHeaders(),
        timeout: 10000
      });

      return response.data.address;
    } catch (error) {
      console.error('Error getting spender address:', error);
      throw new Error(`Failed to get spender address: ${error.response?.data?.description || error.message}`);
    }
  }

  /**
   * Get supported networks
   */
  getSupportedNetworks() {
    return Object.keys(this.networks).map(chainId => ({
      chainId: parseInt(chainId),
      network: this.networks[chainId],
      name: this.getNetworkName(parseInt(chainId))
    }));
  }

  /**
   * Get network name by chain ID
   */
  getNetworkName(chainId) {
    const names = {
      1: 'Ethereum',
      56: 'BNB Smart Chain',
      137: 'Polygon',
      10: 'Optimism',
      42161: 'Arbitrum One',
      43114: 'Avalanche',
      250: 'Fantom',
      100: 'Gnosis',
      8217: 'Klaytn',
      1313161554: 'Aurora'
    };
    return names[chainId] || `Chain ${chainId}`;
  }
}

module.exports = { OneInchService };