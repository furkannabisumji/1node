import { useState, useEffect } from 'react';
import { Play, DollarSign, AlertTriangle, Plus, ChevronDown } from 'lucide-react';
import { useAutomationStore } from '~/stores/useAutomationStore';
import { SUPPORTED_CHAINS } from '~/utils/contracts';
import { CostBreakdown } from './CostBreakdown';
import { formatCost } from '~/utils/costCalculation';
import { useUSDCDeposit } from '~/hooks/useUSDCDeposit';
import { toast } from 'react-toastify';

interface RightSidebarProps {
  onWithdraw: () => void;
  onDeploy: () => void;
}

export function RightSidebar({ onWithdraw, onDeploy }: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<'simulation' | 'requirements' | 'insights'>('requirements');
  const [additionalAmount, setAdditionalAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const {
    costBreakdown,
    userDepositBalance,
    depositStatus,
    getIsDeployReady,
    nodes,
    selectedDepositChain,
    setSelectedDepositChain,
  } = useAutomationStore();
  
  const {
    usdcBalance,
    approveUSDCSpending,
    deposit,
    needsApproval,
    isApprovePending,
    isDepositPending,
    isApproveSuccess,
    isDepositSuccess,
    refetchBalances,
  } = useUSDCDeposit();
  
  const isDeployReady = getIsDeployReady();
  const hasNodes = nodes.length > 0;
  const remaining = Math.max(0, costBreakdown.total - userDepositBalance);
  const additionalAmountValue = parseFloat(additionalAmount) || 0;
  const totalDepositAmount = remaining + additionalAmountValue;
  const hasInsufficientUSDC = totalDepositAmount > 0 && totalDepositAmount > usdcBalance;
  const canDeposit = totalDepositAmount > 0 && !hasInsufficientUSDC && !isProcessing;

  // Debug logging to help identify the issue
  console.log('Debug values:', {
    costBreakdownTotal: costBreakdown.total,
    userDepositBalance,
    remaining,
    additionalAmountValue,
    totalDepositAmount,
    usdcBalance,
    hasInsufficientUSDC,
    canDeposit
  });

  const handleDeposit = async () => {
    console.log('handleDeposit called, canDeposit:', canDeposit);
    
    if (!canDeposit) {
      console.log('Cannot deposit - canDeposit is false');
      return;
    }

    console.log('Setting isProcessing to true');
    setIsProcessing(true);
    
    try {
      console.log('Checking if approval is needed for amount:', totalDepositAmount);
      // Check if approval is needed
      if (needsApproval(totalDepositAmount)) {
        console.log('Approval needed, calling approveUSDCSpending');
        await approveUSDCSpending(totalDepositAmount);
        console.log('Approval transaction submitted');
        // Wait for approval success before depositing
      } else {
        console.log('No approval needed, calling deposit directly');
        await deposit(totalDepositAmount);
        console.log('Deposit transaction submitted');
      }
    } catch (error) {
      console.error('Deposit failed:', error);
      
      // Check for MetaMask circuit breaker error
      const errorMessage = (error as any)?.message || '';
      const errorData = (error as any)?.data;
      const isCircuitBreakerError = errorMessage.includes('circuit breaker') || 
                                   errorData?.cause?.isBrokenCircuitError;
      
      if (isCircuitBreakerError) {
        toast.error('MetaMask network issue detected. Please try again in a moment.', {
          position: 'bottom-center',
          autoClose: 7000,
        });
      } else if (errorMessage.includes('User rejected')) {
        toast.error('Transaction cancelled by user.', {
          position: 'bottom-center',
          autoClose: 3000,
        });
      } else {
        toast.error('Deposit failed. Please try again.', {
          position: 'bottom-center',
          autoClose: 5000,
        });
      }
      
      setIsProcessing(false);
    }
  };

  // Handle approval success -> proceed to deposit
  useEffect(() => {
    if (isApproveSuccess && isProcessing) {
      const handleDepositAfterApproval = async () => {
        try {
          await deposit(totalDepositAmount);
        } catch (error) {
          console.error('Deposit after approval failed:', error);
          
          // Check for MetaMask circuit breaker error
          const errorMessage = (error as any)?.message || '';
          const errorData = (error as any)?.data;
          const isCircuitBreakerError = errorMessage.includes('circuit breaker') || 
                                       errorData?.cause?.isBrokenCircuitError;
          
          if (isCircuitBreakerError) {
            toast.error('MetaMask network issue detected. Please try again in a moment.', {
              position: 'bottom-center',
              autoClose: 7000,
            });
          } else if (errorMessage.includes('User rejected')) {
            toast.error('Transaction cancelled by user.', {
              position: 'bottom-center',
              autoClose: 3000,
            });
          } else {
            toast.error('Deposit failed. Please try again.', {
              position: 'bottom-center',
              autoClose: 5000,
            });
          }
          
          setIsProcessing(false);
        }
      };
      
      handleDepositAfterApproval();
    }
  }, [isApproveSuccess, isProcessing, deposit, totalDepositAmount]);

  // Handle successful deposit
  useEffect(() => {
    if (isDepositSuccess) {
      toast.success('Deposit successful!', {
        position: 'bottom-center',
        autoClose: 3000,
      });
      
      // Refetch balances first, then reset processing state
      refetchBalances();
      
      // Reset local state after a short delay to ensure state updates propagate
      setTimeout(() => {
        setIsProcessing(false);
        setAdditionalAmount('');
      }, 200);
    }
  }, [isDepositSuccess, refetchBalances]);

  return (
    <div className="w-96 bg-neutral-900 border-l border-neutral-800 flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">

        {/* Secondary Actions */}
        <div className="flex items-center gap-2 px-4 py-3 w-full box-border overflow-x-auto">
          {/* <button onClick={() => setActiveTab('simulation')} className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
            <Eye className="w-4 h-4" />
            Simulation
          </button> */}
          <button onClick={() => setActiveTab('requirements')} className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
            <AlertTriangle className="w-4 h-4" />
            Requirements
          </button>
          {/* <button onClick={() => setActiveTab('insights')} className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
            <BotIcon className="w-4 h-4" />
            AI Insights
          </button> */}
        </div>

        {/* {activeTab === 'simulation' && (
          <>
            Live Simulation Section
            <div className="p-4">
              <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
                <div className="flex items-center gap-2 mb-4">
                  <Play className="w-4 h-4 text-green-500" />
                  <span className="text-white font-medium">Live Simulation</span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Status</span>
                    <span className="text-green-500 font-medium">Ready</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">ETH Price</span>
                    <span className="text-white">$2493.32</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Trigger at</span>
                    <span className="text-red-400">$2,902.99 (-10%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Current Gas</span>
                    <span className="text-blue-400">$3.24</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-700">
                  <div className="text-neutral-400 text-xs mb-1">Expected Outcome</div>
                  <div className="text-white text-sm font-medium">Swap 0.5 ETH → ~$1,281</div>
                </div>
              </div>
            </div>

            Live Simulation Steps
            <div className="px-4 pb-4">
              <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-white font-medium">Live Simulation</span>
                </div>

                <div className="space-y-3">
                  Step 1
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="text-white text-sm">Price Monitor Active</div>
                      <div className="text-neutral-400 text-xs">Checking every 30s</div>
                    </div>
                  </div>

                  Step 2
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-neutral-600 rounded-full"></div>
                    <div>
                      <div className="text-neutral-400 text-sm">Trigger Condition</div>
                      <div className="text-neutral-500 text-xs">Waiting for -10% drop</div>
                    </div>
                  </div>

                  Step 3
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-neutral-600 rounded-full"></div>
                    <div>
                      <div className="text-neutral-400 text-sm">Execute Swap</div>
                      <div className="text-neutral-500 text-xs">~15s execution time</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )} */}

        {activeTab === 'requirements' && (
          <>
            {hasNodes ? (
              <>
                {/* Cost Breakdown */}
                <div className="px-4 pb-4">
                  <CostBreakdown
                    breakdown={costBreakdown}
                    userBalance={userDepositBalance}
                    isLoading={false}
                  />
                </div>
                
                {/* Deposit Section */}
                {depositStatus === 'insufficient' && (
              <div className="px-4 pb-4">
                <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-4 h-4 text-blue-500" />
                    <span className="text-white font-medium">Deposit USDC</span>
                  </div>
                  
                  {/* Chain Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">🔗 Select Chain</label>
                    <div className="relative">
                      <select
                        value={selectedDepositChain}
                        onChange={(e) => setSelectedDepositChain(e.target.value as 'optimism' | 'etherlink')}
                        className="w-full bg-neutral-700 border border-neutral-600 rounded-lg pl-3 pr-10 py-2 text-white text-sm focus:outline-none appearance-none cursor-pointer"
                      >
                        {(['optimism', 'etherlink'] as const).map((chain) => (
                          <option key={chain} value={chain}>
                            {SUPPORTED_CHAINS[chain === 'optimism' ? 10 : 42793].name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* Deposit Breakdown */}
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between text-neutral-300">
                      <span>Required (minimum):</span>
                      <span className="text-red-400 font-medium">{formatCost(remaining)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-300">
                      <span>Additional for trading:</span>
                      <span className="text-blue-400 font-medium">{formatCost(additionalAmountValue)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-300 pt-2 border-t border-neutral-700 font-semibold">
                      <span>Total deposit:</span>
                      <span className="text-white font-medium">{formatCost(totalDepositAmount)}</span>
                    </div>
                  </div>
                  
                  {/* Additional Amount Input */}
                  <div className="mb-4">
                    <label className="block text-xs text-neutral-400
                     mb-2">
                      💰 Funds for trading opportunities
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={additionalAmount}
                        onChange={(e) => setAdditionalAmount(e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full bg-neutral-700 border border-neutral-600 rounded-lg pl-3 pr-12 py-2 text-white text-sm placeholder-neutral-400 focus:outline-none"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 text-xs">
                        USDC
                      </div>
                    </div>
                  </div>
                  
                  {/* Wallet Balance Info */}
                  <div className="text-xs text-neutral-400 mb-4">
                    Wallet balance: {formatCost(usdcBalance)} USDC
                  </div>
                  
                  {hasInsufficientUSDC && (
                    <div className="flex items-center gap-2 mb-4 text-red-400 text-xs">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Insufficient USDC (need {formatCost(totalDepositAmount)})</span>
                    </div>
                  )}
                  
                  {/* Deposit Process Steps */}
                  <div className="mb-4">
                    <div className="text-xs text-neutral-400 mb-2">Process:</div>
                    <div className="space-y-1 text-xs">
                      <div className={`flex items-center gap-2 ${
                        needsApproval(totalDepositAmount) ? 'text-neutral-300' : 'text-green-400'
                      }`}>
                        <div className="w-2 h-2 rounded-full border border-neutral-500"></div>
                        <span>1. Approve USDC</span>
                        {isApprovePending && (
                          <div className="w-2 h-2 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-neutral-300">
                        <div className="w-2 h-2 rounded-full border border-neutral-500"></div>
                        <span>2. Deposit to contract</span>
                        {isDepositPending && (
                          <div className="w-2 h-2 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Deposit Button */}
                  <button
                    onClick={handleDeposit}
                    disabled={!canDeposit || isApprovePending || isDepositPending}
                    className={`w-full py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 ${
                      !canDeposit || isApprovePending || isDepositPending
                        ? 'bg-neutral-600 text-neutral-300 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    }`}
                  >
                    {isApprovePending ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Approving...
                      </>
                    ) : isDepositPending ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Depositing...
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        Deposit {formatCost(totalDepositAmount)}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
            
                {/* Available Balances */}
                {userDepositBalance > 0 && (
                  <div className="px-4 pb-4">
                    <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
                      <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-4 h-4 text-blue-500" />
                        <span className="text-white font-medium">Your Deposit Balance</span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">U</div>
                            <span className="text-white text-sm">USDC</span>
                          </div>
                          <div className="text-right">
                            <div className="text-white text-sm">{formatCost(userDepositBalance)}</div>
                            <div className={`text-xs ${
                              depositStatus === 'sufficient' ? 'text-green-500' : 'text-yellow-500'
                            }`}>
                              {depositStatus === 'sufficient' ? '✓ Sufficient' : '⚠ Need more'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={onWithdraw}
                        className="w-full mt-4 bg-neutral-700 hover:bg-neutral-600 text-white py-2 rounded-lg transition-colors text-sm cursor-pointer"
                      >
                        Withdraw Balance
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="px-4 pb-4">
                <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700 text-center">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Plus className="w-8 h-8 text-neutral-400" />
                    </div>
                  </div>
                  <h3 className="text-white font-medium mb-2">No Nodes Selected</h3>
                  <p className="text-neutral-400 text-sm mb-4">
                    Add trigger and action nodes from the left sidebar to see cost breakdown and deposit requirements.
                  </p>
                  <div className="text-xs text-neutral-500">
                    Start by dragging a trigger node to the canvas
                  </div>
                </div>
              </div>
            )}
          </>
        )}


      </div>

      {/* Fixed Deploy Button */}
      <div className="p-4 border-t border-neutral-800 bg-neutral-900">
        <button 
          onClick={isDeployReady ? onDeploy : undefined}
          disabled={!isDeployReady}
          className={`w-full py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${
            !hasNodes
              ? 'bg-neutral-600 text-neutral-300 cursor-not-allowed'
              : depositStatus === 'insufficient'
              ? 'bg-red-600/50 text-red-200 cursor-not-allowed'
              : depositStatus === 'loading'
              ? 'bg-yellow-600/50 text-yellow-200 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
          }`}
          title={
            !hasNodes
              ? 'Add trigger and action nodes first'
              : depositStatus === 'insufficient'
              ? `Deposit ${formatCost(remaining)} more USDC to deploy`
              : depositStatus === 'loading'
              ? 'Confirming deposit transaction'
              : 'Deploy your automation'
          }
        >
          {depositStatus === 'loading' ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : !hasNodes ? (
            <AlertTriangle className="w-4 h-4" />
          ) : depositStatus === 'insufficient' ? (
            <DollarSign className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          
          {!hasNodes
            ? 'Add Nodes First'
            : depositStatus === 'insufficient'
            ? `Deposit ${formatCost(remaining)}`
            : depositStatus === 'loading'
            ? 'Confirming Deposit...'
            : 'Deploy Automation'
          }
        </button>
      </div>
    </div >
  );
}