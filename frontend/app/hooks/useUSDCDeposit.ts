import { useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAutomationStore } from '~/stores/useAutomationStore';
import { CONTRACTS, USDC_ABI, DEPOSIT_CONTRACT_ABI, formatUSDC, parseUSDC } from '~/utils/contracts';
import type { SupportedChain } from '~/stores/useAutomationStore';

export function useUSDCDeposit() {
  const { address } = useAccount();
  const {
    selectedDepositChain,
    setUserDepositBalance,
    setIsDepositLoading,
    setDepositStatus,
  } = useAutomationStore();

  // Get chain ID from selected chain
  const chainId = selectedDepositChain === 'optimism' ? 10 : 42793;
  
  // Contract addresses for selected chain
  const usdcAddress = CONTRACTS.USDC[chainId as keyof typeof CONTRACTS.USDC];
  const depositAddress = CONTRACTS.DEPOSIT_CONTRACT[chainId as keyof typeof CONTRACTS.DEPOSIT_CONTRACT];

  // Read USDC balance
  const { data: usdcBalance, refetch: refetchUSDCBalance } = useReadContract({
    address: usdcAddress as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read USDC allowance for deposit contract
  const { data: usdcAllowance, refetch: refetchAllowance } = useReadContract({
    address: usdcAddress as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, depositAddress as `0x${string}`] : undefined,
    query: { enabled: !!address },
  });

  // Read deposit balance from contract
  const { data: depositBalance, refetch: refetchDepositBalance } = useReadContract({
    address: depositAddress as `0x${string}`,
    abi: DEPOSIT_CONTRACT_ABI,
    functionName: 'getBalance',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Write contracts
  const { writeContract: approveUSDC, data: approveHash, isPending: isApprovePending } = useWriteContract();
  const { writeContract: depositUSDC, data: depositHash, isPending: isDepositPending } = useWriteContract();

  // Wait for approve transaction
  const { isLoading: isApproveLoading, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Wait for deposit transaction
  const { isLoading: isDepositLoading, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({
    hash: depositHash,
  });

  // Update store with deposit balance
  useEffect(() => {
    if (depositBalance !== undefined) {
      const balance = formatUSDC(depositBalance as bigint);
      setUserDepositBalance(balance);
    }
  }, [depositBalance, setUserDepositBalance]);

  // Update loading state
  useEffect(() => {
    const isLoading = isApprovePending || isApproveLoading || isDepositPending || isDepositLoading;
    setIsDepositLoading(isLoading);
    
    if (isLoading) {
      setDepositStatus('loading');
    }
  }, [isApprovePending, isApproveLoading, isDepositPending, isDepositLoading, setIsDepositLoading, setDepositStatus]);

  // Refetch balances after successful transactions
  useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance();
    }
  }, [isApproveSuccess, refetchAllowance]);

  useEffect(() => {
    if (isDepositSuccess) {
      refetchDepositBalance();
      refetchUSDCBalance();
    }
  }, [isDepositSuccess, refetchDepositBalance, refetchUSDCBalance]);

  // Approve USDC spending
  const approveUSDCSpending = useCallback(async (amount: number) => {
    if (!address || !usdcAddress) return;

    const amountInWei = parseUSDC(amount);
    
    try {
      await approveUSDC({
        address: usdcAddress as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [depositAddress as `0x${string}`, amountInWei],
      });
    } catch (error) {
      console.error('Error approving USDC:', error);
      throw error;
    }
  }, [address, usdcAddress, depositAddress, approveUSDC]);

  // Deposit USDC
  const deposit = useCallback(async (amount: number) => {
    if (!address || !depositAddress) return;

    const amountInWei = parseUSDC(amount);
    
    try {
      await depositUSDC({
        address: depositAddress as `0x${string}`,
        abi: DEPOSIT_CONTRACT_ABI,
        functionName: 'deposit',
        args: [amountInWei],
      });
    } catch (error) {
      console.error('Error depositing USDC:', error);
      throw error;
    }
  }, [address, depositAddress, depositUSDC]);

  // Check if approval is needed
  const needsApproval = useCallback((amount: number) => {
    if (!usdcAllowance) return true;
    const requiredAmount = parseUSDC(amount);
    return (usdcAllowance as bigint) < requiredAmount;
  }, [usdcAllowance]);

  return {
    // Balances
    usdcBalance: usdcBalance ? formatUSDC(usdcBalance as bigint) : 0,
    depositBalance: depositBalance ? formatUSDC(depositBalance as bigint) : 0,
    allowance: usdcAllowance ? formatUSDC(usdcAllowance as bigint) : 0,
    
    // Actions
    approveUSDCSpending,
    deposit,
    needsApproval,
    
    // Status
    isApprovePending: isApprovePending || isApproveLoading,
    isDepositPending: isDepositPending || isDepositLoading,
    isApproveSuccess,
    isDepositSuccess,
    
    // Refetch functions
    refetchBalances: () => {
      refetchUSDCBalance();
      refetchDepositBalance();
      refetchAllowance();
    },

    // Chain info
    chainId,
    selectedChain: selectedDepositChain,
  };
}