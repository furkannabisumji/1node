import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Play, Settings, X } from 'lucide-react';

interface ActionNodeData {
  label: string;
  description: string;
  status: 'configured' | 'unconfigured';
  nodeType?: 'trigger' | 'condition' | 'action';
  onConfigure?: (nodeData: ActionNodeData) => void;
  onDelete?: (nodeId: string) => void;
}

export function ActionNode({ data, id }: NodeProps<ActionNodeData>) {
  const isConfigured = data.status === 'configured';

  const handleClick = () => {
    if (data.onConfigure) {
      data.onConfigure(data);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onDelete && id) {
      data.onDelete(id);
    }
  };

  return (
    <div 
      className={`
        min-w-[200px] rounded-lg border-2 p-4 shadow-lg cursor-pointer hover:border-purple-400 transition-colors
        ${isConfigured 
          ? 'bg-neutral-900 border-purple-500/50' 
          : 'bg-neutral-800 border-neutral-600'
        }
      `}
      onClick={handleClick}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: isConfigured ? '#8b5cf6' : '#6b7280',
          border: 'none',
          width: 8,
          height: 8,
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Play className={`w-4 h-4 ${isConfigured ? 'text-purple-500' : 'text-neutral-400'}`} />
          <span className="text-white font-medium text-sm">{data.label}</span>
        </div>
        <div className="flex items-center gap-1">
          <Settings className="w-3 h-3 text-neutral-500 hover:text-neutral-300" />
          <button
            onClick={handleDelete}
            className="w-4 h-4 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center transition-colors"
            title="Delete node"
          >
            <X className="w-2.5 h-2.5 text-red-400 hover:text-red-300" />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-neutral-400 text-xs mb-3">{data.description}</p>

      {/* Status Indicator */}
      <div className="flex items-center gap-2">
        <div 
          className={`
            w-2 h-2 rounded-full
            ${isConfigured ? 'bg-purple-500' : 'bg-yellow-500'}
          `}
        />
        <span className="text-xs text-neutral-400">
          {isConfigured ? 'Configured' : 'Needs Setup'}
        </span>
      </div>
    </div>
  );
}