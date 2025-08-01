import { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import type { Node } from '@xyflow/react';
import { useAccount } from 'wagmi';
import { AppLayout } from '~/components/layout/AppLayout';
import { AutomationFlow } from '~/components/automation/AutomationFlow';
import { LeftSidebar } from '~/components/automation/LeftSidebar';
import { RightSidebar } from '~/components/automation/RightSidebar';
import { TopActionBar } from '~/components/automation/TopActionBar';
import { WithdrawModal } from '~/components/automation/WithdrawModal';
import { DepositModal } from '~/components/automation/DepositModal';
import { useAutomationStore } from '~/stores/useAutomationStore';
import axiosInstance from '~/lib/axios';
import { Bounce, toast, ToastContainer } from 'react-toastify';

export default function CreateAutomation() {
  const { address } = useAccount();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [automationStatus, setAutomationStatus] = useState<'draft' | 'deployed' | 'active'>('draft');
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const unconnectedRef = useRef<Node[]>([]);
  const {
    nodes,
    edges,
  } = useAutomationStore();
  const connectedNodeIds = new Set<string>();
  // Use a ref to always get the latest nodes in handleSave
  const nodesRef = useRef(nodes);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  const handleDeploy = useCallback(async () => {
    const currentNodes = nodesRef.current;

    console.log("unconnected: ", unconnectedRef.current)
    if (unconnectedRef.current.length > 0) {
      toast.error(`${unconnectedRef.current.length} node(s) are not connected.`, {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
      return
    }
    // Save automation logic
    const trigger = currentNodes.find((n) => n.type === 'trigger');
    const action = currentNodes.find((n) => n.type === 'action');
    const conditions = currentNodes.filter((n) => n.type === 'condition');

    console.log(trigger, action)
    if (!trigger || !action) {
      toast.error('Trigger and Action nodes are required!', {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });

      return;
    }

    // Ensure receiver defaults to connected wallet address if empty
    const actionConfig = { ...(action.data.config || {}) } as any;
    if (actionConfig.receiver === '' && address) {
      actionConfig.receiver = address;
    }

    // Generate dynamic description based on node configurations
    const generateDescription = () => {
      const triggerConfig = trigger.data.config as any;
      const triggerType = trigger.data.label as string;
      const actionType = action.data.label as string;
      
      let description = '';
      
      // Trigger description - more detailed
      if (triggerType === 'Wallet Balance') {
        const conditionText = triggerConfig.condition === 'greater_than' ? 'exceeds' :
                             triggerConfig.condition === 'less_than' ? 'drops below' :
                             'equals';
        description += `When ${triggerConfig.token || 'token'} balance ${conditionText} ${triggerConfig.amount || 'amount'}`;
      } else if (triggerType === 'Price Change') {
        const operatorText = triggerConfig.operator === 'gte' ? 'hits' :
                            triggerConfig.operator === 'lte' ? 'drops to' :
                            triggerConfig.operator === 'gt' ? 'exceeds' :
                            triggerConfig.operator === 'lt' ? 'falls below' :
                            'reaches';
        description += `When ${triggerConfig.token || 'ETH'} ${operatorText} $${triggerConfig.threshold || 'target'}`;
      } else if (triggerType === 'Gas Price') {
        const conditionText = triggerConfig.condition === 'less_than' ? 'drops below' : 'exceeds';
        description += `When gas price ${conditionText} ${triggerConfig.gasLimit || 'limit'} USD`;
      } else if (triggerType === 'Time Schedule') {
        description += `On ${triggerConfig.scheduleType || 'schedule'} at ${triggerConfig.time || 'time'}`;
      } else {
        description += `When ${triggerType.toLowerCase()} conditions are met`;
      }
      
      description += ', ';
      
      // Action description - more detailed with token symbols
      if (actionType === 'Swap Tokens') {
        const fromChain = actionConfig.fromChain === 1 ? 'Ethereum' : 
                         actionConfig.fromChain === 10 ? 'Optimism' : 
                         actionConfig.fromChain === 42161 ? 'Arbitrum' : 
                         actionConfig.fromChain === 137 ? 'Polygon' : 'chain';
        const toChain = actionConfig.toChain === 1 ? 'Ethereum' : 
                       actionConfig.toChain === 10 ? 'Optimism' : 
                       actionConfig.toChain === 42161 ? 'Arbitrum' : 
                       actionConfig.toChain === 137 ? 'Polygon' : 'chain';
        
        // Get token symbols from addresses (basic mapping)
        const getTokenSymbol = (address: string) => {
          if (address === '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85') return 'USDC';
          if (address === '0xA0b86a33E6Fe3c4c4b389F8b4af2218D6e8E58D3') return 'USDC';
          return 'tokens';
        };
        
        const fromToken = getTokenSymbol(actionConfig.fromToken);
        const toToken = getTokenSymbol(actionConfig.toToken);
        
        if (fromChain !== toChain) {
          description += `swap ${fromToken} from ${fromChain} to ${toToken} on ${toChain} using Fusion+`;
        } else {
          description += `swap ${actionConfig.amount || ''} ${fromToken} to ${toToken} on ${fromChain}`;
        }
      } else if (actionType === 'Send/Transfer') {
        description += `send ${actionConfig.amount || 'amount'} ${actionConfig.token || 'tokens'} to ${actionConfig.recipient ? 'specified address' : 'wallet'}`;
      } else if (actionType === 'Stake/Unstake') {
        const actionText = actionConfig.action === 'unstake' ? 'unstake' : 'stake';
        description += `${actionText} ${actionConfig.amount || 'amount'} ${actionConfig.token || 'tokens'} on ${actionConfig.protocol || 'protocol'}`;
      } else if (actionType === 'Send Alert') {
        description += `send ${actionConfig.alertType || 'notification'} alert: "${actionConfig.title || 'Alert'}"`;
      } else {
        description += `execute ${actionType.toLowerCase()}`;
      }
      
      return description;
    };

    const payload = {
      name: `${trigger.data.label} - ${action.data.label}`,
      description: generateDescription(),
      trigger: {
        type: trigger.data.type,
        chainId: (trigger?.data?.config as any)?.chainId,
        config: trigger.data.config,
      },
      action: {
        type: action.data.type,
        config: actionConfig,
      },
      conditions: conditions.map((c) => ({
        type: c.type,
        config: c.data,
      })),
    };
    console.log(payload)
    try {
      const res = await axiosInstance.post('/automations', payload);
      console.log(res)
      if (res.status === 201) {
        setAutomationStatus('deployed');
        toast.success('Automation deployed successfully!', {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        });

      } else {
        toast.error(res.data?.error || 'Failed to deploy automation', {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        });

      }
    } catch (err: any) {
      console.error(err);
      const errorMsg = err?.response?.data?.error;
      if (errorMsg === 'Validation failed') {
        toast.error('Validation failed: Please check your trigger, action, and condition configurations.', {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        });
      } else {
        toast.error(errorMsg || 'Network error', {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        });
      }
    }
  }, [address]);

  useEffect(() => {
    if (edges) {
      edges.forEach((edge) => {
        connectedNodeIds.add(edge.source);
        connectedNodeIds.add(edge.target);
      });
    }


    unconnectedRef.current = nodes.filter((node) => !connectedNodeIds.has(node.id));

  }, [nodes, edges])


  const handleToggleLeftSidebar = useCallback(() => {
    setIsLeftSidebarOpen(prev => !prev);
  }, []);

  // Keyboard shortcut for toggling sidebar (Ctrl/Cmd + B)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        handleToggleLeftSidebar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleLeftSidebar]);


  return (
    <AppLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-black">
        {/* Top Action Bar */}
        <TopActionBar
          status={automationStatus}
          onDeploy={handleDeploy}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Sidebar */}
          {isLeftSidebarOpen && <LeftSidebar onToggle={handleToggleLeftSidebar} />}

          {/* Show Sidebar Button - When sidebar is hidden */}
          {!isLeftSidebarOpen && (
            <button
              onClick={handleToggleLeftSidebar}
              className="absolute top-4 left-4 p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center transition-colors z-10 cursor-pointer"
              title="Show sidebar (Ctrl+B)"
            >
              <ChevronRight className="w-4 h-4 text-neutral-400 hover:text-white" />
            </button>
          )}

          {/* Flow Canvas */}
          <div className="flex-1 relative">
            <AutomationFlow />
          </div>

          {/* Right Sidebar */}
          <RightSidebar
            onWithdraw={() => setIsWithdrawModalOpen(true)}
            onDeposit={() => setIsDepositModalOpen(true)}
            onDeploy={handleDeploy}
          />
        </div>

        {/* Modals */}
        <WithdrawModal
          isOpen={isWithdrawModalOpen}
          onClose={() => setIsWithdrawModalOpen(false)}
        />
        <DepositModal
          isOpen={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
        />
      </div>
    </AppLayout>
  );
}