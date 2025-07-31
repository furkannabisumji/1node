# 1inch Server Integration Guide

This guide explains how the backend server connects to the dedicated 1inch server via APIs, creating a microservices architecture.

## Architecture Overview

```
Frontend (React)
     ↓
Backend Server (TypeScript/Express) 
     ↓ (API calls)
1inch Server (JavaScript/Express with Fusion+ SDK)
     ↓ (Official SDK)
1inch Fusion+ API
```

## Benefits of This Architecture

- **Separation of Concerns**: Backend handles business logic, 1inch server handles DeFi operations
- **Scalability**: Each service can be scaled independently
- **Reliability**: Dedicated 1inch server with proper SDK integration and fallbacks
- **Maintainability**: Clear boundaries between different functionalities

## Setup Instructions

### 1. Configure the 1inch Server

```bash
cd 1inch

# Install dependencies
npm install

# Set your 1inch API key
export ONE_INCH_API_KEY="your_1inch_api_key_here"

# Start the 1inch server
npm start
```

The 1inch server will run on `http://localhost:3001`

### 2. Configure the Backend Server

Add the following to your backend `.env` file:

```env
# 1inch Server URL (connects to the dedicated 1inch server)
ONEINCH_SERVER_URL="http://localhost:3001"

# 1inch API Key (same as 1inch server for fallbacks)
ONEINCH_API_KEY="your_1inch_api_key_here"

# Other required variables...
DATABASE_URL="postgresql://username:password@localhost:5432/1node"
JWT_SECRET="your-super-secret-jwt-key"
ALCHEMY_API_KEY="your-alchemy-api-key"
```

### 3. Start Both Servers

```bash
# Terminal 1: Start 1inch server
cd 1inch
npm start

# Terminal 2: Start backend server
cd backend
npm run dev
```

### 4. Test the Integration

```bash
cd backend
node test-integration.js
```

## API Integration Details

### Backend → 1inch Server Communication

The backend's `OneInchService` now acts as a client that calls the 1inch server's APIs:

#### Token Operations
- `getTokens()` → `GET /api/tokens/:chainId`
- `getSwapQuote()` → `GET /api/quote/:chainId`
- `buildSwapTransaction()` → `GET /api/swap/:chainId`

#### Fusion+ Cross-Chain Operations  
- `getCrossChainQuote()` → `GET /api/fusion/quote`
- `createFusionOrder()` → `POST /api/fusion/order`
- `getFusionOrderStatus()` → `GET /api/fusion/order/:orderHash`
- `getOrdersByMaker()` → `GET /api/fusion/orders/:walletAddress`

### Error Handling & Fallbacks

The backend includes robust error handling:

1. **Connection Errors**: If 1inch server is down, fallback responses are provided
2. **API Errors**: Graceful degradation with mock data for development
3. **Timeout Handling**: 30-second timeout for all requests
4. **Logging**: Comprehensive logging for debugging

### Example API Flow

```javascript
// Frontend calls backend
fetch('/api/automations/quote', {
  method: 'POST',
  body: JSON.stringify({
    fromChain: 1,
    toChain: 137,
    fromToken: '0x...ETH',
    toToken: '0x...MATIC',
    amount: '1000000000000000000'
  })
});

// Backend processes request and calls 1inch server
const quote = await oneInchService.getCrossChainQuote(
  fromChain, toChain, fromToken, toToken, amount, userAddress
);

// 1inch server calls official 1inch Fusion+ SDK
const response = await sdk.getQuote({
  srcChainId: fromChain,
  dstChainId: toChain,
  srcTokenAddress: fromToken,
  dstTokenAddress: toToken,
  amount,
  walletAddress: userAddress
});
```

## Environment Variables

### Backend Server
- `ONEINCH_SERVER_URL`: URL of the 1inch server (default: http://localhost:3001)
- `ONEINCH_API_KEY`: 1inch API key for fallback operations

### 1inch Server  
- `ONE_INCH_API_KEY`: 1inch API key for Fusion+ SDK
- `PORT`: Server port (default: 3001)

## Monitoring & Health Checks

### Health Check Endpoints

```bash
# Check 1inch server health
curl http://localhost:3001/health

# Check backend server health  
curl http://localhost:3000/health
```

### Logs

Both servers provide detailed logging:

- **1inch Server**: Request/response logging for all API calls
- **Backend**: Integration logging with fallback notifications

## Development Tips

### Testing Individual Components

```bash
# Test 1inch server directly
curl "http://localhost:3001/api/quote/1?src=0xeeee...&dst=0xa0b8...&amount=1000000000000000000"

# Test backend integration
curl -X POST http://localhost:3000/api/automations/quote \
  -H "Content-Type: application/json" \
  -d '{"fromChain":1,"toChain":137,"fromToken":"0x...","toToken":"0x...","amount":"1000000000000000000"}'
```

### Debugging Connection Issues

1. Verify both servers are running on correct ports
2. Check firewall settings if running on different machines
3. Verify environment variables are set correctly
4. Check logs for connection errors

## Production Deployment

### Recommended Setup

1. **Load Balancer**: Route traffic to multiple backend instances
2. **1inch Server Cluster**: Run multiple 1inch server instances for redundancy
3. **Health Monitoring**: Monitor both services with tools like Grafana
4. **Caching**: Add Redis caching for frequently requested data

### Security Considerations

- Keep API keys secure and rotate regularly
- Use HTTPS in production
- Implement rate limiting on both servers
- Monitor for unusual API usage patterns

## Troubleshooting

### Common Issues

**"1inch server unavailable"**
- Ensure 1inch server is running on correct port
- Check ONEINCH_SERVER_URL environment variable
- Verify network connectivity

**"API key not set"**  
- Set ONE_INCH_API_KEY in 1inch server
- Set ONEINCH_API_KEY in backend server
- Get API key from https://portal.1inch.dev/

**Rate limiting errors**
- Implement request queuing in backend
- Consider upgrading 1inch API plan
- Add caching for frequent requests

### Getting Help

1. Check server logs for detailed error messages
2. Run the integration test script
3. Verify API key permissions on 1inch portal
4. Test individual endpoints manually

## Future Enhancements

- WebSocket connections for real-time order updates
- Circuit breaker pattern for better resilience  
- Metrics collection and alerting
- Auto-scaling based on API usage
- Cross-region deployment for better latency