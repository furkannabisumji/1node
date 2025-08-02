// stores/useAutomationStore.ts
import { create } from 'zustand';
import type { Node, Edge } from '@xyflow/react';
import { calculateCostBreakdown, type CostBreakdown } from '~/utils/costCalculation';

export type DepositStatus = 'insufficient' | 'sufficient' | 'loading';
export type SupportedChain = 'optimism' | 'etherlink';

interface AutomationState {
  // Flow state
  nodes: Node[];
  setNodesFlow: (nodes: Node[]) => void;
  edges: Edge[];
  setEdgesFlow: (edges: Edge[]) => void;
  
  // Deposit state
  costBreakdown: CostBreakdown;
  userDepositBalance: number;
  depositStatus: DepositStatus;
  selectedDepositChain: SupportedChain;
  isDepositLoading: boolean;
  
  // Actions
  updateCostBreakdown: () => void;
  setUserDepositBalance: (balance: number) => void;
  setDepositStatus: (status: DepositStatus) => void;
  setSelectedDepositChain: (chain: SupportedChain) => void;
  setIsDepositLoading: (loading: boolean) => void;
  forceStatusRecalculation: () => void;
  
  // Computed getters
  getIsDeployReady: () => boolean;
  getRequiredDeposit: () => number;
  getRemainingDeposit: () => number;
}

export const useAutomationStore = create<AutomationState>((set, get) => ({
  // Flow state
  nodes: [],
  setNodesFlow: (nodes) => {
    set({ nodes });
    // Automatically recalculate costs when nodes change
    get().updateCostBreakdown();
  },
  edges: [],
  setEdgesFlow: (edges) => {
    set({ edges });
    // Automatically recalculate costs when edges change
    get().updateCostBreakdown();
  },
  
  // Deposit state
  costBreakdown: { items: [], subtotal: 0, buffer: 0, total: 0 },
  userDepositBalance: 0,
  depositStatus: 'insufficient' as DepositStatus,
  selectedDepositChain: 'optimism' as SupportedChain,
  isDepositLoading: false,
  
  // Actions
  updateCostBreakdown: () => {
    const { nodes, edges } = get();
    const breakdown = calculateCostBreakdown(nodes, edges);
    set({ costBreakdown: breakdown });
    
    // Update deposit status based on balance vs requirement (with floating point tolerance)
    const { userDepositBalance } = get();
    const difference = breakdown.total - userDepositBalance;
    const newStatus: DepositStatus = difference <= 0.001 ? 'sufficient' : 'insufficient';
    set({ depositStatus: newStatus });
  },
  
  setUserDepositBalance: (balance) => {
    set({ userDepositBalance: balance });
    // Update status when balance changes (with floating point tolerance)
    const { costBreakdown } = get();
    const difference = costBreakdown.total - balance;
    const newStatus: DepositStatus = difference <= 0.001 ? 'sufficient' : 'insufficient';
    set({ depositStatus: newStatus });
  },
  
  setDepositStatus: (status) => set({ depositStatus: status }),
  setSelectedDepositChain: (chain) => set({ selectedDepositChain: chain }),
  setIsDepositLoading: (loading) => set({ isDepositLoading: loading }),
  
  forceStatusRecalculation: () => {
    const { costBreakdown, userDepositBalance } = get();
    const difference = costBreakdown.total - userDepositBalance;
    const newStatus: DepositStatus = difference <= 0.001 ? 'sufficient' : 'insufficient';
    set({ depositStatus: newStatus });
  },
  
  // Computed getters
  getIsDeployReady: () => {
    const { depositStatus, nodes } = get();
    const hasTrigger = nodes.some(node => node.type === 'trigger');
    const hasAction = nodes.some(node => node.type === 'action');
    return depositStatus === 'sufficient' && hasTrigger && hasAction;
  },
  
  getRequiredDeposit: () => {
    return get().costBreakdown.total;
  },
  
  getRemainingDeposit: () => {
    const { costBreakdown, userDepositBalance } = get();
    return Math.max(0, costBreakdown.total - userDepositBalance);
  },
}));
