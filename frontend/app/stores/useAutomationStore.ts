// stores/useAutomationStore.ts
import { create } from 'zustand';
import type { Node, Edge } from '@xyflow/react';

interface AutomationState {
  nodes: Node[];
  setNodesFlow: (nodes: Node[]) => void;
  edges: Edge[];
  setEdgesFlow: (edges: Edge[]) => void;
}

export const useAutomationStore = create<AutomationState>((set) => ({
  nodes: [],
  setNodesFlow: (nodes) => set({ nodes }),
  edges: [],
  setEdgesFlow: (edges) => set({ edges }),
}));
