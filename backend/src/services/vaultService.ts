import { ethers } from 'ethers';
import { config, SUPPORTED_CHAINS } from '../config/index.js';
import { logger } from '../config/logger.js';
import VAULT_ABI from '../config/abi.json' with { type: 'json' };

export interface VaultBalance {
  token: string;
  balance: string;
  symbol: string;
  decimals: number;
}

export interface VaultTransaction {
  token: string;
  user: string;
  amount: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'FUSION_DEDUCT';
  txHash?: string;
}

class VaultService {
  private providers: Map<number, ethers.JsonRpcProvider>;
  private vaultContracts: Map<number, ethers.Contract>;
  private executorWallets: Map<number, ethers.Wallet>;

  constructor() {
    this.providers = new Map();
    this.vaultContracts = new Map();
    this.executorWallets = new Map();

    // Initialize providers, wallets, and contracts for supported chains
    this.initializeChain(SUPPORTED_CHAINS.OPTIMISM.id, SUPPORTED_CHAINS.OPTIMISM.rpcUrl, config.vaultContractAddress);
    this.initializeChain(SUPPORTED_CHAINS.ETHERLINK.id, SUPPORTED_CHAINS.ETHERLINK.rpcUrl, config.vaultContractAddressEtherlink);
  }

  private initializeChain(chainId: number, rpcUrl: string, contractAddress: string) {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const executorWallet = new ethers.Wallet(config.executorPrivateKey, provider);
      const vaultContract = new ethers.Contract(contractAddress, VAULT_ABI, executorWallet);

      this.providers.set(chainId, provider);
      this.executorWallets.set(chainId, executorWallet);
      this.vaultContracts.set(chainId, vaultContract);

      logger.info(`Initialized vault for chain ${chainId}`, { contractAddress, rpcUrl });
    } catch (error) {
      logger.error(`Failed to initialize chain ${chainId}:`, error);
    }
  }

  private getVaultContract(chainId: number): ethers.Contract {
    const contract = this.vaultContracts.get(chainId);
    if (!contract) {
      throw new Error(`Vault contract not initialized for chain ${chainId}`);
    }
    return contract;
  }

  private getProvider(chainId: number): ethers.JsonRpcProvider {
    const provider = this.providers.get(chainId);
    if (!provider) {
      throw new Error(`Provider not initialized for chain ${chainId}`);
    }
    return provider;
  }

  /**
   * Get supported chain IDs for vault operations
   */
  getSupportedChainIds(): number[] {
    return Array.from(this.vaultContracts.keys());
  }

  /**
   * Get vault contract address for a specific chain
   */
  async getVaultContractAddress(chainId: number): Promise<string> {
    const contract = this.vaultContracts.get(chainId);
    if (!contract) {
      throw new Error(`Vault contract not initialized for chain ${chainId}`);
    }
    return await contract.getAddress();
  }

  /**
   * Check if chain is supported for vault operations
   */
  isChainSupported(chainId: number): boolean {
    return this.vaultContracts.has(chainId);
  }

  /**
   * Check if user has sufficient balance for a swap
   */
  async checkSwapBalance(
    userAddress: string,
    tokenAddress: string,
    requiredAmount: string,
    chainId: number = SUPPORTED_CHAINS.OPTIMISM.id
  ): Promise<{ sufficient: boolean; currentBalance: string; required: string }> {
    try {
      logger.debug('Checking vault balance for swap', {
        userAddress,
        tokenAddress,
        requiredAmount,
        chainId
      });

      try {
        // Get chain-specific vault contract
        const vaultContract = this.getVaultContract(chainId);
        
        // Get user's vault balance for the token
        const balance = await vaultContract.balances(userAddress, tokenAddress);
        const balanceString = balance.toString();

        const sufficient = BigInt(balanceString) >= BigInt(requiredAmount);

        logger.debug('Vault balance check result', {
          userAddress,
          tokenAddress,
          currentBalance: balanceString,
          requiredAmount,
          sufficient
        });

        return {
          sufficient,
          currentBalance: balanceString,
          required: requiredAmount
        };

      } catch (contractError: any) {
        const contractAddress = chainId === SUPPORTED_CHAINS.ETHERLINK.id 
          ? config.vaultContractAddressEtherlink 
          : config.vaultContractAddress;
        
        logger.warn('Vault contract call failed, using fallback behavior', {
          error: contractError.message,
          userAddress,
          tokenAddress,
          chainId,
          vaultAddress: contractAddress
        });

        // For development/testing: assume user has sufficient balance
        // In production, you might want to fail here or check alternative sources
        logger.info('Using fallback: assuming sufficient balance for development');
        
        return {
          sufficient: true,
          currentBalance: requiredAmount, // Mock sufficient balance
          required: requiredAmount
        };
      }

    } catch (error) {
      logger.error('Failed to check vault balance:', error);
      throw new Error(`Vault balance check failed: ${error}`);
    }
  }

  /**
   * Update vault balance
   */
  async updateBalance(
    userAddress: string,
    tokenAddress: string,
    amount: string,
    chainId: number = SUPPORTED_CHAINS.OPTIMISM.id
  ): Promise<{ txHash: string; success: boolean }> {
    try {
      logger.info('Updating vault balance after swap', {
        userAddress,
        tokenAddress,
        amount,
        chainId
      });

      try {
        // Get chain-specific vault contract
        const vaultContract = this.getVaultContract(chainId);
        
        // Check if token is whitelisted
        const isWhitelisted = await vaultContract.isWhitelistedToken(tokenAddress);
        if (!isWhitelisted) {
          throw new Error(`Token ${tokenAddress} is not whitelisted in vault on chain ${chainId}`);
        }

        // Call updateBalance function (only owner can call this)
        const tx = await vaultContract.updateBalance(tokenAddress, userAddress, amount);
        const receipt = await tx.wait();

        logger.info('Vault balance updated successfully', {
          userAddress,
          tokenAddress,
          amount,
          txHash: receipt.hash
        });



        return {
          txHash: receipt.hash,
          success: true
        };

      } catch (contractError: any) {
        logger.warn('Vault contract update failed, using fallback behavior', {
          error: contractError.message,
          userAddress,
          tokenAddress,
          amount
        });
        return {
          txHash: '',
          success: false
        };
      }

    } catch (error) {
      logger.error('Failed to update vault balance:', error);
      throw new Error(`Vault balance update failed: ${error}`);
    }
  }

  /**
   * Get user's vault balances for multiple tokens
   */
  async getUserVaultBalances(
    userAddress: string,
    tokenAddresses: string[],
    chainId: number = SUPPORTED_CHAINS.OPTIMISM.id
  ): Promise<VaultBalance[]> {
    try {
      logger.debug('Getting user vault balances', {
        userAddress,
        tokenCount: tokenAddresses.length,
        chainId
      });

      const vaultContract = this.getVaultContract(chainId);
      const balances: VaultBalance[] = [];

      for (const tokenAddress of tokenAddresses) {
        try {
          const balance = await vaultContract.balances(userAddress, tokenAddress);
          
          // Get token info (simplified - in production you'd fetch from token contract)
          const tokenInfo = this.getTokenInfo(tokenAddress);
          
          balances.push({
            token: tokenAddress,
            balance: balance.toString(),
            symbol: tokenInfo.symbol,
            decimals: tokenInfo.decimals
          });

        } catch (tokenError) {
          logger.warn(`Failed to get balance for token ${tokenAddress}:`, tokenError);
        }
      }

      logger.debug(`Retrieved ${balances.length} vault balances for user ${userAddress}`);
      return balances;

    } catch (error) {
      logger.error('Failed to get user vault balances:', error);
      throw new Error(`Failed to get vault balances: ${error}`);
    }
  }

  /**
   * Check if token is whitelisted in vault
   */
  async isTokenWhitelisted(tokenAddress: string, chainId: number = SUPPORTED_CHAINS.OPTIMISM.id): Promise<boolean> {
    try {
      const vaultContract = this.getVaultContract(chainId);
      const isWhitelisted = await vaultContract.isWhitelistedToken(tokenAddress);
      return isWhitelisted;
    } catch (error) {
      logger.error(`Failed to check token whitelist status on chain ${chainId}:`, error);
      return false;
    }
  }

  /**
   * Handle vault operations for FUSION_ORDER
   */
  async handleFusionOrderVault(
    userAddress: string,
    fromTokenAddress: string,
    amount: string,
    fromChain: number,
    chainId: number = SUPPORTED_CHAINS.OPTIMISM.id
  ): Promise<{ reserved: boolean; reservationId?: string }> {
    try {
      logger.info('Handling vault for Fusion order', {
        userAddress,
        fromTokenAddress,
        amount,
        fromChain,
        chainId
      });

      // Check if user has sufficient balance
      const balanceCheck = await this.checkSwapBalance(userAddress, fromTokenAddress, amount, chainId);
      
      if (!balanceCheck.sufficient) {
        logger.warn('Insufficient vault balance for Fusion order', {
          userAddress,
          required: amount,
          available: balanceCheck.currentBalance
        });
        
        return { reserved: false };
      }

      // Fill the vault balance
      await this.updateBalance(userAddress, fromTokenAddress, amount, chainId);

      logger.info('Vault balance reserved for Fusion order', {
        userAddress,
        amount,
      });

      return {
        reserved: true,
      };

    } catch (error) {
      logger.error('Failed to handle Fusion order vault:', error);
      throw new Error(`Fusion order vault handling failed: ${error}`);
    }
  }

  /**
   * Get vault transaction history for a user
   */
  async getVaultTransactionHistory(
    userAddress: string,
    limit: number = 50
  ): Promise<VaultTransaction[]> {
    try {
      // In a real implementation, you'd store these in the database
      // For now, return empty array as transactions are stored separately
      return [];
    } catch (error) {
      logger.error('Failed to get vault transaction history:', error);
      throw new Error(`Failed to get transaction history: ${error}`);
    }
  }

  /**
   * Get token info (simplified)
   */
  private getTokenInfo(tokenAddress: string): { symbol: string; decimals: number } {
    // Simplified token info - in production you'd fetch from token contract or cache
    const knownTokens: Record<string, { symbol: string; decimals: number }> = {
      '0xA0b86a33E6Fe3c4c4b389F8b4af2218D6e8E58D3': { symbol: 'USDC', decimals: 6 },
      '0xdAC17F958D2ee523a2206206994597C13D831ec7': { symbol: 'USDT', decimals: 6 },
      '0x0000000000000000000000000000000000000000': { symbol: 'ETH', decimals: 18 }
    };

    return knownTokens[tokenAddress] || { symbol: 'TOKEN', decimals: 18 };
  }

  /**
   * Format token amount for display
   */
  formatTokenAmount(amount: string, decimals: number): string {
    return ethers.formatUnits(amount, decimals);
  }

  /**
   * Parse token amount to wei
   */
  parseTokenAmount(amount: string, decimals: number): string {
    return ethers.parseUnits(amount, decimals).toString();
  }
}

export const vaultService = new VaultService(); 