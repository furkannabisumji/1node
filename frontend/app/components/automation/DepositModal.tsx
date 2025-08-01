import { useState, useEffect } from 'react';
import { X, ChevronDown, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';
import { useAutomationStore } from '~/stores/useAutomationStore';
import { useUSDCDeposit } from '~/hooks/useUSDCDeposit';
import { formatCost } from '~/utils/costCalculation';
import { SUPPORTED_CHAINS } from '~/utils/contracts';
import { toast } from 'react-toastify';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    costBreakdown,
    userDepositBalance,
    selectedDepositChain,
    setSelectedDepositChain,
  } = useAutomationStore();

  const {
    usdcBalance,
    depositBalance,
    approveUSDCSpending,
    deposit,
    needsApproval,
    isApprovePending,
    isDepositPending,
    isApproveSuccess,
    isDepositSuccess,
    refetchBalances,
    selectedChain,
  } = useUSDCDeposit();

  const requiredAmount = costBreakdown.total;
  const remainingAmount = Math.max(0, requiredAmount - userDepositBalance);
  const suggestedAmount = remainingAmount || requiredAmount;

  // Set suggested amount when modal opens
  useEffect(() => {
    if (isOpen && !amount) {
      setAmount(suggestedAmount.toFixed(2));
    }
  }, [isOpen, suggestedAmount]);

  // Handle successful transactions
  useEffect(() => {
    if (isDepositSuccess) {
      toast.success('Deposit successful!', {
        position: 'bottom-center',
        autoClose: 3000,
      });
      setIsProcessing(false);
      refetchBalances();
      onClose();
    }
  }, [isDepositSuccess, refetchBalances, onClose]);

  if (!isOpen) return null;

  const depositAmount = parseFloat(amount) || 0;
  const hasInsufficientUSDC = depositAmount > usdcBalance;
  const canProceed = depositAmount > 0 && !hasInsufficientUSDC && !isProcessing;

  const handleDeposit = async () => {
    if (!canProceed) return;

    setIsProcessing(true);
    try {
      // Check if approval is needed
      if (needsApproval(depositAmount)) {
        await approveUSDCSpending(depositAmount);
        // Wait for approval success before depositing
        // This will be handled by the useEffect watching isApproveSuccess
      } else {
        await deposit(depositAmount);
      }
    } catch (error) {
      console.error('Deposit failed:', error);
      toast.error('Deposit failed. Please try again.', {
        position: 'bottom-center',
        autoClose: 5000,
      });
      setIsProcessing(false);
    }
  };

  // Handle approval success -> proceed to deposit
  useEffect(() => {
    if (isApproveSuccess && isProcessing) {
      deposit(depositAmount);
    }
  }, [isApproveSuccess, isProcessing, deposit, depositAmount]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-neutral-900 border border-neutral-700 rounded-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-white">💰 Deposit Balance</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Chain Selection */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-white">🔗 Select Chain</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {(['optimism', 'etherlink'] as const).map((chain) => (
                <button
                  key={chain}
                  onClick={() => setSelectedDepositChain(chain)}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedDepositChain === chain
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <div className="font-medium text-sm">
                    {SUPPORTED_CHAINS[chain === 'optimism' ? 10 : 42793].name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Current Balances */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-white">💰 Current Balances</span>
            </div>
            
            <div className="bg-neutral-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">U</div>
                  <span className="text-white text-sm">USDC (Wallet)</span>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">{formatCost(usdcBalance)}</div>
                  <div className="text-neutral-400 text-xs">Available to deposit</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">D</div>
                  <span className="text-white text-sm">USDC (Deposited)</span>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">{formatCost(depositBalance)}</div>
                  <div className="text-neutral-400 text-xs">In automation contract</div>
                </div>
              </div>
            </div>
          </div>

          {/* Deposit Requirements */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-white">📊 Deposit Requirements</span>
            </div>
            
            <div className="bg-neutral-800 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between text-neutral-300">
                <span>Total Required:</span>
                <span className="text-white font-medium">{formatCost(requiredAmount)}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Current Deposit:</span>
                <span className="text-white font-medium">{formatCost(userDepositBalance)}</span>
              </div>
              <div className="flex justify-between text-neutral-300 pt-2 border-t border-neutral-700">
                <span>Still Need:</span>
                <span className={`font-medium ${
                  remainingAmount > 0 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {remainingAmount > 0 ? formatCost(remainingAmount) : '✓ Sufficient'}
                </span>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-white">Deposit Amount</label>
              <button
                onClick={() => setAmount(suggestedAmount.toFixed(2))}
                className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                Use suggested: {formatCost(suggestedAmount)}
              </button>
            </div>
            
            <div className="relative">
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-4 pr-16 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 text-sm font-medium">
                USDC
              </div>
            </div>
            
            {hasInsufficientUSDC && (
              <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Insufficient USDC balance</span>
              </div>
            )}
          </div>

          {/* Deposit Steps */}
          <div className="mb-6">
            <div className="text-sm font-medium text-white mb-2">Deposit Process</div>
            <div className="space-y-2 text-sm">
              <div className={`flex items-center gap-2 ${
                needsApproval(depositAmount) ? 'text-neutral-300' : 'text-green-400'
              }`}>
                {needsApproval(depositAmount) ? (
                  <div className="w-4 h-4 border border-neutral-500 rounded-full"></div>
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                <span>1. Approve USDC spending</span>
                {isApprovePending && (
                  <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              <div className={`flex items-center gap-2 ${
                isApprovePending || (!needsApproval(depositAmount) && !isDepositPending) ? 'text-neutral-300' : 'text-green-400'
              }`}>
                <div className="w-4 h-4 border border-neutral-500 rounded-full"></div>
                <span>2. Deposit USDC to contract</span>
                {isDepositPending && (
                  <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
            </div>
          </div>

          {/* Deposit Button */}
          <button 
            onClick={handleDeposit}
            disabled={!canProceed || isApprovePending || isDepositPending}
            className={`w-full font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              !canProceed || isApprovePending || isDepositPending
                ? 'bg-neutral-600 text-neutral-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
            }`}
          >
            {isApprovePending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Approving USDC...
              </>
            ) : isDepositPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Depositing...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4" />
                Deposit {amount ? formatCost(depositAmount) : 'USDC'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}