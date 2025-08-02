import {Play, AlertTriangle, Brain, Eye, Cog, BotIcon} from 'lucide-react';
import { useAutomationStore } from '~/stores/useAutomationStore';
import { formatCost } from '~/utils/costCalculation';

interface TopActionBarProps {
  status: 'draft' | 'deployed' | 'active';
  onDeploy: () => void;
}

export function TopActionBar({ status, onDeploy }: TopActionBarProps) {
  const {
    costBreakdown,
    userDepositBalance,
    depositStatus,
    getIsDeployReady,
    nodes
  } = useAutomationStore();
  
  const isDeployReady = getIsDeployReady();
  const hasNodes = nodes.length > 0;
  const remaining = Math.max(0, costBreakdown.total - userDepositBalance);
  
  const getDeployButtonConfig = () => {
    if (!hasNodes) {
      return {
        disabled: true,
        className: "flex items-center gap-2 bg-neutral-600 text-neutral-300 px-4 py-2 rounded-lg cursor-not-allowed",
        text: "Add Nodes First",
        icon: <Play className="w-4 h-4" />
      };
    }
    
    if (depositStatus === 'insufficient') {
      return {
        disabled: true,
        className: "flex items-center gap-2 bg-red-600/50 text-red-200 px-4 py-2 rounded-lg cursor-not-allowed",
        text: `Deposit Required (${formatCost(remaining)})`,
        icon: <AlertTriangle className="w-4 h-4" />
      };
    }
    
    if (depositStatus === 'loading') {
      return {
        disabled: true,
        className: "flex items-center gap-2 bg-yellow-600/50 text-yellow-200 px-4 py-2 rounded-lg cursor-not-allowed",
        text: "Confirming Deposit...",
        icon: <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      };
    }
    
    return {
      disabled: false,
      className: "flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer",
      text: "Deploy Automation",
      icon: <Play className="w-4 h-4" />
    };
  };
  
  const deployConfig = getDeployButtonConfig();
  
  return (
    <div className="bg-black border-b border-neutral-800 px-6 py-4">
      {/* Strategy Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-white mb-1">DeFi Automation Builder</h1>
          <p className="text-neutral-400 text-sm">
            {hasNodes ? `${nodes.length} node(s) configured • Required: ${formatCost(costBreakdown.total)}` : 'Build your automation by adding trigger and action nodes'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Deploy/Withdraw/Deactivate */}
          {status === 'draft' && (
            <button 
              onClick={deployConfig.disabled ? undefined : onDeploy}
              disabled={deployConfig.disabled}
              className={deployConfig.className}
              title={deployConfig.disabled ? 
                (!hasNodes ? "Add trigger and action nodes first" : 
                 depositStatus === 'insufficient' ? `You need ${formatCost(remaining)} more USDC to deploy` :
                 "Confirming deposit transaction") : 
                "Deploy your automation"}
            >
              {deployConfig.icon}
              {deployConfig.text}
            </button>
          )}

          {status === 'deployed' && (
            <>
              <button className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg transition-colors border border-neutral-600 cursor-pointer">
                Withdraw
              </button>
              <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer">
                <AlertTriangle className="w-4 h-4" />
                Deactivate
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}