import { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TriggerNode } from './nodes/TriggerNode';
import { ActionNode } from './nodes/ActionNode';
import { ConditionNode } from './nodes/ConditionNode';
import { NodeConfigModal } from './NodeConfigModal';
import { useAutomationStore } from '~/stores/useAutomationStore';

// Map frontend node labels to backend API types
const getBackendNodeType = (label: string): string => {
  const mapping: Record<string, string> = {
    // Triggers
    'Price Change': 'PRICE_THRESHOLD',
    'Wallet Balance': 'WALLET_BALANCE', 
    'Gas Price': 'GAS_PRICE',
    'Time Schedule': 'TIME_SCHEDULE',
    
    // Actions
    'Swap Tokens': 'FUSION_ORDER',
    'Swap & Alert': 'FUSION_ORDER',
    'Send/Transfer': 'TRANSFER',
    'Stake/Unstake': 'STAKE_UNSTAKE',
    'Send Alert': 'SEND_ALERT',
    'Provide Liquidity': 'PROVIDE_LIQUIDITY',
    'Claim Rewards': 'CLAIM_REWARDS',
    'Rebalance Portfolio': 'REBALANCE_PORTFOLIO',
    'Execute Strategy': 'EXECUTE_STRATEGY',
    
    // Conditions (might not have specific backend types, using labels for now)
    'Amount Limits': 'AMOUNT_LIMITS',
    'Time Restrictions': 'TIME_RESTRICTIONS', 
    'Portfolio Percentage': 'PORTFOLIO_PERCENTAGE',
    'Market Volume': 'MARKET_VOLUME',
    'Gas Fee Limit': 'GAS_FEE_LIMIT',
    'Safety Checks': 'SAFETY_CHECKS',
    'Loss Limits': 'LOSS_LIMITS',
  };
  
  return mapping[label] || label;
};

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
};

const createInitialNodes = (): Node[] => [];

const initialEdges: Edge[] = [];

function AutomationFlowInner() {
  const { screenToFlowPosition } = useReactFlow();
  const [configModal, setConfigModal] = useState<{
    isOpen: boolean;
    nodeType: 'trigger' | 'condition' | 'action';
    nodeLabel: string;
    nodeId?: string;
    existingConfig?: any;
  }>({
    isOpen: false,
    nodeType: 'trigger',
    nodeLabel: '',
  });

  const {
    setNodesFlow,
    setEdgesFlow
  } = useAutomationStore();

  const handleNodeConfigure = useCallback((nodeData: any, nodeType: 'trigger' | 'condition' | 'action', nodeId: string) => {
    console.log('Configure node:', { nodeData, nodeType, label: nodeData.label, nodeId, config: nodeData.config });
    setConfigModal({
      isOpen: true,
      nodeType,
      nodeLabel: nodeData.label,
      nodeId,
      existingConfig: nodeData.config,
    });
  }, []);


  const [nodes, setNodes, onNodesChange] = useNodesState(createInitialNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodesFlow(nodes)
    setEdgesFlow(edges)
  }, [nodes, edges])


  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const handleConfigSave = useCallback((config: any) => {
    console.log('Saving config:', config, 'for nodeId:', configModal.nodeId);
    
    if (!configModal.nodeId) {
      console.error('No nodeId found in configModal state');
      return;
    }

    // Update the specific node with the new configuration
    setNodes((nds) => {
      const updatedNodes = nds.map((node) =>
        node.id === configModal.nodeId
          ? { 
              ...node, 
              data: { 
                ...node.data, 
                config,
                status: 'configured',
                description: `Configured ${node.data.label}`
              }
            }
          : node
      );
      console.log('Updated nodes:', updatedNodes);
      return updatedNodes;
    });

    // Close the modal
    setConfigModal(prev => ({ ...prev, isOpen: false }));
  }, [configModal.nodeId]);

  // Handle keyboard shortcuts with modal and input field checks
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't delete nodes if configuration modal is open
      if (configModal.isOpen) {
        return;
      }

      // Don't delete nodes if user is typing in an input field
      const activeElement = document.activeElement;
      const isTypingInInput = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        (activeElement as HTMLElement).isContentEditable
      );

      if (isTypingInInput) {
        return;
      }

      // Only delete on Delete key (not Backspace to be extra safe)
      if (event.key === 'Delete') {
        const selectedNodes = nodes.filter(node => node.selected);
        if (selectedNodes.length > 0) {
          event.preventDefault(); // Prevent any default behavior
          selectedNodes.forEach(node => {
            if (node.id) {
              handleNodeDelete(node.id);
            }
          });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nodes, handleNodeDelete, configModal.isOpen]);

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        type: 'smoothstep',
        style: { stroke: '#10b981', strokeWidth: 2 },
        markerEnd: {
          type: 'arrowclosed',
          color: '#10b981',
        },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const nodeData = JSON.parse(type);
      const newNode: Node = {
        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: nodeData.type,
        position,
        selected: false,
        data: {
          label: nodeData.data.label,
          description: `Configure ${nodeData.data.label}`,
          status: 'unconfigured',
          nodeType: nodeData.type as 'trigger' | 'condition' | 'action',
          type: getBackendNodeType(nodeData.data.label),
          onConfigure: (data: any, nodeId: string) => handleNodeConfigure(data, data.nodeType, nodeId),
          onDelete: handleNodeDelete
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [nodes, setNodes, handleNodeConfigure, handleNodeDelete, screenToFlowPosition]
  );

  return (
    <div className="w-full h-full bg-black">
      <style dangerouslySetInnerHTML={{
        __html: `
          .react-flow__minimap {
            display: none !important;
          }
          .react-flow__panel.react-flow__minimap {
            display: none !important;
          }
        `
      }} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes as any}
        fitView
        nodesConnectable={true}
        nodesDraggable={true}
        elementsSelectable={true}
        selectNodesOnDrag={false}
        style={{ background: '#000000' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#404040"
        />
      </ReactFlow>

      {/* Node Configuration Modal */}
      <NodeConfigModal
        isOpen={configModal.isOpen}
        onClose={() => setConfigModal(prev => ({ ...prev, isOpen: false }))}
        nodeType={configModal.nodeType}
        nodeLabel={configModal.nodeLabel}
        onSave={handleConfigSave}
        existingConfig={configModal.existingConfig}
      />
    </div>
  );
}

export function AutomationFlow() {
  return (
    <ReactFlowProvider>
      <AutomationFlowInner />
    </ReactFlowProvider>
  );
}