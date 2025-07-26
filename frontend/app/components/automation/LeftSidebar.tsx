import { useState } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft, Zap, Clock, Wallet, DollarSign, Search, Shield, TrendingUp, AlertTriangle, Timer, Percent, ArrowRightLeft, Send, Bell, Coins, Gift, RefreshCw, Play } from 'lucide-react';

interface LeftSidebarProps {
  onToggle?: () => void;
}

export function LeftSidebar({ onToggle }: LeftSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    blocks: true,
    triggers: true,
    conditions: false,
    actions: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const triggerItems = [
    {
      name: 'Price Change',
      description: 'Token price movement',
      icon: DollarSign
    },
    {
      name: 'Time Schedule',
      description: 'Recurring schedule',
      icon: Clock
    },
    {
      name: 'Wallet Balance',
      description: 'Balance threshold',
      icon: Wallet
    },
    {
      name: 'Gas Price',
      description: 'Network gas fees',
      icon: Zap
    }
  ];

  const conditionItems = [
    {
      name: 'Amount Limits',
      description: 'Min/max amounts',
      icon: DollarSign
    },
    {
      name: 'Time Restrictions',
      description: 'Specific hours/days',
      icon: Timer
    },
    {
      name: 'Portfolio Percentage',
      description: 'Portfolio allocation %',
      icon: Percent
    },
    {
      name: 'Market Volume',
      description: 'Trading volume check',
      icon: TrendingUp
    },
    {
      name: 'Gas Fee Limit',
      description: 'Maximum gas cost',
      icon: Zap
    },
    {
      name: 'Safety Checks',
      description: 'Risk protection',
      icon: Shield
    },
    {
      name: 'Loss Limits',
      description: 'Stop-loss thresholds',
      icon: AlertTriangle
    }
  ];

  const actionItems = [
    {
      name: 'Swap Tokens',
      description: 'Exchange tokens',
      icon: ArrowRightLeft
    },
    {
      name: 'Send/Transfer',
      description: 'Move tokens to wallet',
      icon: Send
    },
    {
      name: 'Stake/Unstake',
      description: 'Staking operations',
      icon: Coins
    },
    {
      name: 'Provide Liquidity',
      description: 'Add to liquidity pools',
      icon: TrendingUp
    },
    {
      name: 'Claim Rewards',
      description: 'Harvest yield/rewards',
      icon: Gift
    },
    {
      name: 'Rebalance Portfolio',
      description: 'Auto-rebalancing',
      icon: RefreshCw
    },
    {
      name: 'Send Alert',
      description: 'Notifications & alerts',
      icon: Bell
    },
    {
      name: 'Execute Strategy',
      description: 'Complex DeFi actions',
      icon: Play
    }
  ];

  return (
    <div className="w-80 bg-neutral-900 border-r border-neutral-800 flex flex-col h-full overflow-hidden relative">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Block Palette Section */}
        <div className="p-4">
        <button
          onClick={() => toggleSection('blocks')}
          className="flex items-center gap-2 w-full text-left text-white hover:text-neutral-200 transition-colors mb-3"
        >
          {expandedSections.blocks ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <span className="font-medium">Block Palette</span>
        </button>

        {expandedSections.blocks && (
          <div className="space-y-2">
            {/* Placeholder for drag-and-drop blocks */}
            <div className="text-neutral-400 text-sm">
              Drag blocks to canvas to build your automation
            </div>
          </div>
        )}
      </div>

      {/* Triggers Section */}
      <div className="p-4 border-t border-neutral-800">
        <button
          onClick={() => toggleSection('triggers')}
          className="flex items-center gap-2 w-full text-left text-white hover:text-neutral-200 transition-colors mb-3"
        >
          {expandedSections.triggers ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <Zap className="w-4 h-4" />
          <span className="font-medium">Triggers</span>
        </button>

        {expandedSections.triggers && (
          <div className="space-y-2">
            {triggerItems.map((item) => (
              <div
                key={item.name}
                className="group cursor-pointer bg-neutral-800 hover:bg-neutral-700 rounded-lg p-3 transition-colors border border-neutral-700 hover:border-neutral-600"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/reactflow', JSON.stringify({
                    type: 'trigger',
                    data: { label: item.name, type: item.name.toLowerCase().replace(' ', '-') }
                  }));
                }}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-neutral-300 group-hover:text-white" />
                  <div>
                    <div className="text-white text-sm font-medium">{item.name}</div>
                    <div className="text-neutral-400 text-xs">{item.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conditions Section */}
      <div className="p-4 border-t border-neutral-800">
        <button
          onClick={() => toggleSection('conditions')}
          className="flex items-center gap-2 w-full text-left text-white hover:text-neutral-200 transition-colors mb-3"
        >
          {expandedSections.conditions ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <Search className="w-4 h-4" />
          <span className="font-medium">Conditions</span>
        </button>

        {expandedSections.conditions && (
          <div className="space-y-2">
            {conditionItems.map((item) => (
              <div
                key={item.name}
                className="group cursor-pointer bg-neutral-800 hover:bg-neutral-700 rounded-lg p-3 transition-colors border border-neutral-700 hover:border-neutral-600"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/reactflow', JSON.stringify({
                    type: 'condition',
                    data: { label: item.name, type: item.name.toLowerCase().replace(' ', '-') }
                  }));
                }}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-neutral-300 group-hover:text-white" />
                  <div>
                    <div className="text-white text-sm font-medium">{item.name}</div>
                    <div className="text-neutral-400 text-xs">{item.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div className="p-4 border-t border-neutral-800">
        <button
          onClick={() => toggleSection('actions')}
          className="flex items-center gap-2 w-full text-left text-white hover:text-neutral-200 transition-colors mb-3"
        >
          {expandedSections.actions ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <Play className="w-4 h-4" />
          <span className="font-medium">Actions</span>
        </button>

        {expandedSections.actions && (
          <div className="space-y-2">
            {actionItems.map((item) => (
              <div
                key={item.name}
                className="group cursor-pointer bg-neutral-800 hover:bg-neutral-700 rounded-lg p-3 transition-colors border border-neutral-700 hover:border-neutral-600"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/reactflow', JSON.stringify({
                    type: 'action',
                    data: { label: item.name, type: item.name.toLowerCase().replace(' ', '-') }
                  }));
                }}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-neutral-300 group-hover:text-white" />
                  <div>
                    <div className="text-white text-sm font-medium">{item.name}</div>
                    <div className="text-neutral-400 text-xs">{item.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
      
      {/* Hide Sidebar Button - Inside the sidebar */}
      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute top-4 right-4 p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center transition-colors z-10 cursor-pointer"
          title="Hide sidebar (Ctrl+B)"
        >
          <ChevronLeft className="w-4 h-4 text-neutral-400 hover:text-white" />
        </button>
      )}
    </div>
  );
}