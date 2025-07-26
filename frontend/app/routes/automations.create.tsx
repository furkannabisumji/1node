import { useState, useCallback, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { AppLayout } from '~/components/layout/AppLayout';
import { AutomationFlow } from '~/components/automation/AutomationFlow';
import { LeftSidebar } from '~/components/automation/LeftSidebar';
import { RightSidebar } from '~/components/automation/RightSidebar';
import { TopActionBar } from '~/components/automation/TopActionBar';
import { WithdrawModal } from '~/components/automation/WithdrawModal';
import { DepositModal } from '~/components/automation/DepositModal';

export default function CreateAutomation() {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [automationStatus, setAutomationStatus] = useState<'draft' | 'deployed' | 'active'>('draft');
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);

  const handleDeploy = useCallback(() => {
    setAutomationStatus('deployed');
  }, []);

  const handleSave = useCallback(() => {
    // Save automation logic
    console.log('Saving automation...');
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