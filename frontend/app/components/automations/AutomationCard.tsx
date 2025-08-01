import { CheckCircle, Pause, Eye, Settings } from 'lucide-react';
import { Link } from 'react-router';

interface Automation {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  triggers: Array<{
    id: string;
    type: string;
    chainId: number;
    config: any;
  }>;
  actions: Array<{
    id: string;
    type: string;
    chainId: number | null;
    config: any;
  }>;
  conditions: Array<any>;
  executions: Array<any>;
  _count: {
    executions: number;
  };
}

interface AutomationCardProps {
  automation: Automation;
}

export function AutomationCard({ automation }: AutomationCardProps) {
  const status = automation.isActive ? 'active' : 'paused';
  
  const getStatusIcon = (isActive: boolean) => {
    return isActive 
      ? <CheckCircle className="w-4 h-4 text-green-500" />
      : <Pause className="w-4 h-4 text-yellow-500" />;
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Active' : 'Paused';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-500' : 'text-yellow-500';
  };

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1: return 'Ethereum';
      case 10: return 'Optimism';
      case 42161: return 'Arbitrum';
      case 137: return 'Polygon';
      default: return `Chain ${chainId}`;
    }
  };

  const getTriggerDescription = () => {
    const trigger = automation.triggers[0];
    if (!trigger) return 'No trigger configured';
    
    if (trigger.type === 'PRICE_THRESHOLD') {
      const config = trigger.config;
      const operatorText = config.operator === 'gte' ? 'hits' : 
                         config.operator === 'lte' ? 'drops to' : 
                         config.operator === 'gt' ? 'exceeds' : 
                         config.operator === 'lt' ? 'falls below' : 'reaches';
      return `${config.token} ${operatorText} $${config.threshold}`;
    } else if (trigger.type === 'WALLET_BALANCE') {
      return `Wallet balance condition`;
    }
    return trigger.type;
  };

  const getActionDescription = () => {
    const action = automation.actions[0];
    if (!action) return 'No action configured';
    
    if (action.type === 'FUSION_ORDER') {
      const config = action.config;
      const fromChain = getNetworkName(config.fromChain);
      const toChain = getNetworkName(config.toChain);
      return `Swap ${config.amount} tokens from ${fromChain} to ${toChain}`;
    }
    return action.type;
  };

  const primaryChainId = automation.triggers[0]?.chainId || automation.actions[0]?.chainId || 1;

  return (
    <div className=" rounded-lg border border-neutral-800 p-6 pb-0">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 flex justify-between items-center">
       <div >
         <h3 className="text-white font-semibold text-lg mb-1">{automation.name}</h3>
         <div className="flex items-center gap-2 mb-3">
           {getStatusIcon(automation.isActive)}
           <span className={`text-sm font-medium ${getStatusColor(automation.isActive)}`}>
              {getStatusText(automation.isActive)}
            </span>
         </div>
       </div>
          <div className="text-right">
            <span className="text-neutral-400 text-sm bg-neutral-800 px-2 py-1 rounded">
              {getNetworkName(primaryChainId)}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-neutral-300 text-sm">{automation.description}</p>
      </div>

      {/* Trigger and Action */}
      <div className="space-y-3 mb-6">
        <div>
          <span className="text-neutral-400 text-sm">Trigger: </span>
          <span className="text-white text-sm">{getTriggerDescription()}</span>
        </div>
        <div>
          <span className="text-neutral-400 text-sm">Action: </span>
          <span className="text-white text-sm">{getActionDescription()}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between mb-4 text-sm border-t border-neutral-800 pt-4">
     <div className="flex items-center gap-2 ">
       <div>
       <span className="text-neutral-400">Created: </span>
       <span className="text-white font-medium">{new Date(automation.createdAt).toLocaleDateString()}</span>
     </div>
       <div>
         <span className="text-neutral-400">Executions: </span>
         <span className="text-green-500 font-medium">{automation._count.executions}</span>
       </div>
     </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <Link 
            to={`/automations/${automation.id}`}
            className="p-2 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 text-neutral-400 hover:text-white" />
          </Link>
          <button className="p-2 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer">
            <Settings className="w-4 h-4 text-neutral-400 hover:text-white" />
          </button>
        </div>
      </div>

    </div>
  );
}