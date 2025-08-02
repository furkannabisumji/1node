import { useEffect, useCallback, useRef } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAutomationStore } from '~/stores/useAutomationStore';
import { CONTRACTS, USDC_ABI, VAULT_ABI, formatUSDC, parseUSDC } from '~/utils/contracts';
import type { SupportedChain } from '~/stores/useAutomationStore';

export function useUSDCDeposit() {
  const { address } = useAccount();
  const depositSuccessProcessed = useRef(false);
  const {
    selectedDepositChain,
    setUserDepositBalance,
    setIsDepositLoading,
    setDepositStatus,
    forceStatusRecalculation,
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

  // Read vault balance from contract (user-specific)
  const { data: vaultBalance, refetch: refetchVaultBalance } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: VAULT_ABI,
    functionName: 'balances',
    args: [address as `0x${string}`, usdcAddress as `0x${string}`], // user address, token address
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
    console.log('Vault balance from contract:', vaultBalance);
    if (vaultBalance !== undefined) {
      const balance = formatUSDC(vaultBalance as bigint);
      console.log('Formatted vault balance:', balance);
      setUserDepositBalance(balance);
    }
  }, [vaultBalance, setUserDepositBalance]);
  // Update loading state
  useEffect(() => {
    const isLoading = isApprovePending || isApproveLoading || isDepositPending || isDepositLoading;
    setIsDepositLoading(isLoading);
    
    if (isLoading) {
      setDepositStatus('loading');
    } else if (!isLoading && !isDepositSuccess && !isApproveSuccess) {
      // Reset to calculated status when no longer loading (but not on success - handled elsewhere)
      forceStatusRecalculation();
    }
  }, [isApprovePending, isApproveLoading, isDepositPending, isDepositLoading, isDepositSuccess, isApproveSuccess, setIsDepositLoading, setDepositStatus, forceStatusRecalculation]);

  // Refetch balances after successful transactions
  useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance();
    }
  }, [isApproveSuccess, refetchAllowance]);

  useEffect(() => {
    if (isDepositSuccess && !depositSuccessProcessed.current) {
      depositSuccessProcessed.current = true;
      console.log('Deposit success detected, refetching balances...');
      
      // Refetch balances and force status recalculation
      const handleDepositSuccess = async () => {
        try {
          // Refetch the vault balance
          console.log('Refetching vault balance...');
          const { data: newVaultBalance } = await refetchVaultBalance();
          console.log('New vault balance from refetch:', newVaultBalance);
          
          await refetchUSDCBalance();
          
          // Update the store with the new balance
          if (newVaultBalance !== undefined) {
            const balance = formatUSDC(newVaultBalance as bigint);
            console.log('Setting user deposit balance to:', balance);
            setUserDepositBalance(balance);
          }
          
          // Force status recalculation after balance update
          setTimeout(() => {
            console.log('Forcing status recalculation...');
            forceStatusRecalculation();
            depositSuccessProcessed.current = false; // Reset for next deposit
          }, 100);
        } catch (error) {
          console.error('Error refetching balances after deposit:', error);
          depositSuccessProcessed.current = false; // Reset on error
          // Fallback: force status recalculation after delay
          setTimeout(() => {
            forceStatusRecalculation();
          }, 1000);
        }
      };
      
      handleDepositSuccess();
    }
  }, [isDepositSuccess, refetchVaultBalance, refetchUSDCBalance, setUserDepositBalance, forceStatusRecalculation]);

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