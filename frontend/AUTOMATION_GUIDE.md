# 1Node Automation Builder - Complete Guide

## Overview

The 1Node Automation Builder is a visual, no-code platform for creating DeFi automation workflows. Think of it as "IFTTT for DeFi" - you can create complex automation strategies by connecting trigger events, conditional logic, and automated actions.

## How Automation Works

### Basic Flow Structure
Every automation follows this pattern:
```
TRIGGER → [CONDITIONS] → ACTIONS
```

- **TRIGGER**: What starts the automation (price changes, time schedules, etc.)
- **CONDITIONS**: Optional filters that must be met (amount limits, time restrictions, etc.)
- **ACTIONS**: What happens when triggered (swap tokens, send alerts, etc.)

### Visual Canvas
- Drag nodes from the left sidebar onto the canvas
- Connect nodes by dragging from output handles to input handles
- Configure each node by clicking on it
- Use keyboard shortcuts: `Delete` to remove nodes, `Ctrl/Cmd+B` to toggle sidebar

---

## Node Types

### 🟢 TRIGGERS (4 Types)
Triggers start automation workflows when specific events occur.

#### 1. **Price Change**
Monitors token price movements and triggers when thresholds are met.

**Configuration:**
- **Token**: Select cryptocurrency (ETH, USDC, USDT, BTC)
- **Change Type**: Percentage change or absolute price
- **Direction**: Price drops or rises
- **Value**: Threshold amount (e.g., 10% or $2000)
- **Network**: Blockchain network to monitor

**Example**: "When ETH price drops by 15%, trigger automation"

#### 2. **Gas Price**
Triggers based on network gas fee conditions.

**Configuration:**
- **Network**: Blockchain network to monitor
- **Condition**: Less than or greater than
- **Gas Limit**: Maximum gas price in USD
- **Priority**: Slow, standard, or fast gas tiers

**Example**: "When Ethereum gas fees are less than $5, trigger automation"

#### 3. **Time Schedule**
Executes automation on recurring time schedules.

**Configuration:**
- **Schedule Type**: Recurring, one-time, daily, or weekly
- **Time**: Specific time of day
- **Timezone**: Time zone for execution

**Example**: "Every Monday at 9:00 AM UTC, trigger automation"

#### 4. **Wallet Balance**
Monitors wallet token balances and triggers on threshold conditions.

**Configuration:**
- **Token**: Token to monitor
- **Condition**: Greater than, less than, or equal to
- **Amount**: Balance threshold
- **Wallet Address**: Specific wallet (optional, defaults to connected wallet)

**Example**: "When USDC balance is greater than 1000, trigger automation"

---

### 🔵 CONDITIONS (7 Types)
Conditions add filtering logic to automation workflows.

#### 1. **Amount Limits**
Sets minimum and maximum transaction amounts.

**Configuration:**
- **Minimum Amount**: Smallest allowed transaction
- **Maximum Amount**: Largest allowed transaction
- **Token**: Currency for limits

**Use Case**: Prevent very small or very large trades

#### 2. **Time Restrictions**
Limits automation execution to specific hours or days.

**Configuration:**
- **Restriction Type**: Hours only, days only, or both
- **Time Range**: Start and end times
- **Days of Week**: Specific weekdays when automation can run

**Use Case**: Only trade during market hours or avoid weekends

#### 3. **Portfolio Percentage**
Checks if a token represents a specific percentage of portfolio.

**Configuration:**
- **Token**: Token to check
- **Condition**: Greater than, less than, or between
- **Percentage**: Target allocation percentage
- **Max Percentage**: Upper bound (for "between" condition)

**Use Case**: Maintain balanced portfolio allocations

#### 4. **Market Volume**
Verifies sufficient trading volume before executing.

**Configuration:**
- **Token Pair**: Trading pair to check (ETH/USDC, BTC/USDC, etc.)
- **Time Period**: 1 hour, 24 hours, or 7 days
- **Volume Condition**: Minimum volume threshold in USD

**Use Case**: Avoid trading during low liquidity periods

#### 5. **Gas Fee Limit**
Ensures gas costs don't exceed specified limits.

**Configuration:**
- **Network**: Blockchain network
- **Gas Price Limit**: Maximum acceptable gas price
- **Unit**: Gwei or USD
- **Priority**: Gas tier preference

**Use Case**: Avoid expensive transactions during network congestion

#### 6. **Safety Checks**
Implements multiple protection mechanisms.

**Configuration:**
- **Slippage Protection**: Enable with maximum slippage percentage
- **MEV Protection**: Protect against MEV attacks
- **Manual Confirmation**: Require user approval
- **Transaction Deadline**: Maximum time to execute (minutes)

**Use Case**: Protect against failed or exploited transactions

#### 7. **Loss Limits**
Implements stop-loss mechanisms to limit losses.

**Configuration:**
- **Loss Limit Type**: Percentage, absolute amount, or portfolio value
- **Maximum Loss**: Threshold amount
- **Time Period**: Per trade, daily, weekly, or monthly
- **Pause on Limit**: Automatically pause automation when triggered

**Use Case**: Risk management and capital preservation

---

### 🟣 ACTIONS (8 Types)
Actions are the operations performed when automation triggers.

#### 1. **Swap Tokens**
Exchanges one cryptocurrency for another.

**Configuration:**
- **Swap From**: Source token
- **Swap To**: Destination token
- **Amount**: Percentage of balance to swap
- **Network**: Blockchain for transaction
- **Send Alert**: Optional notification

**Example**: Swap 50% of ETH to USDC

#### 2. **Send/Transfer**
Moves tokens to another wallet address.

**Configuration:**
- **Token**: Cryptocurrency to send
- **Recipient Address**: Destination wallet
- **Amount Type**: Percentage of balance or fixed amount
- **Amount**: Quantity to send
- **Network**: Blockchain network

**Example**: Send 25% of USDC to cold storage wallet

#### 3. **Stake/Unstake**
Participates in staking protocols to earn rewards.

**Configuration:**
- **Action**: Stake or unstake
- **Protocol**: Lido, Rocket Pool, Frax, Compound, Aave
- **Token**: Asset to stake
- **Amount Type**: Percentage, fixed amount, or all available
- **Amount**: Quantity (if not "all available")

**Example**: Stake 2 ETH with Lido for stETH rewards

#### 4. **Provide Liquidity**
Adds tokens to liquidity pools on DEXs.

**Configuration:**
- **DEX Protocol**: Uniswap V3, SushiSwap, Curve, Balancer
- **Token A & B**: Trading pair tokens
- **Pool Fee Tier**: 0.01%, 0.05%, 0.3%, or 1.0%
- **Amount Type**: Percentage of balance or fixed USD amount
- **Auto-Compound**: Automatically reinvest rewards

**Example**: Provide $1000 to ETH/USDC pool on Uniswap V3

#### 5. **Claim Rewards**
Harvests yield and rewards from DeFi protocols.

**Configuration:**
- **Protocol**: Platform to claim from
- **Reward Type**: All rewards, staking, liquidity mining, governance, or fees
- **Minimum Claim Amount**: Threshold to avoid tiny claims
- **Auto-Reinvest Options**: Hold, restake, or swap rewards
- **Swap To**: Target token (if swapping rewards)

**Example**: Claim Compound rewards and restake automatically

#### 6. **Rebalance Portfolio**
Automatically adjusts portfolio allocations.

**Configuration:**
- **Strategy**: Target percentages, equal weight, or custom
- **Target Allocations**: Desired percentage for each token
- **Rebalance Threshold**: Percentage deviation trigger
- **DEX for Swaps**: Exchange to use for rebalancing
- **Consider Gas**: Factor gas costs into decisions

**Example**: Maintain 60% USDC, 40% ETH allocation

#### 7. **Send Alert**
Sends notifications about automation events.

**Configuration:**
- **Alert Type**: Push notification, email, webhook, Telegram, Discord
- **Alert Title**: Notification headline
- **Alert Message**: Detailed message content
- **Destination**: Email address, webhook URL, or chat ID
- **Priority Level**: Low, normal, high, or urgent
- **Include Data**: Attach automation details to alert

**Example**: Send email when price alert triggers

#### 8. **Execute Strategy**
Runs complex, multi-step DeFi strategies.

**Configuration:**
- **Strategy Type**: DCA, grid trading, momentum, mean reversion, arbitrage, custom
- **DCA Settings**: Purchase token, amount, frequency
- **Grid Settings**: Trading pair, price range, grid levels
- **Total Budget**: Maximum funds to allocate
- **Stop Conditions**: Profit targets and loss limits

**Example**: Execute $100 weekly DCA into ETH

---

## Building Automations

### Step 1: Plan Your Strategy
Before building, define:
- **Goal**: What do you want to achieve?
- **Trigger**: What event should start the automation?
- **Conditions**: What safety checks do you need?
- **Actions**: What should happen when triggered?

### Step 2: Create the Flow
1. **Add Trigger**: Drag a trigger from the left sidebar
2. **Configure Trigger**: Click the node to set parameters
3. **Add Conditions**: (Optional) Add filtering logic
4. **Add Actions**: Define what happens when triggered
5. **Connect Nodes**: Link nodes with connection lines

### Step 3: Test and Deploy
1. **Save**: Use the save button or `Ctrl+S`
2. **Simulate**: Test your logic with the simulation feature
3. **Check Requirements**: Ensure you have necessary balances
4. **Deploy**: Activate your automation

### Step 4: Monitor
- Use the right sidebar to monitor live simulation
- Check required vs. available balances
- Review automation status and performance

---

## Best Practices

### Safety First
- Always use **Safety Checks** conditions for important automations
- Set **Loss Limits** to protect capital
- Start with small amounts for testing
- Use **Gas Fee Limits** to avoid expensive transactions

### Efficiency
- Combine multiple actions in one automation when logical
- Use **Time Restrictions** to avoid weekend trading
- Set **Amount Limits** to prevent dust transactions
- Consider **Market Volume** conditions for better execution

### Monitoring
- Enable **Send Alert** actions for important events
- Use **Portfolio Percentage** conditions to maintain allocations
- Set up **Claim Rewards** automations to compound earnings
- Regular review and adjustment of strategies

### Common Patterns

#### **DCA Strategy**
```
Time Schedule → Amount Limits → Swap Tokens + Send Alert
```

#### **Stop Loss Protection**
```
Price Change → Portfolio Percentage → Swap Tokens + Send Alert
```

#### **Yield Farming**
```
Time Schedule → Gas Fee Limit → Claim Rewards → Provide Liquidity
```

#### **Portfolio Rebalancing**
```
Time Schedule → Portfolio Percentage → Rebalance Portfolio
```

---

## Keyboard Shortcuts

- `Ctrl/Cmd + B`: Toggle left sidebar
- `Delete` or `Backspace`: Delete selected nodes
- `Ctrl/Cmd + S`: Save automation (planned)

---

## Troubleshooting

### Node Configuration Issues
- **Problem**: Node shows only heading and buttons
- **Solution**: Check that node labels match between sidebar and configuration modal

### Connection Problems
- **Problem**: Can't connect nodes
- **Solution**: Ensure you're connecting output handles to input handles

### Missing Forms
- **Problem**: Configuration modal is empty
- **Solution**: Verify node type is properly set in the automation flow

### Performance Issues
- **Problem**: Canvas is slow or unresponsive
- **Solution**: Reduce number of nodes or refresh the page

---

## Technical Implementation

### Architecture
- **Frontend**: React 19.1 with TypeScript
- **Flow Engine**: React Flow for visual automation builder
- **Styling**: Tailwind CSS with pure black theme
- **State Management**: React hooks and context

### Node System
- **Trigger Nodes**: Green theme, single output handle
- **Condition Nodes**: Blue theme, input and output handles  
- **Action Nodes**: Purple theme, single input handle

### Data Flow
1. User drags nodes from sidebar to canvas
2. Nodes store configuration in their data property
3. Connections define execution order
4. Configuration modals update node parameters
5. Automation engine processes the complete flow

This system enables powerful, visual DeFi automation creation without requiring any coding knowledge.