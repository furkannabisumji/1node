import type { Node, Edge } from '@xyflow/react';

export interface CostItem {
  id: string;
  category: 'trigger' | 'action' | 'cross-chain' | 'platform' | 'buffer';
  name: string;
  description: string;
  cost: number;
  icon: string;
}

export interface CostBreakdown {
  items: CostItem[];
  subtotal: number;
  buffer: number;
  total: number;
}

// Node cost configuration
const NODE_COSTS = {
  // Triggers
  'PRICE_THRESHOLD': {
    base: 2.0,
    description: 'Price monitoring & API calls',
    category: 'trigger' as const,
    icon: '📈'
  },
  'WALLET_BALANCE': {
    base: 2.0,
    description: 'Balance checking & monitoring',
    category: 'trigger' as const,
    icon: '💰'
  },
  'GAS_PRICE': {
    base: 1.5,
    description: 'Gas price monitoring',
    category: 'trigger' as const,
    icon: '⛽'
  },
  'TIME_SCHEDULE': {
    base: 1.0,
    description: 'Scheduled execution',
    category: 'trigger' as const,
    icon: '⏰'
  },
  
  // Actions
  'FUSION_ORDER': {
    base: 7.5,
    description: 'Token swap via 1inch Fusion+',
    category: 'action' as const,
    icon: '🔄'
  },
  'TRANSFER': {
    base: 1.5,
    description: 'Token transfer',
    category: 'action' as const,
    icon: '📤'
  },
  'STAKE_UNSTAKE': {
    base: 3.0,
    description: 'Staking/Unstaking operations',
    category: 'action' as const,
    icon: '🥩'
  },
  'SEND_ALERT': {
    base: 0.5,
    description: 'Notification alerts',
    category: 'action' as const,
    icon: '🔔'
  },
} as const;

// Cross-chain operation costs
const CROSS_CHAIN_COST = 4.0;
const PLATFORM_FEE = 1.0;
const SAFETY_BUFFER_PERCENT = 0.20; // 20%

export function calculateCostBreakdown(nodes: Node[], edges: Edge[]): CostBreakdown {
  const items: CostItem[] = [];
  let subtotal = 0;

  // Analyze nodes for costs
  const nodesByType = nodes.reduce((acc, node) => {
    const nodeType = node.data?.type || node.type;
    if (!acc[nodeType]) {
      acc[nodeType] = [];
    }
    acc[nodeType].push(node);
    return acc;
  }, {} as Record<string, Node[]>);

  // Calculate costs for each node type
  Object.entries(nodesByType).forEach(([nodeType, nodeList]) => {
    const costConfig = NODE_COSTS[nodeType as keyof typeof NODE_COSTS];
    if (costConfig && nodeList.length > 0) {
      const totalCost = costConfig.base * nodeList.length;
      
      items.push({
        id: `${nodeType}-${nodeList.length}`,
        category: costConfig.category,
        name: `${costConfig.icon} ${getNodeDisplayName(nodeType)} (${nodeList.length}x)`,
        description: costConfig.description,
        cost: totalCost,
        icon: costConfig.icon,
      });
      
      subtotal += totalCost;
    }
  });

  // Check for cross-chain operations
  const hasCrossChain = checkForCrossChainOperations(nodes);
  if (hasCrossChain) {
    items.push({
      id: 'cross-chain',
      category: 'cross-chain',
      name: '🔗 Cross-chain Bridge',
      description: 'Bridge fees & cross-chain operations',
      cost: CROSS_CHAIN_COST,
      icon: '🔗',
    });
    subtotal += CROSS_CHAIN_COST;
  }

  // Platform fee
  items.push({
    id: 'platform-fee',
    category: 'platform',
    name: '📊 Platform Fee',
    description: 'Base automation platform fee',
    cost: PLATFORM_FEE,
    icon: '📊',
  });
  subtotal += PLATFORM_FEE;

  // Safety buffer
  const buffer = subtotal * SAFETY_BUFFER_PERCENT;
  items.push({
    id: 'safety-buffer',
    category: 'buffer',
    name: '🛡️ Safety Buffer (20%)',
    description: 'Buffer for gas price fluctuations',
    cost: buffer,
    icon: '🛡️',
  });

  const total = subtotal + buffer;

  return {
    items,
    subtotal,
    buffer,
    total,
  };
}

function getNodeDisplayName(nodeType: string): string {
  const displayNames: Record<string, string> = {
    'PRICE_THRESHOLD': 'Price Monitor',
    'WALLET_BALANCE': 'Balance Check',
    'GAS_PRICE': 'Gas Monitor',
    'TIME_SCHEDULE': 'Scheduler',
    'FUSION_ORDER': 'Token Swap',
    'TRANSFER': 'Transfer',
    'STAKE_UNSTAKE': 'Stake/Unstake',
    'SEND_ALERT': 'Alert',
  };
  
  return displayNames[nodeType] || nodeType;
}

function checkForCrossChainOperations(nodes: Node[]): boolean {
  // Check if any actions have different chain configurations
  const actionNodes = nodes.filter(node => node.type === 'action');
  const chainIds = new Set<number>();
  
  actionNodes.forEach(node => {
    const config = node.data?.config;
    if (config?.fromChain) chainIds.add(config.fromChain);
    if (config?.toChain) chainIds.add(config.toChain);
    if (config?.chainId) chainIds.add(config.chainId);
  });
  
  return chainIds.size > 1;
}

// Get cost for a single node (for tooltips/highlights)
export function getNodeCost(node: Node): number {
  const nodeType = node.data?.type || node.type;
  const costConfig = NODE_COSTS[nodeType as keyof typeof NODE_COSTS];
  return costConfig?.base || 0;
}

// Format cost for display
export function formatCost(cost: number): string {
  return `$${cost.toFixed(2)} USDC`;
}

// Get cost by category for summary display
export function getCostSummary(breakdown: CostBreakdown) {
  const summary = breakdown.items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { count: 0, total: 0 };
    }
    acc[item.category].count += 1;
    acc[item.category].total += item.cost;
    return acc;
  }, {} as Record<string, { count: number; total: number }>);
  
  return summary;
}