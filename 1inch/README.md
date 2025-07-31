# 1inch Fusion+ JavaScript Server

A standalone JavaScript server implementing the official 1inch Fusion+ SDK for cross-chain DeFi operations. This server provides REST API endpoints for cross-chain swaps, regular token swaps, and DeFi operations using the [1inch Fusion+ SDK](https://portal.1inch.dev/documentation/apis/swap/fusion-plus/fusion-plus-sdk/for-integrators/sdk-overview).

## Features

- 🔥 **Fusion+ Cross-Chain** - Cross-chain swaps using official 1inch Fusion+ SDK
- 🔄 **Regular Swaps** - Same-chain token swaps and quotes
- 📋 **Order Management** - Create, track, and manage Fusion+ orders
- 💰 **Price Feeds** - Real-time token prices across networks
- 🪙 **Token Management** - Get supported tokens and allowances
- ⛓️ **Multi-Chain** - Support for 10+ blockchain networks
- 🚀 **Easy Setup** - Simple Express.js server with official SDK integration

## Supported Networks

- Ethereum (1)
- BNB Smart Chain (56) 
- Polygon (137)
- Optimism (10)
- Arbitrum One (42161)
- Avalanche (43114)
- Fantom (250)
- Gnosis (100)
- Aurora (1313161554)
- Klaytn (8217)

## Quick Start

### 1. Installation

```bash
cd 1inch
npm install
```

### 2. Configuration

Get your API key from [1inch Developer Portal](https://portal.1inch.dev/) and set it as an environment variable:

```bash
# Set your API key (note the updated variable name)
export ONE_INCH_API_KEY="your_api_key_here"

# Or create a .env file
echo "ONE_INCH_API_KEY=your_api_key_here" > .env
```

### 3. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Health Check
```http
GET /health
```

### Get Supported Networks
```http
GET /api/networks
```

## Fusion+ Cross-Chain API

### Get Cross-Chain Quote
```http
GET /api/fusion/quote?srcChainId=1&dstChainId=137&srcTokenAddress=0xeeee...&dstTokenAddress=0xaaaa...&amount=1000000000000000000&walletAddress=0x742d...

# Example - Quote 1 ETH (Ethereum) to MATIC (Polygon)
GET /api/fusion/quote?srcChainId=1&dstChainId=137&srcTokenAddress=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee&dstTokenAddress=0x0000000000000000000000000000000000001010&amount=1000000000000000000&walletAddress=0x742d35Cc6834C532532C5aac56cc0B8A0c82394B
```

### Create Fusion+ Order
```http
POST /api/fusion/order
Content-Type: application/json

{
  "srcChainId": 1,
  "dstChainId": 137,
  "srcTokenAddress": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  "dstTokenAddress": "0x0000000000000000000000000000000000001010",
  "amount": "1000000000000000000",
  "walletAddress": "0x742d35Cc6834C532532C5aac56cc0B8A0c82394B"
}
```

### Get Order Status
```http
GET /api/fusion/order/:orderHash

# Example
GET /api/fusion/order/0x1234567890abcdef...
```

### Get Active Orders
```http
GET /api/fusion/orders/:walletAddress?page=1&limit=10

# Example
GET /api/fusion/orders/0x742d35Cc6834C532532C5aac56cc0B8A0c82394B?page=1&limit=10
```

## Regular Swap API

### Get Supported Tokens
```http
GET /api/tokens/:chainId

# Example
GET /api/tokens/1
```

### Get Token Prices
```http
GET /api/prices/:chainId?tokens=address1,address2

# Example - Get ETH and USDC prices on Ethereum
GET /api/prices/1?tokens=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee,0xa0b86a33e6417c4d48b4e1c39a533d8a23b34f6
```

### Get Swap Quote
```http
GET /api/quote/:chainId?src=tokenA&dst=tokenB&amount=1000000

# Example - Quote 1 ETH to USDC on Ethereum
GET /api/quote/1?src=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee&dst=0xa0b86a33e6417c4d48b4e1c39a533d8a23b34f6&amount=1000000000000000000
```

### Build Swap Transaction
```http
GET /api/swap/:chainId?src=tokenA&dst=tokenB&amount=1000000&from=walletAddress&slippage=1

# Example
GET /api/swap/1?src=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee&dst=0xa0b86a33e6417c4d48b4e1c39a533d8a23b34f6&amount=1000000000000000000&from=0x742d35Cc6834C532532C5aac56cc0B8A0c82394B&slippage=1
```

### Check Token Allowance
```http
GET /api/allowance/:chainId?tokenAddress=token&walletAddress=wallet

# Example
GET /api/allowance/1?tokenAddress=0xa0b86a33e6417c4d48b4e1c39a533d8a23b34f6&walletAddress=0x742d35Cc6834C532532C5aac56cc0B8A0c82394B
```

### Get Spender Address
```http
GET /api/approve/spender/:chainId

# Example
GET /api/approve/spender/1
```

## Usage Examples

### Fusion+ Cross-Chain Swaps

#### JavaScript/Node.js
```javascript
// Get cross-chain quote (ETH on Ethereum to MATIC on Polygon)
const quoteResponse = await fetch('http://localhost:3001/api/fusion/quote?srcChainId=1&dstChainId=137&srcTokenAddress=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee&dstTokenAddress=0x0000000000000000000000000000000000001010&amount=1000000000000000000&walletAddress=0x742d35Cc6834C532532C5aac56cc0B8A0c82394B');
const quote = await quoteResponse.json();
console.log('Cross-chain quote:', quote);

// Create Fusion+ order
const orderResponse = await fetch('http://localhost:3001/api/fusion/order', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    srcChainId: 1,
    dstChainId: 137,
    srcTokenAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    dstTokenAddress: '0x0000000000000000000000000000000000001010',
    amount: '1000000000000000000',
    walletAddress: '0x742d35Cc6834C532532C5aac56cc0B8A0c82394B'
  })
});
const order = await orderResponse.json();
console.log('Fusion+ order:', order);

// Check order status
const statusResponse = await fetch(`http://localhost:3001/api/fusion/order/${order.orderHash}`);
const status = await statusResponse.json();
console.log('Order status:', status);
```

### Regular Swaps

#### JavaScript/Node.js
```javascript
// Get swap quote (same chain)
const response = await fetch('http://localhost:3001/api/quote/1?src=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee&dst=0xa0b86a33e6417c4d48b4e1c39a533d8a23b34f6&amount=1000000000000000000');
const quote = await response.json();
console.log('Same-chain quote:', quote);

// Get supported networks
const networksResponse = await fetch('http://localhost:3001/api/networks');
const networks = await networksResponse.json();
console.log('Supported networks:', networks);
```

### cURL Examples

#### Fusion+ Cross-Chain
```bash
# Get supported networks
curl http://localhost:3001/api/networks

# Get cross-chain quote (ETH to MATIC)
curl "http://localhost:3001/api/fusion/quote?srcChainId=1&dstChainId=137&srcTokenAddress=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee&dstTokenAddress=0x0000000000000000000000000000000000001010&amount=1000000000000000000&walletAddress=0x742d35Cc6834C532532C5aac56cc0B8A0c82394B"

# Create Fusion+ order
curl -X POST http://localhost:3001/api/fusion/order \
  -H "Content-Type: application/json" \
  -d '{
    "srcChainId": 1,
    "dstChainId": 137,
    "srcTokenAddress": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    "dstTokenAddress": "0x0000000000000000000000000000000000001010",
    "amount": "1000000000000000000",
    "walletAddress": "0x742d35Cc6834C532532C5aac56cc0B8A0c82394B"
  }'

# Get order status
curl http://localhost:3001/api/fusion/order/0x1234567890abcdef...

# Get active orders
curl http://localhost:3001/api/fusion/orders/0x742d35Cc6834C532532C5aac56cc0B8A0c82394B
```

#### Regular Swaps
```bash
# Get health status
curl http://localhost:3001/health

# Get Ethereum tokens
curl http://localhost:3001/api/tokens/1

# Get swap quote (1 ETH to USDC)
curl "http://localhost:3001/api/quote/1?src=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee&dst=0xa0b86a33e6417c4d48b4e1c39a533d8a23b34f6&amount=1000000000000000000"
```

## Token Addresses

### Common Token Addresses (Ethereum)
- **ETH**: `0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee`
- **USDC**: `0xa0b86a33e6417c4d48b4e1c39a533d8a23b34f6`
- **USDT**: `0xdac17f958d2ee523a2206206994597c13d831ec7`
- **DAI**: `0x6b175474e89094c44da98b954eedeac495271d0f`
- **WBTC**: `0x2260fac5e5542a773aa44fbcfedf7c193bc2c599`

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (missing parameters)
- `500` - Server Error (API issues, network problems)

## Development

### Project Structure
```
1inch/
├── server.js              # Main Express server
├── services/
│   └── oneInchService.js   # 1inch API integration
├── package.json            # Dependencies and scripts
├── config.example.js       # Configuration template
└── README.md              # This file
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with different tokens and chains
5. Submit a pull request

## Troubleshooting

### Common Issues

**"API key not set" warning**
- Get an API key from [1inch Developer Portal](https://portal.1inch.dev/)
- Set the `ONE_INCH_API_KEY` environment variable (note the updated variable name)

**Rate limiting errors**
- The free tier has rate limits
- Implement caching for production use
- Consider upgrading to a paid plan

**Invalid token addresses**
- Use checksummed addresses
- Verify tokens are supported on the target chain
- Use the `/api/tokens/:chainId` endpoint to find valid addresses

**Network errors**
- Check your internet connection
- Verify the 1inch API is accessible
- Try different chain IDs

## License

MIT License - see LICENSE file for details.

## Resources

- [1inch Fusion+ SDK Documentation](https://portal.1inch.dev/documentation/apis/swap/fusion-plus/fusion-plus-sdk/for-integrators/sdk-overview)
- [1inch API Documentation](https://docs.1inch.io/docs/aggregation-protocol/api/swagger)
- [1inch Developer Portal](https://portal.1inch.dev/)
- [Fusion+ Cross-Chain Protocol](https://portal.1inch.dev/documentation/apis/swap/fusion-plus/fusion-plus-overview)
- [Supported Networks](https://help.1inch.io/en/articles/4585108-what-networks-does-the-1inch-network-support)
- [Token Lists](https://tokenlists.org/)