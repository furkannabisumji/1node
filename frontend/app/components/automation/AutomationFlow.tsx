import { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
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

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
};

const createInitialNodes = (
  handleConfigure: (nodeData: any, nodeType: 'trigger' | 'condition' | 'action') => void,
  handleDelete: (nodeId: string) => void
): Node[] => [];

const initialEdges: Edge[] = [];

export function AutomationFlow() {
  const [configModal, setConfigModal] = useState<{
    isOpen: boolean;
    nodeType: 'trigger' | 'condition' | 'action';
    nodeLabel: string;
    nodeId?: string;
  }>({
    isOpen: false,
    nodeType: 'trigger',
    nodeLabel: '',
  });

  const handleNodeConfigure = useCallback((nodeData: any, nodeType: 'trigger' | 'condition' | 'action') => {
    console.log('Configure node:', { nodeData, nodeType, label: nodeData.label });
    setConfigModal({
      isOpen: true,
      nodeType,
      nodeLabel: nodeData.label,
    });
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(createInitialNodes(handleNodeConfigure, () => {}));
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const handleConfigSave = useCallback((config: any) => {
    // Here you would update the node with the new configuration
    console.log('Saving node configuration:', config);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const selectedNodes = nodes.filter(node => node.selected);
        selectedNodes.forEach(node => {
          if (node.id) {
            handleNodeDelete(node.id);
          }
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nodes, handleNodeDelete]);

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

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const nodeData = JSON.parse(type);
      const newNode: Node = {
        id: `${nodes.length + 1}`,
        type: nodeData.type,
        position,
        selected: false,
        data: { 
          label: nodeData.data.label,
          description: `Configure ${nodeData.data.label}`,
          status: 'unconfigured',
          nodeType: nodeData.type as 'trigger' | 'condition' | 'action',
          onConfigure: (data: any) => handleNodeConfigure(data, data.nodeType),
          onDelete: handleNodeDelete
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [nodes, setNodes, handleNodeConfigure, handleNodeDelete]
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
        nodeTypes={nodeTypes}
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
      />
    </div>
  );
}