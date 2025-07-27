# 🔁 DeFi Automation Backend

A comprehensive Node.js/TypeScript backend for composable DeFi automations, built for the ETHGlobal Unite DeFi Hackathon. This backend powers automated cross-chain DeFi workflows using 1inch Fusion+, Limit Order Protocol, and AI-powered recommendations.

## 🚀 Features

- **No-Code Automation**: IFTTT-style workflow creation with triggers and actions
- **Cross-Chain Support**: Powered by 1inch Fusion+ for seamless cross-chain swaps
- **AI Recommendations**: Portfolio analysis and strategy suggestions using OpenAI & TensorFlow.js
- **Real-Time Monitoring**: Background job processing with BullMQ for trigger evaluation
- **Secure Authentication**: JWT-based auth with wallet address verification
- **Comprehensive APIs**: RESTful endpoints for all automation management
- **WebSocket Support**: Real-time notifications and updates
- **Production Ready**: Error handling, logging, rate limiting, and monitoring

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js with comprehensive middleware
- **Database**: PostgreSQL with Prisma ORM
- **Cache/Queue**: Redis with BullMQ for background jobs
- **Blockchain**: Ethers.js for Web3 interactions
- **AI/ML**: OpenAI API + TensorFlow.js for recommendations
- **Authentication**: JWT tokens with bcrypt password hashing
- **Logging**: Winston for structured logging
- **Validation**: Express-validator with Zod schemas
- **API Integration**: 1inch APIs for swaps, prices, and Fusion+

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18.0.0 or higher
- PostgreSQL 13+ database
- Redis 6+ for caching and job queues
- 1inch API key
- OpenAI API key (optional, for AI features)
- Alchemy/Infura API keys for blockchain RPC

## 🔧 Installation

1. **Clone and navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example .env
   ```

4. **Configure your `.env` file**:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/defi_automation"

   # Redis
   REDIS_URL="redis://localhost:6379"

   # Server
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your_super_secret_jwt_key_here

   # 1inch API (Required)
   ONEINCH_API_KEY=your_1inch_api_key
   ONEINCH_BASE_URL=https://api.1inch.dev

   # Blockchain RPC URLs (Required)
   ETHEREUM_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/your-api-key
   POLYGON_RPC_URL=https://polygon-mainnet.alchemyapi.io/v2/your-api-key
   ARBITRUM_RPC_URL=https://arb-mainnet.alchemyapi.io/v2/your-api-key

   # AI Services (Optional)
   OPENAI_API_KEY=your_openai_api_key

   # Notifications (Optional)
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

5. **Set up the database**:
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push
   ```

6. **Build the project**:
   ```bash
   npm run build
   ```

## 🚦 Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:3000` with hot reloading enabled.

### Production Mode

```bash
npm run build
npm start
```

### Database Management

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Create and apply migrations
npm run db:migrate

# Open Prisma Studio for database management
npm run db:studio
```

## 📚 API Documentation

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Core Endpoints

#### Automations
- `POST /api/automations` - Create new automation
- `GET /api/automations` - Get user's automations
- `GET /api/automations/:id` - Get specific automation
- `PUT /api/automations/:id/toggle` - Toggle automation on/off
- `POST /api/automations/:id/execute` - Manually execute automation
- `DELETE /api/automations/:id` - Delete automation

#### Portfolio
- `GET /api/portfolio` - Get portfolio overview
- `GET /api/portfolio/balances/:chain` - Get balances on specific chain
- `POST /api/portfolio/analyze` - Trigger AI portfolio analysis

#### AI Recommendations
- `GET /api/ai/suggestions` - Get AI-powered suggestions
- `GET /api/ai/risk-alerts` - Get risk alerts
- `POST /api/ai/analyze` - Request custom analysis

#### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification

### Example Automation Creation

```json
POST /api/automations
{
  "name": "ETH Price Drop Protection",
  "description": "Swap ETH to USDC when price drops 10%",
  "trigger": {
    "type": "PRICE_CHANGE",
    "chainId": 1,
    "config": {
      "token": "ETH",
      "percentage": -0.1,
      "operator": "lt"
    }
  },
  "action": {
    "type": "SWAP",
    "chainId": 1,
    "config": {
      "fromToken": "ETH",
      "toToken": "USDC",
      "amount": "50%",
      "slippage": "1%"
    }
  },
  "conditions": [
    {
      "type": "AMOUNT_LIMIT",
      "config": {
        "minAmount": "0.1",
        "maxAmount": "10"
      }
    }
  ]
}
```

## 🎯 Supported Trigger Types

- `PRICE_THRESHOLD` - Token reaches specific price
- `PRICE_CHANGE` - Price changes by percentage
- `BALANCE_CHANGE` - Wallet balance changes
- `TIME_BASED` - Scheduled execution
- `CROSS_CHAIN_PRICE_DIFF` - Price differences across chains
- `PORTFOLIO_RATIO` - Portfolio allocation changes

## ⚡ Supported Action Types

- `SWAP` - Token swaps using 1inch
- `TRANSFER` - Send tokens to address
- `CROSS_CHAIN_SWAP` - Cross-chain swaps via Fusion+
- `STAKE` - Stake tokens in protocols
- `PROVIDE_LIQUIDITY` - Add liquidity to pools
- `SEND_NOTIFICATION` - Send alerts to user

## 🔍 Monitoring and Logging

### Health Check
```bash
curl http://localhost:3000/health
```

### Queue Status
The application uses BullMQ for background job processing:
- Trigger evaluation jobs run every 30 seconds
- Portfolio analysis runs every 5 minutes
- Price updates run every minute

### Logs
Logs are written to:
- Console (development)
- `logs/error.log` (errors only)
- `logs/combined.log` (all logs)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🚀 Deployment

### Environment Setup

1. **Production Database**: Set up PostgreSQL instance
2. **Redis Instance**: Set up Redis for job queues
3. **Environment Variables**: Configure all required variables
4. **SSL/TLS**: Enable HTTPS in production

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment-Specific Configuration

```bash
# Production
NODE_ENV=production
LOG_LEVEL=warn
RATE_LIMIT_MAX_REQUESTS=1000

# Development
NODE_ENV=development
LOG_LEVEL=debug
RATE_LIMIT_MAX_REQUESTS=100
```

## 🔒 Security Considerations

- **API Keys**: Store securely and rotate regularly
- **JWT Secrets**: Use strong, unique secrets
- **Rate Limiting**: Configured for DoS protection
- **Input Validation**: All inputs validated and sanitized
- **CORS**: Configured for frontend domains only
- **Helmet**: Security headers enabled
- **Private Keys**: Never commit to version control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify DATABASE_URL is correct
   - Ensure database exists

2. **Redis Connection Failed**
   - Check Redis is running
   - Verify REDIS_URL is correct

3. **1inch API Errors**
   - Verify API key is valid
   - Check rate limits
   - Ensure supported chain IDs

4. **Job Queue Not Processing**
   - Check Redis connection
   - Verify BullMQ workers are running
   - Check job queue dashboard

### Debug Mode

Enable debug logging:
```bash
LOG_LEVEL=debug npm run dev
```

## 📞 Support

For ETHGlobal Unite DeFi Hackathon support:
- Create an issue in the repository
- Check existing documentation
- Review API error responses for details

---

Built with ❤️ for ETHGlobal Unite DeFi Hackathon 