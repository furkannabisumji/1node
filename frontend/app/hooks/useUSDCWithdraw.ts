import { useCallback, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAutomationStore } from '~/stores/useAutomationStore';
import { CONTRACTS, VAULT_ABI, formatUSDC, parseUSDC } from '~/utils/contracts';
import type { SupportedChain } from '~/stores/useAutomationStore';

export function useUSDCWithdraw(selectedChain: SupportedChain = 'optimism') {
  const { address } = useAccount();

  // Get chain ID from selected chain
  const chainId = selectedChain === 'optimism' ? 10 : 42793;
  
  // Contract addresses for selected chain
  const usdcAddress = CONTRACTS.USDC[chainId as keyof typeof CONTRACTS.USDC];
  const vaultAddress = CONTRACTS.VAULT[chainId as keyof typeof CONTRACTS.VAULT];

  // Read vault balance from contract
  const { data: vaultBalance, refetch: refetchVaultBalance } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: VAULT_ABI,
    functionName: 'getBalance',
    args: [usdcAddress as `0x${string}`], // Pass USDC token address
    query: { enabled: !!address && !!usdcAddress },
  });

  // Check if token is whitelisted (optional check)
  const { data: isWhitelisted } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: VAULT_ABI,
    functionName: 'isWhitelistedToken',
    args: [usdcAddress as `0x${string}`],
    query: { enabled: !!usdcAddress },
  });

  // Write contract for withdrawal
  const { writeContract: withdrawUSDC, data: withdrawHash, isPending: isWithdrawPending } = useWriteContract();

  // Wait for withdrawal transaction
  const { isLoading: isWithdrawLoading, isSuccess: isWithdrawSuccess, error: withdrawError } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  });

  // Withdraw USDC from vault
  const withdraw = useCallback(async (amount: number) => {
    if (!address || !vaultAddress || !usdcAddress) {
      throw new Error('Missing required addresses');
    }

    if (!isWhitelisted) {
      throw new Error('USDC is not whitelisted for withdrawal');
    }

    const currentBalance = vaultBalance ? formatUSDC(vaultBalance as bigint) : 0;
    if (amount > currentBalance) {
      throw new Error(`Insufficient balance. Available: ${currentBalance.toFixed(2)} USDC`);
    }

    const amountInWei = parseUSDC(amount);
    
    try {
      await withdrawUSDC({
        address: vaultAddress as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'withdraw',
        args: [usdcAddress as `0x${string}`, amountInWei], // token address + amount
      });
    } catch (error) {
      console.error('Error withdrawing USDC from vault:', error);
      throw error;
    }
  }, [address, vaultAddress, usdcAddress, isWhitelisted, vaultBalance, withdrawUSDC]);

  // Withdraw all available balance
  const withdrawAll = useCallback(async () => {
    if (!vaultBalance) {
      throw new Error('No balance to withdraw');
    }
    
    const balance = formatUSDC(vaultBalance as bigint);
    await withdraw(balance);
  }, [vaultBalance, withdraw]);

  // Refetch balance after successful withdrawal
  useEffect(() => {
    if (isWithdrawSuccess) {
      refetchVaultBalance();
    }
  }, [isWithdrawSuccess, refetchVaultBalance]);

  return {
    // Balances
    vaultBalance: vaultBalance ? formatUSDC(vaultBalance as bigint) : 0,
    hasBalance: vaultBalance ? formatUSDC(vaultBalance as bigint) > 0 : false,
    
    // Token status
    isWhitelisted: !!isWhitelisted,
    
    // Actions
    withdraw,
    withdrawAll,
    
    // Status
    isWithdrawPending: isWithdrawPending || isWithdrawLoading,
    isWithdrawSuccess,
    withdrawError,
    
    // Refetch function
    refetchBalance: refetchVaultBalance,

    // Chain info
    chainId,
    selectedChain,
    usdcAddress,
    vaultAddress,
  };
}

// Hook for getting balances across all chains
export function useMultiChainWithdrawals() {
  const optimismWithdraw = useUSDCWithdraw('optimism');
  const etherlinkWithdraw = useUSDCWithdraw('etherlink');

  const totalBalance = optimismWithdraw.vaultBalance + etherlinkWithdraw.vaultBalance;
  const hasAnyBalance = optimismWithdraw.hasBalance || etherlinkWithdraw.hasBalance;

  return {
    optimism: optimismWithdraw,
    etherlink: etherlinkWithdraw,
    totalBalance,
    hasAnyBalance,
    
    // Refetch all balances
    refetchAll: () => {
      optimismWithdraw.refetchBalance();
      etherlinkWithdraw.refetchBalance();
    },
  };
}