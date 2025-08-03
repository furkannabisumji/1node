# 🚀 1Node - Visual DeFi Automation Platform

> **Build sophisticated DeFi strategies with our visual no-code builder. Connect triggers, conditions, and actions to automate your portfolio across multiple blockchains.**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Wagmi](https://img.shields.io/badge/Wagmi-2-purple.svg)](https://wagmi.sh/)

## ✨ The Future of DeFi Automation

1Node revolutionizes DeFi strategy creation by providing an intuitive visual interface where users can drag, drop, and connect automation blocks to build sophisticated trading strategies without writing a single line of code.

### 🎯 Key Features

- **🎨 Visual Flow Builder** - Drag-and-drop interface for creating complex automation workflows
- **🔗 Multi-Chain Support** - Deploy strategies across Optimism and Etherlink networks
- **⚡ Real-Time Triggers** - Price monitoring, wallet balance checks, gas price thresholds, and time-based scheduling
- **🤖 Smart Actions** - Token swaps via 1inch Fusion+, transfers, staking operations, and custom alerts
- **💰 Portfolio Management** - Comprehensive deposit tracking and fund management across chains
- **🔐 Secure Vault System** - Smart contract-based fund custody with multi-chain withdrawal support
- **📊 Analytics Dashboard** - Real-time portfolio insights and automation performance metrics

## 🖼️ Platform Screenshots

### 🏠 Landing Page
![Landing Page](frontend/public/landing-page.png)
*Clean, modern interface introducing visual DeFi automation with hero section highlighting the no-code approach*

### 🛠️ Automation Builder
![Automation Builder](frontend/public/Automation-creation.png)
*Visual flow canvas for creating sophisticated DeFi strategies with drag-and-drop interface, network-aware token selection, and real-time cost breakdown*

### 📋 Automation Management
![Automation Management](frontend/public/automations-pages.png)
*Comprehensive view of all active and paused automations with grid layout, status indicators, and bulk management capabilities*

## 🏗️ Technical Architecture

![Technical Architecture](frontend/public/1node-architecture.png)
*Complete system architecture showing microservices design, blockchain integrations, and data flow between components*

Our platform follows a microservices architecture with clear separation between frontend, backend API, workflow engine, and blockchain integrations. The system handles everything from user authentication to complex cross-chain automation execution.

### Core Components

- **Frontend**: React Router 7 + TypeScript for modern web experience
- **Backend API Gateway**: Node.js handling user management and workflow orchestration  
- **Workflow Engine**: Custom execution engine for trigger monitoring and action execution
- **Smart Contracts**: Solidity vault contracts for secure fund management
- **External Integrations**: 1inch Fusion+ for optimal token swaps, real-time price feeds

## 📋 Smart Contract Addresses

### Optimism Network
- **Vault Contract**: [`0x4E19A6C2B37c799E6BC8eb682889f33C6d97760A`](https://optimistic.etherscan.io/address/0x4E19A6C2B37c799E6BC8eb682889f33C6d97760A)
- **Network**: Optimism (Chain ID: 10)
- **USDC Token**: `0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85`

### Etherlink Network  
- **Vault Contract**: [`0x4E19A6C2B37c799E6BC8eb682889f33C6d97760A`](https://explorer.etherlink.com/address/0x4E19A6C2B37c799E6BC8eb682889f33C6d97760A)
- **Network**: Etherlink (Chain ID: 42793)
- **USDC Token**: `0x796Ea11Fa2dD751eD01b53C372fFDB4AAa8f00F9`

## 🛠️ Technology Stack

### Frontend
- **React Router 7** - Modern routing with file-based structure and SSR
- **TypeScript** - Type-safe development with strict mode
- **Tailwind CSS** - Utility-first styling framework
- **React Flow** - Interactive node-based flow editor for visual automation
- **Wagmi** - React hooks for Ethereum with multi-chain support
- **Zustand** - Lightweight state management
- **React Toastify** - Beautiful notification system

### Backend & Infrastructure
- **Node.js** - Server runtime environment
- **Express** - Minimal web framework
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Primary database for user data and workflows
- **Redis** - Caching and background job queues
- **BullMQ** - Reliable job processing for automation execution

### Blockchain Integration
- **Viem** - TypeScript-first Ethereum library
- **1inch Fusion+** - Advanced DEX aggregation for optimal swaps
- **Custom Vault Contracts** - Secure multi-chain fund management
- **Multi-chain RPC** - Optimism and Etherlink network support

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (LTS recommended)
- pnpm (preferred) or npm
- PostgreSQL 14+
- Redis 6+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/1node.git
   cd 1node
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   pnpm install
   
   # Backend  
   cd backend
   pnpm install
   ```

3. **Environment setup**
   ```bash
   # Frontend (.env.local)
   VITE_API_URL=http://localhost:3001
   VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
   
   # Backend (.env)
   DATABASE_URL="postgresql://user:password@localhost:5432/onenode"
   REDIS_URL="redis://localhost:6379"
   JWT_SECRET=your_super_secure_jwt_secret
   ONEINCH_API_KEY=your_1inch_api_key
   OPTIMISM_RPC_URL=https://mainnet.optimism.io
   ETHERLINK_RPC_URL=https://node.ghostnet.etherlink.com
   ```

4. **Database setup**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npx prisma generate
   npx prisma db seed
   ```

5. **Start development servers**
   ```bash
   # Backend (terminal 1)
   cd backend && pnpm dev
   
   # Frontend (terminal 2) 
   cd frontend && pnpm dev
   ```

6. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3001`

## 💡 Usage Guide

### Creating Your First Automation

1. **🔗 Connect Wallet** 
   - Click "Connect Wallet" and choose MetaMask or WalletConnect
   - Ensure you have USDC on Optimism or Etherlink for gas and deposits

2. **🎨 Build Your Flow**
   - Navigate to the Automation Builder
   - Drag a **Trigger** (e.g., "Price Change") from the left sidebar
   - Add an **Action** (e.g., "Swap Tokens") to the canvas
   - Connect them by dragging from the trigger's output to the action's input

3. **⚙️ Configure Nodes**
   - **Double-click** any node to open configuration
   - Set parameters like price thresholds, token amounts, and network preferences
   - Use network-aware token selection for multi-chain strategies

4. **💰 Fund Your Automation**
   - Check the required deposit in the right sidebar
   - Deposit USDC to cover automation costs and trading capital
   - Funds are held securely in our audited vault contracts

5. **🚀 Deploy & Monitor**
   - Click "Deploy Automation" once all nodes are configured
   - Monitor execution in the dashboard
   - Pause, resume, or modify strategies anytime

### Example Strategies

**🎯 Dollar-Cost Averaging (DCA)**
```
Trigger: Time Schedule (Daily at 12:00 UTC)
→ Action: Swap 50 USDC to ETH on Optimism
```

**📈 Momentum Trading**
```
Trigger: ETH price increases by 5% in 1 hour
→ Condition: Portfolio ETH allocation < 30%
→ Action: Swap 200 USDC to ETH
```

**⚡ Gas-Optimized Transfers**
```
Trigger: Gas price < 10 gwei
→ Action: Execute pending token transfers
```

**🔄 Cross-Chain Arbitrage**
```
Trigger: Price difference > 2% between Optimism and Etherlink
→ Action: Fusion+ swap from cheaper to expensive chain
```

## 🏆 Hackathon Innovation

Built for advancing DeFi accessibility, 1Node introduces several groundbreaking features:

### 🌟 Key Innovations

- **Visual DeFi Programming** - First drag-and-drop interface for complex DeFi strategy creation
- **Multi-Chain Automation** - Seamless cross-chain strategy deployment and execution
- **1inch Fusion+ Integration** - Advanced swap routing with MEV protection
- **Real-Time Portfolio Sync** - Live tracking across multiple chains and protocols
- **Gas-Optimized Execution** - Smart batching and timing for cost efficiency
- **Network-Aware Configuration** - Automatic token filtering based on selected chains

### 🎯 Problem Solved

Traditional DeFi automation requires:
- ❌ Complex coding skills
- ❌ Deep protocol knowledge  
- ❌ Manual strategy management
- ❌ Multiple platform juggling

1Node provides:
- ✅ Visual, no-code interface
- ✅ Pre-built strategy templates
- ✅ Automated execution and monitoring  
- ✅ Unified multi-chain management

## 🔐 Security & Auditing

### Smart Contract Security
- **Multi-sig governance** for contract upgrades
- **Pausable contracts** for emergency situations
- **Reentrancy protection** on all external calls
- **Access control** with role-based permissions

### Fund Safety
- **Non-custodial design** - Users maintain control of funds
- **Vault isolation** - Individual user fund separation
- **Withdrawal limits** - Configurable safety mechanisms
- **Emergency stops** - Circuit breakers for unusual activity

## 🤝 Contributing

We welcome contributions from the community! Here's how to get involved:

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow our coding standards (ESLint + Prettier configured)
4. Write tests for new functionality
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request with detailed description

### Contribution Areas
- 🐛 Bug fixes and improvements
- ✨ New trigger and action types
- 🔗 Additional blockchain integrations
- 📚 Documentation improvements
- 🎨 UI/UX enhancements

## 📊 Roadmap

### Phase 1: Core Platform ✅
- [x] Visual automation builder
- [x] Multi-chain deployment (Optimism, Etherlink)
- [x] Basic triggers and actions
- [x] Portfolio management

### Phase 2: Advanced Features 🚧
- [ ] More blockchain integrations (Arbitrum, Polygon)
- [ ] Advanced conditions and logic operators
- [ ] Strategy templates marketplace
- [ ] Social trading features

### Phase 3: Enterprise 🔮
- [ ] Institution-grade security
- [ ] Advanced analytics and reporting
- [ ] API access for developers
- [ ] White-label solutions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

Special thanks to the teams and protocols that made this possible:

- **1inch Network** - For providing Fusion+ DEX aggregation
- **Optimism Foundation** - For scalable L2 infrastructure  
- **Tezos/Etherlink** - For EVM-compatible blockchain innovation
- **React Flow Team** - For the excellent node-based UI framework
- **Wagmi Contributors** - For seamless Ethereum React integration

## 📞 Connect With Us

- **🌐 Live Demo**: [Link](https://1node.vercel.app/]
---

<div align="center">

**Built with ❤️ for the DeFi community**

*Empowering everyone to build sophisticated DeFi strategies without code*

[⭐ Star this repo](https://github.com/your-org/1node) • [🐛 Report Bug](https://github.com/your-org/1node/issues) • [💡 Request Feature](https://github.com/your-org/1node/issues)

</div>
