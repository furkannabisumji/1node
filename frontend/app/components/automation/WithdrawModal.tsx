import { useState, useEffect } from 'react';
import { X, ChevronDown, AlertTriangle, CheckCircle, DollarSign, ArrowDownLeft } from 'lucide-react';
import { useMultiChainWithdrawals } from '~/hooks/useUSDCWithdraw';
import { formatCost } from '~/utils/costCalculation';
import { SUPPORTED_CHAINS } from '~/utils/contracts';
import { toast } from 'react-toastify';
import type { SupportedChain } from '~/stores/useAutomationStore';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const [selectedChain, setSelectedChain] = useState<SupportedChain>('optimism');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    optimism,
    etherlink,
    totalBalance,
    hasAnyBalance,
    refetchAll,
  } = useMultiChainWithdrawals();

  const currentChainData = selectedChain === 'optimism' ? optimism : etherlink;
  const withdrawAmount = parseFloat(amount) || 0;
  const canWithdraw = withdrawAmount > 0 && withdrawAmount <= currentChainData.depositBalance && !isProcessing;

  // Handle successful withdrawal
  useEffect(() => {
    if (currentChainData.isWithdrawSuccess) {
      toast.success(`Successfully withdrew ${formatCost(withdrawAmount)} from ${selectedChain}!`, {
        position: 'bottom-center',
        autoClose: 3000,
      });
      setAmount('');
      setIsProcessing(false);
      refetchAll();
      onClose();
    }
  }, [currentChainData.isWithdrawSuccess, withdrawAmount, selectedChain, refetchAll, onClose]);

  // Handle withdrawal errors
  useEffect(() => {
    if (currentChainData.withdrawError) {
      toast.error('Withdrawal failed. Please try again.', {
        position: 'bottom-center',
        autoClose: 5000,
      });
      setIsProcessing(false);
    }
  }, [currentChainData.withdrawError]);

  if (!isOpen) return null;

  const handleWithdraw = async () => {
    if (!canWithdraw) return;

    setIsProcessing(true);
    try {
      await currentChainData.withdraw(withdrawAmount);
    } catch (error) {
      console.error('Withdrawal failed:', error);
      toast.error(error instanceof Error ? error.message : 'Withdrawal failed', {
        position: 'bottom-center',
        autoClose: 5000,
      });
      setIsProcessing(false);
    }
  };

  const handleWithdrawAll = async () => {
    if (currentChainData.depositBalance <= 0) return;

    setIsProcessing(true);
    try {
      await currentChainData.withdrawAll();
    } catch (error) {
      console.error('Withdraw all failed:', error);
      toast.error(error instanceof Error ? error.message : 'Withdrawal failed', {
        position: 'bottom-center',
        autoClose: 5000,
      });
      setIsProcessing(false);
    }
  };

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
            <span className="text-lg font-semibold text-white">💰 Withdraw Balance</span>
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
          {!hasAnyBalance ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-white text-lg font-medium mb-2">No Deposits Found</h3>
              <p className="text-neutral-400 text-sm mb-4">
                You don't have any USDC deposited in the automation contracts.
              </p>
              <button
                onClick={onClose}
                className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Chain Selection */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-white">🔗 Select Chain to Withdraw From</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {(['optimism', 'etherlink'] as const).map((chain) => {
                    const chainData = chain === 'optimism' ? optimism : etherlink;
                    return (
                      <button
                        key={chain}
                        onClick={() => setSelectedChain(chain)}
                        disabled={chainData.depositBalance <= 0}
                        className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                          chainData.depositBalance <= 0
                            ? 'bg-neutral-800 border-neutral-700 text-neutral-500 cursor-not-allowed'
                            : selectedChain === chain
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
                        }`}
                      >
                        <div className="font-medium text-sm mb-1">
                          {SUPPORTED_CHAINS[chain === 'optimism' ? 10 : 42793].name}
                        </div>
                        <div className="text-xs">
                          {chainData.depositBalance > 0 ? formatCost(chainData.depositBalance) : 'No balance'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Available Balance Summary */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-white">💰 Available Balances</span>
                </div>
                
                <div className="bg-neutral-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">U</div>
                      <span className="text-white text-sm">USDC ({SUPPORTED_CHAINS[currentChainData.chainId as keyof typeof SUPPORTED_CHAINS]?.name})</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm">{formatCost(currentChainData.depositBalance)}</div>
                      <div className={`text-xs ${
                        currentChainData.depositBalance > 0 ? 'text-green-500' : 'text-neutral-400'
                      }`}>
                        {currentChainData.depositBalance > 0 ? '✓ Available' : 'No balance'}
                      </div>
                    </div>
                  </div>
                  
                  {!currentChainData.isWhitelisted && (
                    <div className="flex items-center gap-2 p-2 bg-yellow-900/20 border border-yellow-700 rounded text-yellow-400 text-xs">
                      <AlertTriangle className="w-4 h-4" />
                      <span>USDC may not be whitelisted for withdrawal on this chain</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white">Withdrawal Amount</label>
                  <button
                    onClick={() => setAmount(currentChainData.depositBalance.toFixed(2))}
                    className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
                    disabled={currentChainData.depositBalance <= 0}
                  >
                    Max: {formatCost(currentChainData.depositBalance)}
                  </button>
                </div>
                
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    max={currentChainData.depositBalance}
                    step="0.01"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-4 pr-16 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 text-sm font-medium">
                    USDC
                  </div>
                </div>
                
                {withdrawAmount > currentChainData.depositBalance && (
                  <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Amount exceeds available balance</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {/* Withdraw Specific Amount */}
                <button 
                  onClick={handleWithdraw}
                  disabled={!canWithdraw || currentChainData.isWithdrawPending}
                  className={`font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    !canWithdraw || currentChainData.isWithdrawPending
                      ? 'bg-neutral-600 text-neutral-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  }`}
                >
                  {currentChainData.isWithdrawPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Withdrawing...
                    </>
                  ) : (
                    <>
                      <ArrowDownLeft className="w-4 h-4" />
                      Withdraw
                    </>
                  )}
                </button>

                {/* Withdraw All */}
                <button 
                  onClick={handleWithdrawAll}
                  disabled={currentChainData.depositBalance <= 0 || currentChainData.isWithdrawPending}
                  className={`font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    currentChainData.depositBalance <= 0 || currentChainData.isWithdrawPending
                      ? 'bg-neutral-600 text-neutral-300 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                  }`}
                >
                  {currentChainData.isWithdrawPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Withdrawing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4" />
                      Withdraw All
                    </>
                  )}
                </button>
              </div>
              
              {/* Total Balance Info */}
              <div className="mt-4 p-3 bg-neutral-800 rounded-lg">
                <div className="text-xs text-neutral-400 mb-1">Total Across All Chains</div>
                <div className="text-white font-medium">{formatCost(totalBalance)}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}