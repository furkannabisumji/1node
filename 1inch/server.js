const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { OneInchService } = require('./services/oneInchService.js');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize 1inch Fusion+ service
const oneInchService = new OneInchService();

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: '1inch Fusion+ JavaScript Server',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    fusionSDK: 'enabled'
  });
});

// Get supported networks
app.get('/api/networks', (req, res) => {
  try {
    const networks = oneInchService.getSupportedNetworks();
    res.json({
      success: true,
      networks
    });
  } catch (error) {
    console.error('Error fetching networks:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get supported tokens for a chain
app.get('/api/tokens/:chainId', async (req, res) => {
  try {
    const { chainId } = req.params;
    const tokens = await oneInchService.getSupportedTokens(parseInt(chainId));
    res.json({
      success: true,
      chainId: parseInt(chainId),
      tokens
    });
  } catch (error) {
    console.error('Error fetching tokens:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get cross-chain quote using Fusion+ SDK
app.get('/api/fusion/quote', async (req, res) => {
  try {
    const { srcChainId, dstChainId, srcTokenAddress, dstTokenAddress, amount, walletAddress } = req.query;

    if (!srcChainId || !dstChainId || !srcTokenAddress || !dstTokenAddress || !amount || !walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'srcChainId, dstChainId, srcTokenAddress, dstTokenAddress, amount, and walletAddress are required'
      });
    }

    const quote = await oneInchService.getCrossChainQuote(
      parseInt(srcChainId),
      parseInt(dstChainId),
      srcTokenAddress,
      dstTokenAddress,
      amount,
      walletAddress
    );

    res.json(quote);
  } catch (error) {
    console.error('Error getting cross-chain quote:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create Fusion+ order
app.post('/api/fusion/order', async (req, res) => {
  try {
    const { srcChainId, dstChainId, srcTokenAddress, dstTokenAddress, amount, walletAddress } = req.body;

    if (!srcChainId || !dstChainId || !srcTokenAddress || !dstTokenAddress || !amount || !walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'srcChainId, dstChainId, srcTokenAddress, dstTokenAddress, amount, and walletAddress are required'
      });
    }

    const order = await oneInchService.createFusionOrder(
      srcChainId,
      dstChainId,
      srcTokenAddress,
      dstTokenAddress,
      amount,
      walletAddress
    );

    res.json(order);
  } catch (error) {
    console.error('Error creating Fusion+ order:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get order status
app.get('/api/fusion/order/:orderHash', async (req, res) => {
  try {
    const { orderHash } = req.params;

    if (!orderHash) {
      return res.status(400).json({
        success: false,
        error: 'orderHash is required'
      });
    }

    const status = await oneInchService.getOrderStatus(orderHash);
    res.json(status);
  } catch (error) {
    console.error('Error getting order status:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get active orders for a wallet
app.get('/api/fusion/orders/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'walletAddress is required'
      });
    }

    const orders = await oneInchService.getActiveOrders(
      walletAddress,
      parseInt(page),
      parseInt(limit)
    );

    res.json(orders);
  } catch (error) {
    console.error('Error getting active orders:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get regular swap quote (same chain)
app.get('/api/quote/:chainId', async (req, res) => {
  try {
    const { chainId } = req.params;
    const { src, dst, amount, from } = req.query;

    if (!src || !dst || !amount) {
      return res.status(400).json({
        success: false,
        error: 'src (source token), dst (destination token), and amount are required'
      });
    }

    const quote = await oneInchService.getSwapQuote(
      parseInt(chainId),
      src,
      dst,
      amount,
      from
    );

    res.json(quote);
  } catch (error) {
    console.error('Error getting quote:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Build swap transaction (same chain)
app.get('/api/swap/:chainId', async (req, res) => {
  try {
    const { chainId } = req.params;
    const { src, dst, amount, from, slippage = '1' } = req.query;

    if (!src || !dst || !amount || !from) {
      return res.status(400).json({
        success: false,
        error: 'src, dst, amount, and from address are required'
      });
    }

    const swapData = await oneInchService.buildSwapTransaction(
      parseInt(chainId),
      src,
      dst,
      amount,
      from,
      parseFloat(slippage)
    );

    res.json(swapData);
  } catch (error) {
    console.error('Error building swap:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get allowance
app.get('/api/allowance/:chainId', async (req, res) => {
  try {
    const { chainId } = req.params;
    const { tokenAddress, walletAddress } = req.query;

    if (!tokenAddress || !walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'tokenAddress and walletAddress are required'
      });
    }

    const allowance = await oneInchService.getAllowance(
      parseInt(chainId),
      tokenAddress,
      walletAddress
    );

    res.json({
      success: true,
      chainId: parseInt(chainId),
      allowance
    });
  } catch (error) {
    console.error('Error getting allowance:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get spender address for approvals
app.get('/api/approve/spender/:chainId', async (req, res) => {
  try {
    const { chainId } = req.params;
    const spender = await oneInchService.getSpenderAddress(parseInt(chainId));
    
    res.json({
      success: true,
      chainId: parseInt(chainId),
      spender
    });
  } catch (error) {
    console.error('Error getting spender:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 1inch Fusion+ JavaScript Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Fusion+ SDK: Enabled`);
  console.log(`📖 API Documentation:`);
  console.log(`\n🔥 Fusion+ Cross-Chain API:`);
  console.log(`   GET  /api/networks - Get supported networks`);
  console.log(`   GET  /api/fusion/quote?srcChainId=...&dstChainId=...&srcTokenAddress=...&dstTokenAddress=...&amount=...&walletAddress=... - Cross-chain quote`);
  console.log(`   POST /api/fusion/order - Create Fusion+ order`);
  console.log(`   GET  /api/fusion/order/:orderHash - Get order status`);
  console.log(`   GET  /api/fusion/orders/:walletAddress - Get active orders`);
  console.log(`\n💱 Regular Swap API:`);
  console.log(`   GET /api/tokens/:chainId - Get supported tokens`);
  console.log(`   GET /api/quote/:chainId?src=...&dst=...&amount=... - Get swap quote`);
  console.log(`   GET /api/swap/:chainId?src=...&dst=...&amount=...&from=... - Build swap transaction`);
  console.log(`   GET /api/allowance/:chainId?tokenAddress=...&walletAddress=... - Check allowance`);
  console.log(`   GET /api/approve/spender/:chainId - Get spender address for approvals`);
});

module.exports = app;