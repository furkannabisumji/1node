import { useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAutomationStore } from '~/stores/useAutomationStore';
import { CONTRACTS, USDC_ABI, VAULT_ABI, formatUSDC, parseUSDC } from '~/utils/contracts';
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
  const vaultAddress = CONTRACTS.VAULT[chainId as keyof typeof CONTRACTS.VAULT];

  // Read USDC balance
  const { data: usdcBalance, refetch: refetchUSDCBalance } = useReadContract({
    address: usdcAddress as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read USDC allowance for vault contract
  const { data: usdcAllowance, refetch: refetchAllowance } = useReadContract({
    address: usdcAddress as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, vaultAddress as `0x${string}`] : undefined,
    query: { enabled: !!address },
  });

  // Read vault balance from contract (token-specific)
  const { data: vaultBalance, refetch: refetchVaultBalance } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: VAULT_ABI,
    functionName: 'getBalance',
    args: [usdcAddress as `0x${string}`], // Pass token address
    query: { enabled: !!address && !!usdcAddress },
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

  // Update store with vault balance
  useEffect(() => {
    if (vaultBalance !== undefined) {
      const balance = formatUSDC(vaultBalance as bigint);
      setUserDepositBalance(balance);
    }
  }, [vaultBalance, setUserDepositBalance]);

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
      refetchVaultBalance();
      refetchUSDCBalance();
    }
  }, [isDepositSuccess, refetchVaultBalance, refetchUSDCBalance]);

  // Approve USDC spending
  const approveUSDCSpending = useCallback(async (amount: number) => {
    if (!address || !usdcAddress) return;

    const amountInWei = parseUSDC(amount);
    
    try {
      await approveUSDC({
        address: usdcAddress as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [vaultAddress as `0x${string}`, amountInWei],
      });
    } catch (error) {
      console.error('Error approving USDC:', error);
      throw error;
    }
  }, [address, usdcAddress, vaultAddress, approveUSDC]);

  // Deposit USDC to vault
  const deposit = useCallback(async (amount: number) => {
    if (!address || !vaultAddress || !usdcAddress) return;

    const amountInWei = parseUSDC(amount);
    
    try {
      await depositUSDC({
        address: vaultAddress as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'deposit',
        args: [usdcAddress as `0x${string}`, amountInWei], // token address + amount
      });
    } catch (error) {
      console.error('Error depositing USDC to vault:', error);
      throw error;
    }
  }, [address, vaultAddress, usdcAddress, depositUSDC]);

  // Check if approval is needed
  const needsApproval = useCallback((amount: number) => {
    if (!usdcAllowance) return true;
    const requiredAmount = parseUSDC(amount);
    return (usdcAllowance as bigint) < requiredAmount;
  }, [usdcAllowance]);

  return {
    // Balances
    usdcBalance: usdcBalance ? formatUSDC(usdcBalance as bigint) : 0,
    vaultBalance: vaultBalance ? formatUSDC(vaultBalance as bigint) : 0,
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
      refetchVaultBalance();
      refetchAllowance();
    },

    // Chain info
    chainId,
    selectedChain: selectedDepositChain,
  };
}