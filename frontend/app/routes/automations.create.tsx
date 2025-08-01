import { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import type { Node } from '@xyflow/react';
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

  const handleDeploy = useCallback(() => {
    setAutomationStatus('deployed');
  }, []);

  useEffect(() => {
    if (edges) {
      edges.forEach((edge) => {
        connectedNodeIds.add(edge.source);
        connectedNodeIds.add(edge.target);
      });
    }


    unconnectedRef.current = nodes.filter((node) => !connectedNodeIds.has(node.id));

  }, [nodes, edges])

  const handleSave = useCallback(async () => {
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

    const payload = {
      name: `${trigger.data.label} - ${action.data.label}`,
      description: 'Created from visual builder',
      trigger: {
        type: trigger.data.type,
        chainId: (trigger?.data?.config as any)?.chainId,
        config: trigger.data.config,
      },
      action: {
        type: action.data.type,
        config: action.data.config,
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
        toast.success('Automation created successfully!', {
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
        toast.error(res.data?.error || 'Failed to create automation', {
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
  }, []);

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
          onSave={handleSave}
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